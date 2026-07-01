export type ChatMessageRole = "user" | "assistant";
export type ChatStreamEventType =
  | "status"
  | "delta"
  | "product"
  | "citation"
  | "order"
  | "payment"
  | "invoice"
  | "done"
  | "error"
  | "address_required";
export type ChatFeedback = "up" | "down" | null;
export type StockStatus = "inStock" | "lowStock" | "outOfStock";
export type OrderCardStatus = "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";

export interface ChatProductCard {
  id: string;
  name: string;
  priceCents: number;
  imageUrl?: string;
  href: string;
  stockStatus?: StockStatus;
  category?: string;
  brand?: string;
  compatibility?: string[];
  sku?: string;
  description?: string;
  specs?: Record<string, string>;
}

export interface ChatOrderCard {
  orderId: string;
  status: OrderCardStatus;
  items: Array<{ name: string; qty: number; priceCents: number }>;
  totalCents: number;
  estimatedDelivery?: string;
  trackingUrl?: string;
}

export interface ChatPaymentCard {
  orderId: string;
  amountCents: number;
  razorpayOrderId?: string;
  currency?: string;
}

export interface ChatInvoiceCard {
  orderId: string;
  invoiceId?: string;
  issuedAt?: string;
  totalCents: number;
  downloadUrl?: string;
  previewUrl?: string;
}

export interface ChatCitation {
  sourceType: "product" | "document" | "project";
  title: string;
  pageLabel?: string;
  href?: string;
}

export interface ChatMessage {
  id: string;
  role: ChatMessageRole;
  content: string;
  createdAt: string;
  products: ChatProductCard[];
  citations: ChatCitation[];
  orderCards: ChatOrderCard[];
  paymentCards: ChatPaymentCard[];
  invoiceCards: ChatInvoiceCard[];
  actionLabel?: string;
  actionHref?: string;
  feedback?: ChatFeedback;
  isError?: boolean;
  isRateLimited?: boolean;
  retryContent?: string;
  isOfflineQueued?: boolean;
  isCancelled?: boolean;
  addressFormRequired?: boolean;
}

export interface ChatStreamEvent {
  type: ChatStreamEventType;
  status?: string;
  text?: string;
  product?: ChatProductCard;
  citation?: ChatCitation;
  order?: ChatOrderCard;
  payment?: ChatPaymentCard;
  invoice?: ChatInvoiceCard;
  error?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  messages: ChatMessage[];
}

