"use client";

import { type FormEvent, useState } from "react";
import type { Coupon, DiscountType } from "@/types";
import { createCoupon, deactivateCoupon, updateCoupon, type CouponPayload } from "@/api/coupons";
import { priceLabel } from "@/utils";

type CouponForm = {
  code: string;
  label: string;
  discountType: DiscountType;
  discountValue: string;
  minOrderAmount: string;
  maxUsageCount: string;
  perUserLimit: string;
  expiresAt: string;
  allowedEmail: string;
};

const emptyCouponForm: CouponForm = {
  code: "",
  label: "",
  discountType: "PERCENTAGE",
  discountValue: "",
  minOrderAmount: "",
  maxUsageCount: "",
  perUserLimit: "",
  expiresAt: "",
  allowedEmail: "",
};

function discountValueHint(type: DiscountType): string {
  if (type === "PERCENTAGE") return "% off";
  if (type === "FLAT") return "₹ amount off";
  return "₹ shipping discount";
}

function formatDiscountValue(coupon: Coupon): string {
  if (coupon.discountType === "PERCENTAGE") return `${coupon.discountValue}%`;
  return priceLabel(coupon.discountValue * 100);
}

function typePillClass(type: DiscountType): string {
  if (type === "PERCENTAGE") return "bg-blue-100 text-blue-700";
  if (type === "FLAT") return "bg-green-100 text-green-700";
  return "bg-purple-100 text-purple-700";
}

