"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Ban, CreditCard, ArrowLeft, Package, MapPin, Truck, FileText, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { orderApi } from "@/lib/api/marketplace.api";
import { formatPrice } from "@/lib/store/cartStore";
import { useAuthStore } from "@/lib/store/authStore";
import { ProductImage } from "@/features/marketplace/components/ProductImage";
import { MagicCard } from "@/components/ui/magic-card";
import { Skeleton } from "@/components/ui/skeleton";
import { ORDER_STATUS_LABEL, OrderStatus } from "@/lib/types/marketplace.types";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/lib/api/config";

const STATUS_STYLES: Record<string, string> = {
  PENDING_PAYMENT: "text-amber-600 bg-amber-50 border-amber-200",
  PAID: "text-blue-600 bg-blue-50 border-blue-200",
  PROCESSING: "text-blue-600 bg-blue-50 border-blue-200",
  PACKED: "text-indigo-600 bg-indigo-50 border-indigo-200",
  SHIPPED: "text-violet-600 bg-violet-50 border-violet-200",
  OUT_FOR_DELIVERY: "text-purple-600 bg-purple-50 border-purple-200",
  DELIVERED: "text-emerald-600 bg-emerald-50 border-emerald-200",
  RETURN_REQUESTED: "text-orange-600 bg-orange-50 border-orange-200",
  RETURNED: "text-orange-600 bg-orange-50 border-orange-200",
  REFUND_INITIATED: "text-yellow-600 bg-yellow-50 border-yellow-200",
  REFUNDED: "text-teal-600 bg-teal-50 border-teal-200",
  CANCELLED: "text-red-600 bg-red-50 border-red-200",
};

