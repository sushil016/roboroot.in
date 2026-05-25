import { apiFetch } from "./client";
import type { Coupon, DiscountType } from "@/types";

export type CouponPayload = {
  code: string;
  label: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderCents?: number;
  maxUsageCount?: number | null;
  perUserLimit?: number | null;
  allowedEmail?: string | null;
  expiresAt?: string | null;
  isActive?: boolean;
};

export async function listCoupons(token: string): Promise<Coupon[]> {
  const payload = await apiFetch<{ success: boolean; data: Coupon[] }>("/api/coupons", { token });
  return payload.data;
}

export async function createCoupon(body: CouponPayload, token: string): Promise<Coupon> {
  const payload = await apiFetch<{ success: boolean; data: Coupon }>("/api/coupons", {
    method: "POST",
    body: JSON.stringify(body),
    token,
  });
  return payload.data;
}

export async function updateCoupon(id: string, body: Partial<CouponPayload>, token: string): Promise<Coupon> {
  const payload = await apiFetch<{ success: boolean; data: Coupon }>(`/api/coupons/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
    token,
  });
  return payload.data;
}

export async function deactivateCoupon(id: string, token: string): Promise<Coupon> {
  const payload = await apiFetch<{ success: boolean; data: Coupon }>(`/api/coupons/${id}`, {
    method: "DELETE",
    token,
  });
  return payload.data;
}
