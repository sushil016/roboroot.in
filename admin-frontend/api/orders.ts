import { apiFetch } from "./client";
import type { AdminOrder, AdminOrderListResponse, AdminOrderStatus, AdminOrderUpdateResponse } from "@/types";

export async function fetchAllOrders(token: string): Promise<AdminOrder[]> {
  const payload = await apiFetch<AdminOrderListResponse>("/api/orders/admin/all", { token });
  return payload.data;
}

export async function updateOrderStatus(
  orderId: string,
  status: AdminOrderStatus,
  token: string,
): Promise<AdminOrder> {
  const payload = await apiFetch<AdminOrderUpdateResponse>(`/api/orders/admin/${orderId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status, note: `Admin changed order status to ${status}` }),
    token,
  });
  return payload.data;
}

export async function updateOrderTracking(
  orderId: string,
  tracking: { trackingAwb?: string; trackingUrl?: string },
  token: string,
): Promise<AdminOrder> {
  const payload = await apiFetch<AdminOrderUpdateResponse>(`/api/orders/admin/${orderId}/status`, {
    method: "PATCH",
    body: JSON.stringify(tracking),
    token,
  });
  return payload.data;
}