function DetailSkeleton() {
  return (
    <div className="min-h-screen bg-[#f2f2f0]">
      <div className="bg-[#222222] rounded-b-[2.5rem] px-6 py-12">
        <div className="mx-auto max-w-7xl space-y-3">
          <Skeleton className="h-4 w-24 bg-white/10" />
          <Skeleton className="h-10 w-56 bg-white/10" />
          <Skeleton className="h-4 w-40 bg-white/10" />
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-6 py-10 lg:grid lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-8">
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    </div>
  );
}

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  const orderQuery = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => orderApi.getOrderById(orderId),
    enabled: isAuthenticated && Boolean(orderId),
  });

  const cancelMutation = useMutation({
    mutationFn: () => orderApi.cancelOrder(orderId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      await queryClient.invalidateQueries({ queryKey: ["my-orders"] });
      toast.success("Order cancelled");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to cancel order");
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#f2f2f0]">
        <div className="bg-[#222222] rounded-b-[2.5rem] px-6 py-12">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold text-white">Login to view this order</h1>
          </div>
        </div>
        <div className="flex justify-center mt-8">
          <Button asChild className="bg-[#1CA2D1] hover:bg-[#1590bb]">
            <Link href={`/login?redirect=/orders/${orderId}`}>Login</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (orderQuery.isLoading) return <DetailSkeleton />;

  if (!orderQuery.data) {
    return (
      <div className="min-h-screen bg-[#f2f2f0] flex flex-col items-center justify-center gap-4 py-20">
        <Package className="h-12 w-12 text-zinc-300" />
        <h1 className="text-2xl font-bold text-[#222222]">Order not found</h1>
        <Link href="/orders" className="text-sm text-[#1CA2D1] font-semibold hover:underline">
          Back to orders
        </Link>
      </div>
    );
  }

  const order = orderQuery.data;
  const cancellableStatuses = [OrderStatus.PENDING_PAYMENT, OrderStatus.PAID, OrderStatus.PROCESSING, OrderStatus.PACKED];
  const canCancel = cancellableStatuses.includes(order.status);
  const canPay = order.status === OrderStatus.PENDING_PAYMENT;
  const statusStyle = STATUS_STYLES[order.status] ?? "text-zinc-600 bg-zinc-50 border-zinc-200";
  const statusLabel = ORDER_STATUS_LABEL[order.status] ?? order.status;

  function handleCancelOrder() {
    if (!window.confirm("Cancel this order? Any reserved stock will be released.")) return;
    cancelMutation.mutate();
  }

  return (
    <div className="min-h-screen bg-[#f2f2f0]">
      {/* Dark hero */}
      <div className="bg-[#222222] rounded-b-[2.5rem] px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/orders"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to orders
          </Link>
          <div className="flex items-center gap-2 mb-3">
            <Package className="h-4 w-4 text-[#1CA2D1]" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
              Order Details
            </span>
          </div>
          <h1 className="text-4xl font-bold text-white md:text-5xl tracking-tight">
            Order #{order.id.slice(-8).toUpperCase()}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <span className="text-xs text-zinc-400">
              {new Date(order.createdAt).toLocaleString("en-IN")}
            </span>
            <span
              className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${statusStyle}`}
            >
              {statusLabel}
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-10 lg:grid lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-8">
        {/* Items */}
        <div className="space-y-4 mb-8 lg:mb-0">
          {order.items.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
            >
              <MagicCard
                className="rounded-2xl [--color-background:#ffffff]"
                gradientFrom="#1CA2D1"
                gradientTo="#E8E8E6"
                gradientColor="#1CA2D1"
                gradientOpacity={0.05}
              >
                <div className="p-5 grid gap-4 sm:grid-cols-[100px_minmax(0,1fr)_120px]">
                  <div className="aspect-square overflow-hidden rounded-xl bg-[#F2F2F0]">
                    <ProductImage
                      src={item.component?.imageUrl}
                      alt={item.description}
                      className="h-full w-full"
                      imageClassName="object-contain"
                    />
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-bold text-[#222222] leading-5 line-clamp-2">
                      {item.description}
                    </h2>
                    <p className="mt-1.5 text-xs text-zinc-400">Qty {item.quantity}</p>
                    {item.componentId && (
                      <Link
                        href={`/components/${item.componentId}`}
                        className="mt-3 inline-flex text-xs font-semibold text-[#1CA2D1] hover:underline"
                      >
                        View product →
                      </Link>
                    )}
                  </div>
                  <div className="flex items-start justify-end">
                    <p className="text-lg font-bold text-[#1CA2D1]">
                      {formatPrice(item.subtotalCents)}
                    </p>
                  </div>
                </div>
              </MagicCard>
            </motion.div>
          ))}
        </div>

        {/* Sidebar */}
        <aside className="h-fit lg:sticky lg:top-24 space-y-4">
          {/* Summary */}
          <MagicCard
            className="rounded-2xl [--color-background:#ffffff]"
            gradientFrom="#1CA2D1"
            gradientTo="#E8E8E6"
            gradientColor="#1CA2D1"
            gradientOpacity={0.07}
          >
            <div className="p-6 space-y-4">
              <h2 className="text-lg font-bold text-[#222222]">Order Summary</h2>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between text-zinc-600">
                  <span>Status</span>
                  <span
                    className={`font-semibold rounded-full border px-2 py-0.5 text-[11px] ${statusStyle}`}
                  >
                    {statusLabel}
                  </span>
                </div>
                <div className="flex justify-between text-zinc-600">
                  <span>Payment</span>
                  <span className="font-semibold text-[#222222]">
                    {order.payments[0]?.status || "CREATED"}
                  </span>
                </div>
                <div className="flex justify-between border-t border-[#D2D2D0] pt-2.5">
                  <span className="text-base font-bold text-[#222222]">Total</span>
                  <span className="text-xl font-bold text-[#1CA2D1]">
                    {formatPrice(order.totalAmountCents)}
                  </span>
                </div>
              </div>

              <div className="space-y-2.5 pt-2">
                {canPay && (
                  <Link
                    href={`/checkout/payment/${order.id}`}
                    className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#222222] text-sm font-bold text-white hover:bg-[#1CA2D1] transition-colors"
                  >
                    <CreditCard className="h-4 w-4" />
                    Complete Payment
                  </Link>
                )}
                {canCancel ? (
                  <button
                    type="button"
                    onClick={handleCancelOrder}
                    disabled={cancelMutation.isPending}
                    className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-red-200 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
                  >
                    <Ban className="h-4 w-4" />
                    {cancelMutation.isPending ? "Cancelling..." : "Cancel Order"}
                  </button>
                ) : (
                  !canPay && (
                    <p className="rounded-xl bg-[#F2F2F0] border border-[#D2D2D0] px-4 py-3 text-xs font-medium text-zinc-500">
                      This order can no longer be cancelled from the storefront.
                    </p>
                  )
                )}
              </div>
            </div>
          </MagicCard>

          {/* Shipping address */}
          {order.address && (
            <MagicCard
              className="rounded-2xl [--color-background:#ffffff]"
              gradientFrom="#1CA2D1"
              gradientTo="#E8E8E6"
              gradientColor="#1CA2D1"
              gradientOpacity={0.04}
            >
              <div className="p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#E8E8E6]">
                    <MapPin className="h-3.5 w-3.5 text-[#222222]" />
                  </div>
                  <h3 className="text-sm font-bold text-[#222222]">Shipping Address</h3>
                </div>
                <div className="text-xs text-zinc-500 leading-5">
                  <p className="font-semibold text-[#222222]">{order.address.name}</p>
                  <p>{order.address.line1}</p>
                  {order.address.line2 && <p>{order.address.line2}</p>}
                  <p>
                    {order.address.city}, {order.address.state} - {order.address.pincode}
                  </p>
                  {order.address.phone && (
                    <p className="mt-1 font-medium text-zinc-400">{order.address.phone}</p>
                  )}
                </div>
              </div>
            </MagicCard>
          )}

          {/* Tracking */}
          {order.trackingAwb ? (
            <MagicCard
              className="rounded-2xl [--color-background:#ffffff]"
              gradientFrom="#1CA2D1"
              gradientTo="#E8E8E6"
              gradientColor="#1CA2D1"
              gradientOpacity={0.04}
            >
              <div className="p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#E8E8E6]">
                    <Truck className="h-3.5 w-3.5 text-[#222222]" />
                  </div>
                  <h3 className="text-sm font-bold text-[#222222]">Shipment Tracking</h3>
                </div>
                <div className="space-y-1.5 text-xs text-zinc-500">
                  <p>
                    <span className="font-semibold text-[#222222]">AWB: </span>
                    <span className="font-mono">{order.trackingAwb}</span>
                  </p>
                  {order.shippedAt && (
                    <p>
                      <span className="font-semibold text-[#222222]">Shipped: </span>
                      {new Date(order.shippedAt).toLocaleString("en-IN")}
                    </p>
                  )}
                </div>
                {order.trackingUrl && (
                  <a
                    href={order.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#222222] px-3 py-2 text-xs font-bold text-white hover:bg-[#1CA2D1] transition-colors"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Track Shipment
                  </a>
                )}
              </div>
            </MagicCard>
          ) : (
            <div className="flex items-center gap-3 rounded-2xl border border-[#D2D2D0] bg-white px-4 py-3">
              <Truck className="h-4 w-4 text-zinc-300 shrink-0" />
              <p className="text-xs text-zinc-400 font-medium">
                Tracking will appear here once your order ships.
              </p>
            </div>
          )}

          {/* Invoice download */}
          {[OrderStatus.PAID, OrderStatus.PROCESSING, OrderStatus.PACKED, OrderStatus.SHIPPED, OrderStatus.OUT_FOR_DELIVERY, OrderStatus.DELIVERED].includes(order.status) && (
            <a
              href={`${API_BASE_URL}/api/orders/${order.id}/invoice`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-full items-center justify-center gap-2 rounded-2xl border border-[#D2D2D0] bg-white text-xs font-semibold text-zinc-600 hover:border-[#222222] hover:text-[#222222] transition-colors"
            >
              <FileText className="h-3.5 w-3.5" />
              Download Invoice (PDF)
            </a>
          )}
        </aside>
      </div>
    </div>
  );
}
