import { API_BASE_URL } from "@/config/env";
import { apiFetch } from "./client";

export type PrintOrderStatus =
  | "PAYMENT_PENDING"
  | "PAID"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "PRINTING"
  | "POST_PROCESSING"
  | "QUALITY_CHECK"
  | "PACKED"
  | "SHIPPED"
  | "DELIVERED"
  | "ON_HOLD"
  | "CANCELLED"
  | "REFUNDED";

export type PrintMaterial = {
  id: string;
  code: string;
  name: string;
  densityGramsPerCm3: number;
  pricePerGramCents: number;
  colors: string[];
  isActive: boolean;
  sortOrder: number;
};

export type PrintPricingSettings = {
  id: number;
  isEnabled: boolean;
  baseFeeCents: number;
  minimumOrderCents: number;
  shellMaterialPercent: number;
  draftMultiplierPercent: number;
  standardMultiplierPercent: number;
  fineMultiplierPercent: number;
  rawFinishFeeCents: number;
  supportRemovalFeeCents: number;
  sandingFeeCents: number;
  primerFeeCents: number;
  paintingFeeCents: number;
  draftLeadDays: number;
  standardLeadDays: number;
  fineLeadDays: number;
  maxFileSizeMb: number;
  materials: PrintMaterial[];
  updatedAt: string;
};

export type PrintStatusEvent = {
  id: string;
  status: PrintOrderStatus;
  note: string | null;
  actorLabel: string | null;
  createdAt: string;
};

export type AdminPrintOrder = {
  id: string;
  reference: string;
  status: PrintOrderStatus;
  color: string;
  quality: "DRAFT" | "STANDARD" | "FINE";
  finish: "RAW" | "SUPPORT_REMOVAL" | "SANDED" | "PRIMED" | "PAINTED";
  infillPercent: number;
  quantity: number;
  unitWeightGrams: number;
  totalWeightGrams: number;
  baseFeeCents: number;
  materialCostCents: number;
  qualityMarkupCents: number;
  finishFeeCents: number;
  subtotalCents: number;
  shippingCents: number;
  totalAmountCents: number;
  estimatedDays: number;
  customerNotes: string | null;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
  user: { id: string; name: string | null; email: string };
  modelFile: {
    id: string;
    originalName: string;
    format: "STL" | "OBJ";
    sizeBytes: number;
    volumeMm3: number;
    widthMm: number;
    heightMm: number;
    depthMm: number;
    triangleCount: number;
  };
  material: PrintMaterial;
  statusHistory: PrintStatusEvent[];
  commerceOrder: {
    id: string;
    status: string;
    trackingAwb: string | null;
    trackingUrl: string | null;
    shippedAt: string | null;
    deliveredAt: string | null;
    address: {
      name: string;
      phone: string;
      line1: string;
      line2: string | null;
      city: string;
      state: string;
      pincode: string;
      country: string;
    };
    payments: Array<{
      id: string;
      gateway: string;
      status: string;
      amountCents: number;
      gatewayTransactionId: string | null;
      createdAt: string;
    }>;
  };
};

export type PrintOrderUpdate = {
  status?: PrintOrderStatus;
  adminNotes?: string | null;
  estimatedDays?: number;
  trackingAwb?: string | null;
  trackingUrl?: string | null;
  statusNote?: string;
};

export type PrintPricingUpdate = Omit<
  PrintPricingSettings,
  "id" | "updatedAt" | "materials"
> & {
  materials: Array<Omit<PrintMaterial, "id"> & { id?: string }>;
};

export async function fetchPrintOrders(
  token: string,
  filters: { page?: number; status?: PrintOrderStatus | "ALL"; search?: string } = {},
) {
  const query = new URLSearchParams({
    page: String(filters.page ?? 1),
    limit: "50",
  });
  if (filters.status && filters.status !== "ALL") query.set("status", filters.status);
  if (filters.search?.trim()) query.set("search", filters.search.trim());
  const payload = await apiFetch<{
    success: boolean;
    data: {
      orders: AdminPrintOrder[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }>(`/api/3d-printing/admin/orders?${query.toString()}`, { token });
  return payload.data;
}

export async function updatePrintOrder(
  id: string,
  update: PrintOrderUpdate,
  token: string,
) {
  const payload = await apiFetch<{ success: boolean; data: AdminPrintOrder }>(
    `/api/3d-printing/admin/orders/${id}`,
    { method: "PATCH", body: JSON.stringify(update), token },
  );
  return payload.data;
}

export async function fetchPrintSettings(token: string) {
  const payload = await apiFetch<{ success: boolean; data: PrintPricingSettings }>(
    "/api/3d-printing/admin/settings",
    { token },
  );
  return payload.data;
}

export async function updatePrintSettings(settings: PrintPricingUpdate, token: string) {
  const payload = await apiFetch<{ success: boolean; data: PrintPricingSettings }>(
    "/api/3d-printing/admin/settings",
    { method: "PATCH", body: JSON.stringify(settings), token },
  );
  return payload.data;
}

export async function downloadPrintModel(
  fileId: string,
  fileName: string,
  token: string,
) {
  const response = await fetch(`${API_BASE_URL}/api/3d-printing/files/${fileId}/download`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(payload.error ?? "Could not download model");
  }
  const url = URL.createObjectURL(await response.blob());
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