export function CouponsView({
  coupons,
  isLoading,
  token,
  onReload,
}: {
  coupons: Coupon[];
  isLoading: boolean;
  token: string;
  onReload: () => void;
}) {
  const [form, setForm] = useState<CouponForm>(emptyCouponForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const totalCoupons = coupons.length;
  const activeCoupons = coupons.filter((c) => c.isActive).length;
  const emailRestricted = coupons.filter((c) => c.allowedEmail !== null).length;

  function startEdit(coupon: Coupon) {
    setEditingId(coupon.id);
    setForm({
      code: coupon.code,
      label: coupon.label,
      discountType: coupon.discountType,
      discountValue: String(coupon.discountValue),
      minOrderAmount: coupon.minOrderCents ? String(coupon.minOrderCents / 100) : "",
      maxUsageCount: coupon.maxUsageCount !== null ? String(coupon.maxUsageCount) : "",
      perUserLimit: coupon.perUserLimit !== null ? String(coupon.perUserLimit) : "",
      expiresAt: coupon.expiresAt ? coupon.expiresAt.substring(0, 10) : "",
      allowedEmail: coupon.allowedEmail ?? "",
    });
    setActionError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyCouponForm);
    setActionError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) { setActionError("Not authenticated."); return; }
    setSaving(true);
    setActionError(null);
    try {
      const payload: CouponPayload = {
        code: form.code.toUpperCase().trim(),
        label: form.label.trim(),
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        minOrderCents: form.minOrderAmount ? Math.round(Number(form.minOrderAmount) * 100) : undefined,
        maxUsageCount: form.maxUsageCount ? Number(form.maxUsageCount) : null,
        perUserLimit: form.perUserLimit ? Number(form.perUserLimit) : null,
        allowedEmail: form.allowedEmail.trim() || null,
        expiresAt: form.expiresAt || null,
      };
      if (editingId) {
        await updateCoupon(editingId, payload, token);
      } else {
        await createCoupon(payload, token);
      }
      setForm(emptyCouponForm);
      setEditingId(null);
      onReload();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Failed to save coupon");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeactivate(coupon: Coupon) {
    if (!token) return;
    if (!window.confirm(`Deactivate coupon "${coupon.code}"?`)) return;
    setSaving(true);
    setActionError(null);
    try {
      await deactivateCoupon(coupon.id, token);
      onReload();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Failed to deactivate coupon");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Stats bar */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="admin-card p-5">
          <p className="admin-eyebrow">Total Coupons</p>
          <p className="mt-1 text-3xl font-extrabold text-[#222222]">{totalCoupons}</p>
          <p className="admin-muted mt-0.5">All time</p>
        </div>
        <div className="admin-card p-5">
          <p className="admin-eyebrow">Active Coupons</p>
          <p className="mt-1 text-3xl font-extrabold text-green-600">{activeCoupons}</p>
          <p className="admin-muted mt-0.5">Currently redeemable</p>
        </div>
        <div className="admin-card p-5">
          <p className="admin-eyebrow">Email-Restricted</p>
          <p className="mt-1 text-3xl font-extrabold text-blue-600">{emailRestricted}</p>
          <p className="admin-muted mt-0.5">Single-user coupons</p>
        </div>
      </div>

      {/* Create / Edit Coupon Form */}
      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <p className="admin-eyebrow">Coupons</p>
            <h2 className="admin-card-title">{editingId ? "Edit Coupon" : "Create Coupon"}</h2>
          </div>
        </div>
        <div className="admin-card-content">
          {actionError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {actionError}
            </div>
          )}
          <form onSubmit={(e) => void handleSubmit(e)} className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1">
                <label className="text-xs font-semibold text-zinc-500">Code <span className="text-red-500">*</span></label>
                <input
                  className="admin-input font-mono uppercase"
                  placeholder="e.g. SAVE15"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  required
                />
                <p className="text-xs text-zinc-400">Will be saved as uppercase</p>
              </div>
              <div className="grid gap-1">
                <label className="text-xs font-semibold text-zinc-500">Label / Description <span className="text-red-500">*</span></label>
                <input
                  className="admin-input"
                  placeholder="e.g. 15% off all orders"
                  value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1">
                <label className="text-xs font-semibold text-zinc-500">Discount Type</label>
                <select
                  className="admin-input"
                  value={form.discountType}
                  onChange={(e) => setForm({ ...form, discountType: e.target.value as DiscountType })}
                >
                  <option value="PERCENTAGE">Percentage</option>
                  <option value="FLAT">Flat Amount</option>
                  <option value="FREE_SHIPPING">Free Shipping</option>
                </select>
              </div>
              <div className="grid gap-1">
                <label className="text-xs font-semibold text-zinc-500">
                  Discount Value ({discountValueHint(form.discountType)})
                </label>
                <input
                  className="admin-input"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder={discountValueHint(form.discountType)}
                  value={form.discountValue}
                  onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="grid gap-1">
                <label className="text-xs font-semibold text-zinc-500">Min Order Amount ₹</label>
                <input
                  className="admin-input"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="No minimum"
                  value={form.minOrderAmount}
                  onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })}
                />
              </div>
              <div className="grid gap-1">
                <label className="text-xs font-semibold text-zinc-500">Max Total Uses</label>
                <input
                  className="admin-input"
                  type="number"
                  min="1"
                  placeholder="Unlimited"
                  value={form.maxUsageCount}
                  onChange={(e) => setForm({ ...form, maxUsageCount: e.target.value })}
                />
              </div>
              <div className="grid gap-1">
                <label className="text-xs font-semibold text-zinc-500">Per User Limit</label>
                <input
                  className="admin-input"
                  type="number"
                  min="1"
                  placeholder="Unlimited"
                  value={form.perUserLimit}
                  onChange={(e) => setForm({ ...form, perUserLimit: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1">
                <label className="text-xs font-semibold text-zinc-500">Expiry Date</label>
                <input
                  className="admin-input"
                  type="date"
                  value={form.expiresAt}
                  onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                />
              </div>
              <div className="grid gap-1">
                <label className="text-xs font-semibold text-zinc-500">Restrict to Email</label>
                <input
                  className="admin-input"
                  type="email"
                  placeholder="Leave empty for global coupon"
                  value={form.allowedEmail}
                  onChange={(e) => setForm({ ...form, allowedEmail: e.target.value })}
                />
                <p className="text-xs text-zinc-400">If set, only this email can use this coupon</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="admin-button admin-button-primary"
                disabled={saving || isLoading}
              >
                {saving ? "Saving…" : editingId ? "Update Coupon" : "Create Coupon"}
              </button>
              {editingId && (
                <button
                  type="button"
                  className="admin-button admin-button-secondary"
                  onClick={cancelEdit}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Coupons Table */}
      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <p className="admin-eyebrow">Coupons</p>
            <h2 className="admin-card-title">All Coupons</h2>
          </div>
        </div>
        <div className="admin-card-content overflow-x-auto">
          {isLoading ? (
            <p className="admin-muted py-8 text-center">Loading coupons…</p>
          ) : coupons.length === 0 ? (
            <p className="admin-muted py-8 text-center">No coupons yet. Create one above.</p>
          ) : (
            <table className="admin-table w-full">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Label</th>
                  <th>Type</th>
                  <th>Value</th>
                  <th>Restriction</th>
                  <th>Min Order</th>
                  <th>Usage</th>
                  <th>Expiry</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon) => (
                  <tr key={coupon.id}>
                    <td>
                      <span className="font-mono text-sm font-bold text-[#222222]">{coupon.code}</span>
                    </td>
                    <td>
                      <span className="text-sm text-zinc-700">{coupon.label}</span>
                    </td>
                    <td>
                      <span className={`admin-pill ${typePillClass(coupon.discountType)}`}>
                        {coupon.discountType === "FREE_SHIPPING"
                          ? "Free Ship"
                          : coupon.discountType === "PERCENTAGE"
                          ? "Percentage"
                          : "Flat"}
                      </span>
                    </td>
                    <td>
                      <span className="text-sm font-semibold">{formatDiscountValue(coupon)}</span>
                    </td>
                    <td>
                      {coupon.allowedEmail ? (
                        <span className="text-xs text-zinc-700">{coupon.allowedEmail}</span>
                      ) : (
                        <span className="admin-pill bg-zinc-100 text-zinc-500">Global</span>
                      )}
                    </td>
                    <td>
                      <span className="text-sm text-zinc-600">
                        {coupon.minOrderCents ? priceLabel(coupon.minOrderCents) : "None"}
                      </span>
                    </td>
                    <td>
                      <span className="text-sm text-zinc-600">
                        {coupon.usageCount} / {coupon.maxUsageCount !== null ? coupon.maxUsageCount : "∞"}
                      </span>
                    </td>
                    <td>
                      <span className="text-sm text-zinc-600">
                        {coupon.expiresAt
                          ? new Date(coupon.expiresAt).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "Never"}
                      </span>
                    </td>
                    <td>
                      {coupon.isActive ? (
                        <span className="admin-pill bg-green-100 text-green-700">Active</span>
                      ) : (
                        <span className="admin-pill bg-red-100 text-red-600">Inactive</span>
                      )}
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          className="admin-action"
                          onClick={() => startEdit(coupon)}
                          disabled={saving}
                        >
                          Edit
                        </button>
                        {coupon.isActive && (
                          <button
                            className="admin-action text-red-600 hover:bg-red-50"
                            onClick={() => void handleDeactivate(coupon)}
                            disabled={saving}
                          >
                            Deactivate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
