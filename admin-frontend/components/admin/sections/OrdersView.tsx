"use client";

import { useState } from "react";
import type { AdminOrder, AdminOrderStatus } from "@/types";
import { priceLabel } from "@/utils";
import { orderStatuses } from "@/config/forms";
import { updateOrderTracking } from "@/api/orders";
import { useAdmin } from "@/core/context/AdminContext";

const STATUS_COLORS: Record<string, string> = {
  PENDING_PAYMENT: "bg-yellow-100 text-yellow-800",
  PAID: "bg-blue-100 text-blue-800",
  PROCESSING: "bg-indigo-100 text-indigo-800",
  PACKED: "bg-purple-100 text-purple-800",
  SHIPPED: "bg-cyan-100 text-cyan-800",
  OUT_FOR_DELIVERY: "bg-teal-100 text-teal-800",
  DELIVERED: "bg-green-100 text-green-800",
  RETURN_REQUESTED: "bg-orange-100 text-orange-800",
  RETURNED: "bg-orange-200 text-orange-900",
  REFUND_INITIATED: "bg-red-100 text-red-700",
  REFUNDED: "bg-red-200 text-red-900",
  CANCELLED: "bg-zinc-200 text-zinc-600",
};

const PAYMENT_COLORS: Record<string, string> = {
  SUCCESS: "bg-green-100 text-green-800",
  CREATED: "bg-yellow-100 text-yellow-800",
  FAILED: "bg-red-100 text-red-800",
  REFUNDED: "bg-blue-100 text-blue-800",
};

