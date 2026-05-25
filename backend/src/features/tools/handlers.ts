import { PaymentGateway } from "../../generated/prisma/client.js";
import { logger } from "../../lib/logger.js";
import { prisma } from "../../lib/prisma.js";
import { cancelUserOrder, createOrder, getUserOrderById, getUserOrders } from "../orders/services/order.service.js";
import { initiatePayment, verifyAndConfirmPayment } from "../payments/services/razorpay.service.js";
import { hybridRetrieve } from "../rag/services/retriever.service.js";
import { canUseTool } from "./permissions.js";
import { toolSchemas } from "./schemas.js";
import type { ToolCallAuditRecord, ToolContext, ToolName, ToolResult } from "./types.js";

export async function executeTool(tool: ToolName, params: unknown, ctx: ToolContext): Promise<ToolResult<unknown>> {
  const startedAt = Date.now();

  try {
    if (!canUseTool(tool, ctx.role)) {
      return { error: "Permission denied for this tool" };
    }

    const result = await executeValidatedTool(tool, params, ctx);
    auditToolCall(tool, ctx, params, "error" in result ? "error" : "success", Date.now() - startedAt);
    return result;
  } catch (error) {
    auditToolCall(tool, ctx, params, "error", Date.now() - startedAt);
    return {
      error: error instanceof Error ? error.message : "Tool execution failed",
    };
  }
}

async function executeValidatedTool(tool: ToolName, params: unknown, ctx: ToolContext): Promise<ToolResult<unknown>> {
  switch (tool) {
    case "search_products": {
      const parsed = toolSchemas.search_products.parse(params);
      const result = await hybridRetrieve(parsed.query);
      return { data: result };
    }

    case "place_order": {
      const userId = requireUserId(ctx);
      const parsed = toolSchemas.place_order.parse(params);
      const orderInput: Parameters<typeof createOrder>[0] = {
        userId,
        items: parsed.items,
        paymentGateway: parsed.paymentGateway === "RAZORPAY" ? PaymentGateway.RAZORPAY : PaymentGateway.TEST,
      };

      if (parsed.shippingAddress) {
        orderInput.shippingAddress = normalizeShippingAddress(parsed.shippingAddress);
      }
      if (parsed.shippingAddressId !== undefined) orderInput.shippingAddressId = parsed.shippingAddressId;
      if (parsed.couponCode !== undefined) orderInput.couponCode = parsed.couponCode;
      if (parsed.notes !== undefined) orderInput.notes = parsed.notes;

      const result = await createOrder(orderInput);
      return { data: result };
    }

    case "initiate_payment": {
      const userId = requireUserId(ctx);
      const parsed = toolSchemas.initiate_payment.parse(params);
      return { data: await initiatePayment(parsed.orderId, userId, parsed.idempotencyKey) };
    }

    case "verify_payment": {
      const userId = requireUserId(ctx);
      const parsed = toolSchemas.verify_payment.parse(params);
      await verifyAndConfirmPayment(
        parsed.orderId,
        userId,
        parsed.razorpayOrderId,
        parsed.razorpayPaymentId,
        parsed.razorpaySignature,
      );
      return { data: { verified: true, orderId: parsed.orderId } };
    }

    case "get_invoice": {
      const userId = requireUserId(ctx);
      const parsed = toolSchemas.get_invoice.parse(params);
      const order = await getUserOrderById(userId, parsed.orderId);
      if (!order) return { error: "Order not found" };
      return { data: { orderId: parsed.orderId, invoiceUrl: `/api/orders/${parsed.orderId}/invoice` } };
    }

    case "track_order": {
      const userId = requireUserId(ctx);
      const parsed = toolSchemas.track_order.parse(params);
      const order = await getUserOrderById(userId, parsed.orderId);
      if (!order) return { error: "Order not found" };
      return {
        data: {
          orderId: order.id,
          status: order.status,
          trackingAwb: order.trackingAwb,
          trackingUrl: order.trackingUrl,
          shippedAt: order.shippedAt,
          deliveredAt: order.deliveredAt,
        },
      };
    }

    case "get_order_history": {
      const userId = requireUserId(ctx);
      const parsed = toolSchemas.get_order_history.parse(params);
      const orders = await getUserOrders(userId);
      return { data: orders.slice(0, parsed.limit ?? 10) };
    }

    case "cancel_order": {
      const userId = requireUserId(ctx);
      const parsed = toolSchemas.cancel_order.parse(params);
      return { data: await cancelUserOrder(userId, parsed.orderId) };
    }

    case "get_product_details": {
      const parsed = toolSchemas.get_product_details.parse(params);
      const component = await prisma.component.findUnique({
        where: { id: parsed.componentId },
        include: {
          media: true,
          reviews: {
            where: { isApproved: true },
            take: 10,
            orderBy: { createdAt: "desc" },
          },
        },
      });

      if (!component) return { error: "Product not found" };

      const relations = await prisma.$queryRaw<Array<{ targetComponentId: string; type: string }>>`
        SELECT "targetComponentId", LOWER("type"::text) AS "type"
        FROM "ComponentRelation"
        WHERE "sourceComponentId" = ${parsed.componentId}
        LIMIT 20
      `;

      return { data: { component, relations } };
    }
  }
}

function requireUserId(ctx: ToolContext): string {
  if (!ctx.userId) {
    throw new Error("Authentication is required for this tool");
  }

  return ctx.userId;
}

function normalizeShippingAddress(
  address: NonNullable<ReturnType<typeof toolSchemas.place_order.parse>["shippingAddress"]>,
): NonNullable<Parameters<typeof createOrder>[0]["shippingAddress"]> {
  const normalized: NonNullable<Parameters<typeof createOrder>[0]["shippingAddress"]> = {
    name: address.name,
    phone: address.phone,
    line1: address.line1,
    city: address.city,
    state: address.state,
    pincode: address.pincode,
  };

  if (address.line2 !== undefined) normalized.line2 = address.line2;
  if (address.country !== undefined) normalized.country = address.country;

  return normalized;
}

function auditToolCall(
  tool: ToolName,
  ctx: ToolContext,
  params: unknown,
  result: ToolCallAuditRecord["result"],
  durationMs: number,
): void {
  const record: ToolCallAuditRecord = {
    tool,
    userId: ctx.userId,
    params: redactParams(params),
    result,
    durationMs,
    createdAt: new Date().toISOString(),
  };

  logger.info("tool call", { ...record });
}

function redactParams(params: unknown): Record<string, unknown> {
  if (!params || typeof params !== "object" || Array.isArray(params)) return {};

  const redacted: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(params)) {
    const normalizedKey = key.toLowerCase();
    if (normalizedKey.includes("signature") || normalizedKey.includes("paymentid")) {
      redacted[key] = "[redacted]";
    } else {
      redacted[key] = value;
    }
  }

  return redacted;
}
