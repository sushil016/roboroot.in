import type { ToolName } from "./types.js";

export interface ClaudeToolDefinition {
  name: ToolName;
  description: string;
  input_schema: {
    type: "object";
    properties: Record<string, unknown>;
    required?: string[];
    additionalProperties: false;
  };
}

export const toolRegistry: ClaudeToolDefinition[] = [
  {
    name: "search_products",
    description: "Search RoboRoot products, projects, documents, and related compatibility context.",
    input_schema: {
      type: "object",
      properties: {
        query: { type: "string" },
      },
      required: ["query"],
      additionalProperties: false,
    },
  },
  {
    name: "place_order",
    description: "Create an order for the authenticated user from component IDs and quantities.",
    input_schema: {
      type: "object",
      properties: {
        items: {
          type: "array",
          items: {
            type: "object",
            properties: {
              componentId: { type: "string" },
              quantity: { type: "number" },
            },
            required: ["componentId", "quantity"],
            additionalProperties: false,
          },
        },
        shippingAddressId: { type: "string" },
        shippingAddress: { type: "object" },
        couponCode: { type: "string" },
        notes: { type: "string" },
        paymentGateway: { type: "string", enum: ["TEST", "RAZORPAY"] },
      },
      required: ["items"],
      additionalProperties: false,
    },
  },
  {
    name: "initiate_payment",
    description: "Create or reuse a Razorpay order for an authenticated user's pending order.",
    input_schema: {
      type: "object",
      properties: {
        orderId: { type: "string" },
        idempotencyKey: { type: "string" },
      },
      required: ["orderId"],
      additionalProperties: false,
    },
  },
  {
    name: "get_invoice",
    description: "Return the invoice download endpoint for an authenticated user's order after ownership checks.",
    input_schema: {
      type: "object",
      properties: {
        orderId: { type: "string" },
      },
      required: ["orderId"],
      additionalProperties: false,
    },
  },
  {
    name: "track_order",
    description: "Return order status and shipping tracking details for an authenticated user's order.",
    input_schema: {
      type: "object",
      properties: {
        orderId: { type: "string" },
      },
      required: ["orderId"],
      additionalProperties: false,
    },
  },
  {
    name: "get_order_history",
    description: "Return up to the last 10 orders for the authenticated user.",
    input_schema: {
      type: "object",
      properties: {
        limit: { type: "number" },
      },
      additionalProperties: false,
    },
  },
  {
    name: "cancel_order",
    description: "Cancel an authenticated user's order if it is still cancellable.",
    input_schema: {
      type: "object",
      properties: {
        orderId: { type: "string" },
      },
      required: ["orderId"],
      additionalProperties: false,
    },
  },
  {
    name: "get_product_details",
    description: "Fetch full component details and graph relation IDs for a product.",
    input_schema: {
      type: "object",
      properties: {
        componentId: { type: "string" },
      },
      required: ["componentId"],
      additionalProperties: false,
    },
  },
  {
    name: "get_cart",
    description: "Get the current items in the user's shopping cart.",
    input_schema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
  },
  {
    name: "list_addresses",
    description: "List the shipping addresses saved for the authenticated user.",
    input_schema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
  },
  {
    name: "checkout_cart",
    description: "Checkout the user's current shopping cart, create the order, and initiate payment. Uses the default shipping address.",
    input_schema: {
      type: "object",
      properties: {
        couponCode: { type: "string" },
        notes: { type: "string" },
        paymentGateway: { type: "string", enum: ["TEST", "RAZORPAY"] },
      },
      additionalProperties: false,
    },
  },
  {
    name: "compare_prices",
    description: "Fetch competitor price analysis details (Amazon, Flipkart, Robu, ElectronicsComp, Quartz Components) for a RoboRoot product.",
    input_schema: {
      type: "object",
      properties: {
        componentId: { type: "string" },
      },
      required: ["componentId"],
      additionalProperties: false,
    },
  },
];
