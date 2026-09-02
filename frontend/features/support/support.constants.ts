import type {
  KnowledgeCategory,
  TicketCategory,
  TicketPriority,
  TicketStatus,
} from "./types";

export const knowledgeCategories: Array<{ value: KnowledgeCategory; label: string; description: string }> = [
  { value: "GENERAL", label: "FAQ", description: "Accounts, payments, and support basics" },
  { value: "SHIPPING", label: "Shipping", description: "Dispatch, delivery, and tracking" },
  { value: "RETURNS", label: "Returns", description: "Eligibility, refunds, and replacements" },
  { value: "PRODUCT", label: "Products", description: "Stock, specifications, and compatibility" },
  { value: "TROUBLESHOOTING", label: "Troubleshooting", description: "Practical checks for common issues" },
];

export const ticketCategories: Array<{ value: TicketCategory; label: string }> = [
  { value: "ORDER", label: "Order help" },
  { value: "SHIPPING", label: "Shipping" },
  { value: "RETURNS_REFUNDS", label: "Returns or refund" },
  { value: "PRODUCT", label: "Product question" },
  { value: "TECHNICAL", label: "Technical support" },
  { value: "OTHER", label: "Something else" },
];

export const priorityOptions: Array<{ value: TicketPriority; label: string; response: string }> = [
  { value: "URGENT", label: "Urgent", response: "Target response: 2 hours" },
  { value: "HIGH", label: "High", response: "Target response: 8 hours" },
  { value: "MEDIUM", label: "Medium", response: "Target response: 24 hours" },
  { value: "LOW", label: "Low", response: "Target response: 48 hours" },
];

export const statusLabels: Record<TicketStatus, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In progress",
  WAITING_FOR_CUSTOMER: "Waiting for you",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};

export function labelEnum(value: string) {
  return value.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function ticketEmailStorageKey(ticketNumber: string) {
  return `roboroot_support_email_${ticketNumber.toUpperCase()}`;
}
