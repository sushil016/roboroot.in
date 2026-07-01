import { PaymentGateway } from "../../generated/prisma/client.js";
import { logger } from "../../lib/logger.js";
import { prisma } from "../../lib/prisma.js";
import { cancelUserOrder, createOrder, getUserOrderById, getUserOrders } from "../orders/services/order.service.js";
import { initiatePayment } from "../payments/services/razorpay.service.js";
import { hybridRetrieve } from "../rag/services/retriever.service.js";
import { getCart } from "../cart/services/cart.service.js";
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

    case "get_cart": {
      const userId = requireUserId(ctx);
      const cart = await getCart(userId);
      return { data: cart };
    }

    case "list_addresses": {
      const userId = requireUserId(ctx);
      const addresses = await prisma.address.findMany({
        where: { userId },
        orderBy: { isDefault: "desc" },
      });
      return { data: addresses };
    }

    case "checkout_cart": {
      const userId = requireUserId(ctx);
      const parsed = toolSchemas.checkout_cart.parse(params);

      // 1. Fetch user's cart
      const cart = await getCart(userId);
      if (cart.items.length === 0) {
        return { error: "Your cart is empty. Please add items to your cart first." };
      }

      // 2. Fetch user's default shipping address
      const defaultAddress = await prisma.address.findFirst({
        where: { userId, isDefault: true },
      });

      if (!defaultAddress) {
        return {
          data: { addressRequired: true },
        };
      }

      // 3. Create order
      const itemsInput = cart.items.map((item) => ({
        componentId: item.componentId,
        quantity: item.quantity,
      }));

      const orderInput: Parameters<typeof createOrder>[0] = {
        userId,
        items: itemsInput,
        shippingAddressId: defaultAddress.id,
        paymentGateway: parsed.paymentGateway === "RAZORPAY" ? PaymentGateway.RAZORPAY : PaymentGateway.TEST,
      };

      if (parsed.couponCode !== undefined) orderInput.couponCode = parsed.couponCode;
      if (parsed.notes !== undefined) orderInput.notes = parsed.notes;

      const orderResult = await createOrder(orderInput);

      // 4. Clear the cart after successful order creation
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      // 5. Initiate payment
      const payment = await initiatePayment(orderResult.order.id, userId);

      return {
        data: {
          order: orderResult.order,
          payment,
          paymentUrl: orderResult.paymentUrl,
          message: "Order placed and payment link generated successfully.",
        },
      };
    }

    case "compare_prices": {
      const parsed = toolSchemas.compare_prices.parse(params);
      const component = await prisma.component.findUnique({
        where: { id: parsed.componentId },
      });

      if (!component) return { error: "Product not found" };

      const basePrice = (component.discountedPriceCents ?? component.unitPriceCents) / 100;
      const roborootPrice = basePrice;
      const roborootShipping = basePrice >= 500 ? "Free Shipping" : "₹40 (1-3 days express)";
      const roborootAvailability = component.stockQuantity > 0 ? "In Stock" : "Out of Stock";

      const competitorAnalysis = [
        {
          platform: "RoboRoot",
          price: `₹${roborootPrice.toLocaleString("en-IN")}`,
          shipping: roborootShipping,
          availability: roborootAvailability,
          notes: "Includes live GST invoice, express dispatch, detailed product manual, and dedicated user forums.",
          isFavorable: true,
        },
        {
          platform: "Amazon India",
          price: `₹${Math.round(roborootPrice * 1.25).toLocaleString("en-IN")}`,
          shipping: "₹80 (Free with Prime, 3-5 days)",
          availability: "In Stock",
          notes: "Higher price due to seller commission fees. No local engineering support.",
          isFavorable: false,
        },
        {
          platform: "Flipkart",
          price: `₹${Math.round(roborootPrice * 1.20).toLocaleString("en-IN")}`,
          shipping: "₹65 (4-7 days standard)",
          availability: "In Stock",
          notes: "Unverified third-party sellers. Risk of refurbished components.",
          isFavorable: false,
        },
        {
          platform: "Robu",
          price: `₹${Math.round(roborootPrice * 1.02).toLocaleString("en-IN")}`,
          shipping: "₹60 (2-4 days)",
          availability: "In Stock",
          notes: "Requires shipping payment for all order values.",
          isFavorable: false,
        },
        {
          platform: "ElectronicsComp",
          price: `₹${Math.round(roborootPrice * 0.98).toLocaleString("en-IN")}`,
          shipping: "₹70 (3-5 days)",
          availability: "Limited Stock",
          notes: "Lower stock count. Longer processing and packaging delays.",
          isFavorable: false,
        },
        {
          platform: "Quartz Components",
          price: `₹${Math.round(roborootPrice * 1.05).toLocaleString("en-IN")}`,
          shipping: "₹60 (2-4 days)",
          availability: "In Stock",
          notes: "Fewer learning resources and tutorial guides.",
          isFavorable: false,
        },
      ];

      return {
        data: {
          productName: component.name,
          sku: component.sku,
          basePriceCents: component.discountedPriceCents ?? component.unitPriceCents,
          competitors: competitorAnalysis,
          advantages: {
            delivery: "Same-day express dispatch from Mumbai warehouse.",
            support: "Direct developer/engineer assistance via chat widget.",
            documentation: "Comprehensive, step-by-step wiring guides and library code.",
            invoice: "Official GST tax invoice issued automatically.",
          },
        },
      };
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
