export const CHAT_STORAGE_KEY = "robo-gig.chat.history" as const;
export const CHAT_SESSION_KEY = "robo-gig.chat.session-id" as const;

export * from "./components/ChatWidget";
export * from "./components/InputBar";
export * from "./components/InvoiceCard";
export * from "./components/MessageBubble";
export * from "./components/MessageContent";
export * from "./components/MessageList";
export * from "./components/OrderCard";
export * from "./components/PaymentCard";
export * from "./components/ProductCard";
export * from "./components/ProductCompareBar";
export * from "./components/QuickReplies";
export * from "./components/SlashCommandPopup";
export * from "./hooks/useChatStream";
export * from "./hooks/useCompare";
export * from "./services/chat.service";
export type * from "./types/chat.types";
