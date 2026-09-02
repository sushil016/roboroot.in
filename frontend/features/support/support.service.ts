import axios from "axios";
import api from "@/lib/api-client";
import type {
  CreateTicketPayload,
  KnowledgeArticle,
  KnowledgeArticleSummary,
  KnowledgeCategory,
  SupportTicket,
} from "./types";

function apiError(error: unknown, fallback: string): never {
  if (axios.isAxiosError(error)) {
    const message = (error.response?.data as { error?: string } | undefined)?.error;
    throw new Error(message || fallback);
  }
  throw error instanceof Error ? error : new Error(fallback);
}

export const supportApi = {
  async getArticles(filters: { search?: string; category?: KnowledgeCategory } = {}) {
    const params = new URLSearchParams();
    if (filters.search) params.set("search", filters.search);
    if (filters.category) params.set("category", filters.category);
    const suffix = params.size ? `?${params.toString()}` : "";
    const response = await api.get<{ success: true; data: KnowledgeArticleSummary[] }>(`/api/support/knowledge-base${suffix}`);
    return response.data.data;
  },

  async getArticle(slug: string) {
    const response = await api.get<{ success: true; data: KnowledgeArticle }>(`/api/support/knowledge-base/${encodeURIComponent(slug)}`);
    return response.data.data;
  },

  async createTicket(payload: CreateTicketPayload) {
    try {
      const response = await api.post<{ success: true; data: SupportTicket }>("/api/support/tickets", payload);
      return response.data.data;
    } catch (error) {
      return apiError(error, "Could not create your support ticket");
    }
  },

  async getMyTickets() {
    const response = await api.get<{ success: true; data: SupportTicket[] }>("/api/support/tickets/my");
    return response.data.data;
  },

  async trackTicket(ticketNumber: string, email?: string) {
    try {
      const response = await api.post<{ success: true; data: SupportTicket }>(
        `/api/support/tickets/${encodeURIComponent(ticketNumber)}/track`,
        email ? { email } : {},
      );
      return response.data.data;
    } catch (error) {
      return apiError(error, "Could not find that ticket");
    }
  },

  async reply(ticketNumber: string, message: string, email?: string) {
    try {
      const response = await api.post<{ success: true; data: SupportTicket }>(
        `/api/support/tickets/${encodeURIComponent(ticketNumber)}/messages`,
        { message, ...(email ? { email } : {}) },
      );
      return response.data.data;
    } catch (error) {
      return apiError(error, "Could not send your reply");
    }
  },
};
