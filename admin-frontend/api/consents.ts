import { apiFetch } from "@/api/client";
import { API_BASE_URL } from "@/config/env";
import type { ConsentFilters, ConsentListData } from "@/types";

function consentQuery(filters: ConsentFilters) {
  const query = new URLSearchParams({
    page: String(filters.page),
    limit: String(filters.limit),
  });
  if (filters.search) query.set("search", filters.search);
  if (filters.type) query.set("type", filters.type);
  if (filters.source) query.set("source", filters.source);
  if (filters.action) query.set("action", filters.action);
  if (filters.from) query.set("from", filters.from);
  if (filters.to) query.set("to", filters.to);
  return query.toString();
}

export async function fetchConsentRecords(filters: ConsentFilters, token: string) {
  const payload = await apiFetch<{ success: true; data: ConsentListData }>(
    `/api/legal/admin/consents?${consentQuery(filters)}`,
    { token },
  );
  return payload.data;
}

export async function downloadConsentExport(filters: ConsentFilters, token: string) {
  const response = await fetch(
    `${API_BASE_URL}/api/legal/admin/consents/export?${consentQuery(filters)}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (!response.ok) throw new Error("Could not export consent records");

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `roboroot-consents-${new Date().toISOString().slice(0, 10)}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}
