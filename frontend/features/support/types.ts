export type TicketPriority = "URGENT" | "HIGH" | "MEDIUM" | "LOW";
export type TicketStatus = "OPEN" | "IN_PROGRESS" | "WAITING_FOR_CUSTOMER" | "RESOLVED" | "CLOSED";
export type TicketCategory = "ORDER" | "SHIPPING" | "RETURNS_REFUNDS" | "PRODUCT" | "TECHNICAL" | "OTHER";
export type TicketMessageSender = "CUSTOMER" | "SUPPORT" | "SYSTEM";
export type KnowledgeCategory = "GENERAL" | "SHIPPING" | "RETURNS" | "PRODUCT" | "TROUBLESHOOTING";

export type TicketMessage = {
  id: string;
  sender: TicketMessageSender;
  authorName: string | null;
  body: string;
  createdAt: string;
};

export type SupportTicket = {
  id: string;
  ticketNumber: string;
  userId: string | null;
  orderId: string | null;
  requesterName: string;
  requesterEmail: string;
  category: TicketCategory;
  subject: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  firstResponseDueAt: string;
  resolutionDueAt: string;
  firstRespondedAt: string | null;
  resolvedAt: string | null;
  lastActivityAt: string;
  createdAt: string;
  updatedAt: string;
  assignedTo?: { name: string | null } | null;
  order?: { id: string; status: string; totalAmountCents?: number } | null;
  messages?: TicketMessage[];
  _count?: { messages: number };
};

export type KnowledgeArticleSummary = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: KnowledgeCategory;
  isFeatured: boolean;
  viewCount: number;
  updatedAt: string;
};

export type KnowledgeArticle = KnowledgeArticleSummary & {
  content: string;
};

export type CreateTicketPayload = {
  name: string;
  email: string;
  category: TicketCategory;
  priority: TicketPriority;
  subject: string;
  description: string;
  orderId?: string;
};