function StatusPill({ status }: { status: string }) {
  const color = STATUS_COLORS[status] ?? "bg-zinc-100 text-zinc-600";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${color}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

function PaymentBadge({ status }: { status: string }) {
  const color = PAYMENT_COLORS[status] ?? "bg-zinc-100 text-zinc-600";
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold ${color}`}>
      {status}
    </span>
  );
}

function TrackingPanel({
  order,
  onClose,
  onSaved,
}: {
  order: AdminOrder;
  onClose: () => void;
  onSaved: (order: AdminOrder) => void;
}) {
  const { token } = useAdmin();
  const [awb, setAwb] = useState(order.trackingAwb ?? "");
  const [url, setUrl] = useState(order.trackingUrl ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    if (!token) return;
    setSaving(true);
    setError("");
    try {
      const updated = await updateOrderTracking(order.id, { trackingAwb: awb || undefined, trackingUrl: url || undefined }, token);
      onSaved(updated);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save tracking info");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 backdrop-blur-sm">
      <div className="admin-card w-full max-w-md p-6 shadow-2xl">
        <p className="admin-eyebrow">Shipping Tracking</p>
        <h3 className="admin-card-title mt-1">Update Tracking for #{order.id.slice(-8).toUpperCase()}</h3>

        <div className="mt-5 grid gap-3">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-zinc-500">AWB / Tracking Number</label>
            <input
              className="admin-input w-full"
              placeholder="e.g. 123456789012"
              value={awb}
              onChange={(e) => setAwb(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-zinc-500">Tracking URL</label>
            <input
              className="admin-input w-full"
              placeholder="https://track.shiprocket.in/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          {error && <p className="rounded-md bg-red-50 p-2 text-xs font-semibold text-red-600">{error}</p>}
        </div>

        <div className="mt-5 flex gap-3">
          <button onClick={onClose} className="admin-button admin-button-secondary flex-1">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="admin-button admin-button-primary flex-1">
            {saving ? "Saving..." : "Save Tracking"}
          </button>
        </div>
      </div>
    </div>
  );
}

function OrderDetailPanel({
  order,
  onClose,
  onUpdateStatus,
  onTrackingUpdated,
}: {
  order: AdminOrder;
  onClose: () => void;
  onUpdateStatus: (order: AdminOrder, status: AdminOrderStatus) => void;
  onTrackingUpdated: (order: AdminOrder) => void;
}) {
  const [showTracking, setShowTracking] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<AdminOrderStatus>(order.status);
  const isTerminal = order.status === "DELIVERED" || order.status === "CANCELLED" || order.status === "REFUNDED";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-950/40 backdrop-blur-sm sm:items-center">
      {showTracking && (
        <TrackingPanel
          order={order}
          onClose={() => setShowTracking(false)}
          onSaved={onTrackingUpdated}
        />
      )}
      <div className="admin-card flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-b-none shadow-2xl sm:rounded-2xl">
        {/* Header */}
        <div className="admin-card-header flex-row items-start justify-between">
          <div>
            <p className="admin-eyebrow">Order Detail</p>
            <h3 className="admin-card-title">#{order.id.slice(-12).toUpperCase()}</h3>
            <p className="admin-muted">{new Date(order.createdAt).toLocaleString("en-IN")}</p>
          </div>
          <button onClick={onClose} className="admin-action">✕ Close</button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <div className="grid gap-5 sm:grid-cols-2">
            {/* Customer */}
            <div className="admin-soft-surface p-4">
              <p className="admin-eyebrow mb-2">Customer</p>
              <p className="font-bold text-[#222222]">{order.user?.name ?? "Customer"}</p>
              <p className="text-sm text-zinc-500">{order.user?.email}</p>
            </div>

            {/* Delivery address */}
            <div className="admin-soft-surface p-4">
              <p className="admin-eyebrow mb-2">Delivery Address</p>
              {order.address ? (
                <>
                  <p className="font-bold text-[#222222]">{order.address.name}</p>
                  <p className="text-sm text-zinc-600">{order.address.line1}{order.address.line2 ? `, ${order.address.line2}` : ""}</p>
                  <p className="text-sm text-zinc-600">{order.address.city}, {order.address.state} — {order.address.pincode}</p>
                  <p className="text-sm font-semibold text-zinc-500">{order.address.phone}</p>
                </>
              ) : (
                <p className="text-sm text-zinc-500">No address data</p>
              )}
            </div>
          </div>

          {/* Items */}
          <div className="mt-5 admin-soft-surface overflow-hidden rounded-xl">
            <p className="admin-eyebrow border-b border-zinc-200 px-4 py-2">Order Items</p>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th className="text-right">Qty</th>
                  <th className="text-right">Unit</th>
                  <th className="text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td className="font-semibold text-[#222222]">{item.description}</td>
                    <td className="text-right font-mono text-sm">{item.quantity}</td>
                    <td className="text-right text-sm text-zinc-500">{priceLabel(item.unitPriceCents)}</td>
                    <td className="text-right font-bold">{priceLabel(item.subtotalCents)}</td>
                  </tr>
                ))}
                <tr className="border-t border-zinc-200 bg-[#F2F2F0]">
                  <td colSpan={3} className="px-4 py-3 text-right font-bold text-[#222222]">Total</td>
                  <td className="px-4 py-3 text-right text-lg font-extrabold text-[#222222]">{priceLabel(order.totalAmountCents)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Payment timeline */}
          <div className="mt-5">
            <p className="admin-eyebrow mb-3">Payment Timeline</p>
            {order.payments.length === 0 ? (
              <p className="text-sm text-zinc-500 italic">No payment records yet.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {order.payments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3">
                    <div>
                      <p className="font-bold text-[#222222]">{payment.gateway}</p>
                      {payment.gatewayTransactionId && (
                        <p className="font-mono text-xs text-zinc-500">{payment.gatewayTransactionId}</p>
                      )}
                      {payment.createdAt && (
                        <p className="text-xs text-zinc-400">{new Date(payment.createdAt).toLocaleString("en-IN")}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{priceLabel(payment.amountCents)}</p>
                      <PaymentBadge status={payment.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Shipping tracking */}
          <div className="mt-5 rounded-xl border border-zinc-200 bg-white p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="admin-eyebrow mb-2">Shipping & Tracking</p>
                {order.trackingAwb ? (
                  <>
                    <p className="font-bold text-[#222222]">AWB: <span className="font-mono">{order.trackingAwb}</span></p>
                    {order.trackingUrl && (
                      <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-blue-600 underline">
                        Track shipment →
                      </a>
                    )}
                    {order.shippedAt && <p className="mt-1 text-xs text-zinc-500">Shipped: {new Date(order.shippedAt).toLocaleDateString("en-IN")}</p>}
                    {order.deliveredAt && <p className="text-xs text-zinc-500">Delivered: {new Date(order.deliveredAt).toLocaleDateString("en-IN")}</p>}
                  </>
                ) : (
                  <p className="text-sm text-zinc-500 italic">No tracking info yet.</p>
                )}
              </div>
              <button onClick={() => setShowTracking(true)} className="admin-action">Update Tracking</button>
            </div>
          </div>

          {/* Coupon */}
          {order.coupon && (
            <div className="mt-3 flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3">
              <p className="admin-eyebrow">Coupon Applied</p>
              <span className="admin-pill font-mono">{order.coupon.code}</span>
              <span className="text-sm text-zinc-500">{order.coupon.label}</span>
            </div>
          )}
        </div>

        {/* Status update footer */}
        <div className="border-t border-zinc-200 p-5">
          <p className="admin-eyebrow mb-2">Update Status</p>
          <div className="flex gap-3">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as AdminOrderStatus)}
              disabled={isTerminal}
              className="admin-input flex-1 disabled:bg-zinc-100 disabled:text-zinc-400"
            >
              {orderStatuses.map((s) => (
                <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
              ))}
            </select>
            <button
              onClick={() => { onUpdateStatus(order, selectedStatus); onClose(); }}
              disabled={isTerminal || selectedStatus === order.status}
              className="admin-button admin-button-primary disabled:opacity-50"
            >
              Apply
            </button>
          </div>
          {isTerminal && <p className="mt-2 text-xs text-zinc-500">This order is in a terminal state and cannot be updated.</p>}
        </div>
      </div>
    </div>
  );
}

export function OrdersView({
  orders,
  isLoading,
  onUpdateStatus,
  onOrderUpdated,
}: {
  orders: AdminOrder[];
  isLoading: boolean;
  onUpdateStatus: (order: AdminOrder, status: AdminOrderStatus) => void;
  onOrderUpdated: (order: AdminOrder) => void;
}) {
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);

  const totalRevenue = orders
    .filter((o) => o.status !== "CANCELLED" && o.status !== "REFUNDED")
    .reduce((sum, order) => sum + order.totalAmountCents, 0);

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = filterStatus === "ALL" || order.status === filterStatus;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      order.id.toLowerCase().includes(q) ||
      (order.user?.name ?? "").toLowerCase().includes(q) ||
      (order.user?.email ?? "").toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const statusGroups: AdminOrderStatus[] = [
    "PENDING_PAYMENT", "PAID", "PROCESSING", "PACKED",
    "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED",
    "RETURN_REQUESTED", "RETURNED", "REFUND_INITIATED", "REFUNDED", "CANCELLED",
  ];

  const filterTabs = [
    { label: "All", value: "ALL" },
    ...statusGroups.map((s) => ({ label: s.replace(/_/g, " "), value: s })),
  ];

  function handleTrackingUpdated(updatedOrder: AdminOrder) {
    onOrderUpdated(updatedOrder);
    if (selectedOrder?.id === updatedOrder.id) {
      setSelectedOrder(updatedOrder);
    }
  }

  return (
    <section className="flex flex-col gap-6">
      {selectedOrder && (
        <OrderDetailPanel
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdateStatus={onUpdateStatus}
          onTrackingUpdated={handleTrackingUpdated}
        />
      )}

      {/* KPI row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="admin-card p-5">
          <p className="admin-eyebrow">Total Orders</p>
          <p className="mt-2 text-3xl font-bold text-[#222222]">{orders.length}</p>
        </div>
        <div className="admin-card p-5">
          <p className="admin-eyebrow">Paid</p>
          <p className="mt-2 text-3xl font-bold text-[#222222]">
            {orders.filter((o) => ["PAID", "PROCESSING", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"].includes(o.status)).length}
          </p>
        </div>
        <div className="admin-card p-5">
          <p className="admin-eyebrow">Pending Shipment</p>
          <p className="mt-2 text-3xl font-bold text-[#222222]">
            {orders.filter((o) => ["PROCESSING", "PACKED"].includes(o.status)).length}
          </p>
        </div>
        <div className="admin-card p-5">
          <p className="admin-eyebrow">Revenue (excl. cancelled)</p>
          <p className="mt-2 text-2xl font-bold text-[#222222]">{priceLabel(totalRevenue)}</p>
        </div>
      </div>

      <div className="admin-card overflow-hidden">
        <div className="admin-card-header gap-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="admin-eyebrow">Order Management</p>
              <h2 className="admin-card-title">All customer orders</h2>
            </div>
            <input
              className="admin-input sm:w-72"
              placeholder="Search order ID, customer name or email"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Status filter pills */}
          <div className="flex flex-wrap gap-2">
            {filterTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setFilterStatus(tab.value)}
                className={`inline-flex h-7 items-center rounded-full px-3 text-xs font-bold transition ${
                  filterStatus === tab.value
                    ? "bg-[#222222] text-white"
                    : "border border-zinc-200 bg-white text-zinc-500 hover:bg-[#F2F2F0]"
                }`}
              >
                {tab.label}
                <span className="ml-1.5 tabular-nums">
                  {tab.value === "ALL"
                    ? orders.length
                    : orders.filter((o) => o.status === tab.value).length}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="admin-table min-w-[860px]">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Payment</th>
                <th>Total</th>
                <th>Delivery</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className="transition hover:bg-[#F2F2F0]">
                  <td>
                    <p className="font-mono text-xs font-bold text-[#222222]">#{order.id.slice(-10).toUpperCase()}</p>
                    <p className="text-xs text-zinc-500">{new Date(order.createdAt).toLocaleDateString("en-IN")}</p>
                  </td>
                  <td>
                    <p className="font-bold text-[#222222]">{order.user?.name ?? "Customer"}</p>
                    <p className="text-xs text-zinc-500">{order.user?.email}</p>
                  </td>
                  <td>
                    <div className="max-w-[200px] space-y-0.5">
                      {order.items.slice(0, 2).map((item) => (
                        <p key={item.id} className="truncate text-xs font-semibold text-zinc-600">
                          {item.quantity}× {item.description}
                        </p>
                      ))}
                      {order.items.length > 2 && (
                        <p className="text-xs text-zinc-400">+{order.items.length - 2} more</p>
                      )}
                    </div>
                  </td>
                  <td>
                    <p className="text-xs font-bold text-[#222222]">{order.payments[0]?.gateway ?? "TEST"}</p>
                    {order.payments[0] && <PaymentBadge status={order.payments[0].status} />}
                  </td>
                  <td className="font-bold text-[#222222]">{priceLabel(order.totalAmountCents)}</td>
                  <td>
                    {order.trackingAwb ? (
                      <div>
                        <p className="font-mono text-xs font-bold text-[#222222]">{order.trackingAwb}</p>
                        {order.trackingUrl && (
                          <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 underline">
                            Track
                          </a>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs italic text-zinc-400">Not shipped</p>
                    )}
                  </td>
                  <td><StatusPill status={order.status} /></td>
                  <td>
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="admin-action"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-sm font-bold text-zinc-400">
                    {searchQuery || filterStatus !== "ALL" ? "No orders match your filter." : "No orders yet."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
