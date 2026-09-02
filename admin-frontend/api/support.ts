import { apiFetch } from "@/api/client";
import type {
  AdminKnowledgeArticle,
  AdminSupportTicket,
  KnowledgeArticleInput,
  SupportAgent,
  SupportTicketFilters,
  SupportTicketListData,
} from "@/types";

function ticketQuery(filters: SupportTicketFilters) {
  const query = new URLSearchParams({ page: String(filters.page), limit: String(filters.limit) });
  if (filters.search) query.set("search", filters.search);
  if (filters.status) query.set("status", filters.status);
  if (filters.priority) query.set("priority", filters.priority);
  if (filters.category) query.set("category", filters.category);
  if (filters.sla) query.set("sla", filters.sla);
  return query.toString();
}

export async function fetchSupportTickets(filters: SupportTicketFilters, token: string) {
  const response = await apiFetch<{ success: true; data: SupportTicketListData }>(
    `/api/support/admin/tickets?${ticketQuery(filters)}`,
    { token },
  );
  return response.data;
}

export async function updateSupportTicket(
  id: string,
  changes: Partial<Pick<AdminSupportTicket, "status" | "priority" | "assignedToId">>,
  token: string,
) {
  const response = await apiFetch<{ success: true; data: AdminSupportTicket }>(`/api/support/admin/tickets/${id}`, {
    method: "PATCH",
    token,
    body: JSON.stringify(changes),
  });
  return response.data;
}

export async function replyToSupportTicket(id: string, message: string, isInternal: boolean, token: string) {
  const response = await apiFetch<{ success: true; data: AdminSupportTicket }>(`/api/support/admin/tickets/${id}/messages`, {
    method: "POST",
    token,
    body: JSON.stringify({ message, isInternal }),
  });
  return response.data;
}

export async function fetchSupportAgents(token: string) {
  const response = await apiFetch<{ success: true; data: SupportAgent[] }>("/api/support/admin/agents", { token });
  return response.data;
}

export async function fetchKnowledgeArticles(token: string) {
  const response = await apiFetch<{ success: true; data: AdminKnowledgeArticle[] }>("/api/support/admin/knowledge-base", { token });
  return response.data;
}

export async function createKnowledgeArticle(input: KnowledgeArticleInput, token: string) {
  const response = await apiFetch<{ success: true; data: AdminKnowledgeArticle }>("/api/support/admin/knowledge-base", {
    method: "POST",
    token,
    body: JSON.stringify(input),
  });
  return response.data;
}

export async function updateKnowledgeArticle(id: string, input: Partial<KnowledgeArticleInput>, token: string) {
  const response = await apiFetch<{ success: true; data: AdminKnowledgeArticle }>(`/api/support/admin/knowledge-base/${id}`, {
    method: "PATCH",
    token,
    body: JSON.stringify(input),
  });
  return response.data;
}

export async function deleteKnowledgeArticle(id: string, token: string) {
  await apiFetch<{ success: true }>(`/api/support/admin/knowledge-base/${id}`, { method: "DELETE", token });
}
