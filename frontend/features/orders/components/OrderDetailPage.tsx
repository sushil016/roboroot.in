"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Ban,
  Check,
  Clock3,
  CreditCard,
  ExternalLink,
  FileText,
  MapPin,
  Package,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductImage } from "@/features/products/components/ProductImage";
import { orderApi } from "@/features/products/services/product.service";
import { initiatePayment } from "@/features/payment/services/payment.service";
import { API_BASE_URL } from "@/lib/api/config";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/store/cart.store";
import { useAuthStore } from "@/store/user.store";
import { ORDER_STATUS_LABEL, OrderStatus } from "@/types/marketplace.types";

const STATUS_STYLES: Record<string, string> = {
  PENDING_PAYMENT: "border-amber-200 bg-amber-50 text-amber-700",
  PAID: "border-blue-200 bg-blue-50 text-blue-700",
  PROCESSING: "border-blue-200 bg-blue-50 text-blue-700",
  PACKED: "border-indigo-200 bg-indigo-50 text-indigo-700",
  SHIPPED: "border-violet-200 bg-violet-50 text-violet-700",
  OUT_FOR_DELIVERY: "border-purple-200 bg-purple-50 text-purple-700",
  DELIVERED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  RETURN_REQUESTED: "border-orange-200 bg-orange-50 text-orange-700",
  RETURNED: "border-orange-200 bg-orange-50 text-orange-700",
  REFUND_INITIATED: "border-yellow-200 bg-yellow-50 text-yellow-700",
  REFUNDED: "border-teal-200 bg-teal-50 text-teal-700",
  CANCELLED: "border-red-200 bg-red-50 text-red-600",
};

const TIMELINE_STEPS = [
  { label: "Order placed", description: "Order received" },
  { label: "Confirmed", description: "Preparing your items" },
  { label: "Shipped", description: "On the way" },
  { label: "Delivered", description: "Reached destination" },
];

const STATUS_STEP: Record<string, number> = {
  PENDING_PAYMENT: 0,
  PAID: 1,
  PROCESSING: 1,
  PACKED: 1,
  SHIPPED: 2,
  OUT_FOR_DELIVERY: 2,
  DELIVERED: 3,
  RETURN_REQUESTED: 3,
  RETURNED: 3,
  REFUND_INITIATED: 3,
  REFUNDED: 3,
};

function DetailSkeleton() {
  return (
    <main className="min-h-screen bg-[#f7f7f6] px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-32 rounded-lg" />
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <Skeleton className="h-96 rounded-lg" />
          <Skeleton className="h-80 rounded-lg" />
        </div>
      </div>
    </main>
  );
}

function formatEnum(value: string) {
  return value.replaceAll("_", " ").toLowerCase().replace(/^\w/, (letter) => letter.toUpperCase());
}

export function OrderDetailPage() {
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

  const paymentMutation = useMutation({
    mutationFn: async () => {
      const initiatedPayment = await initiatePayment(orderId);
      if (initiatedPayment.gateway !== "ZOHO") {
        throw new Error("This order does not use Zoho Payments");
      }

      window.location.assign(initiatedPayment.checkoutUrl);
      return new Promise<void>(() => undefined);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to open Zoho Payments");
    },
  });

  if (!isAuthenticated) {
    return (
      <main className="flex min-h-[65vh] flex-col items-center justify-center gap-5 bg-[#f7f7f6] px-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-zinc-400 ring-1 ring-zinc-200">
          <Package className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#222222]">Login to view this order</h1>
          <p className="mt-1 text-sm text-zinc-500">Order information is private to your account.</p>
        </div>
        <Button asChild className="rounded-lg bg-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/90">
          <Link href={`/login?redirect=${encodeURIComponent(`/orders/${orderId}`)}`}>Login</Link>
        </Button>
      </main>
    );
  }

  if (orderQuery.isLoading) return <DetailSkeleton />;

  if (!orderQuery.data) {
    return (
      <main className="flex min-h-[65vh] flex-col items-center justify-center gap-4 bg-[#f7f7f6] px-4 text-center">
        <Package className="h-11 w-11 text-zinc-300" />
        <h1 className="text-2xl font-bold text-[#222222]">Order not found</h1>
        <Link href="/orders" className="text-sm font-semibold text-[var(--brand-primary)] hover:underline">
          Back to orders
        </Link>
      </main>
    );
  }

  const order = orderQuery.data;
  const payment = order.payments[0];
  const statusStyle = STATUS_STYLES[order.status] ?? "border-zinc-200 bg-zinc-50 text-zinc-600";
  const statusLabel = ORDER_STATUS_LABEL[order.status] ?? order.status;
  const currentStep = STATUS_STEP[order.status] ?? 0;
  const subtotalCents = order.items.reduce((sum, item) => sum + item.subtotalCents, 0);
  const totalDifferenceCents = order.totalAmountCents - subtotalCents;
  const shippingCents = Math.max(totalDifferenceCents, 0);
  const discountCents = Math.max(-totalDifferenceCents, 0);
  const cancellableStatuses = [
    OrderStatus.PENDING_PAYMENT,
    OrderStatus.PAID,
    OrderStatus.PROCESSING,
    OrderStatus.PACKED,
  ];
  const canCancel = cancellableStatuses.includes(order.status);
  const canPay = order.status === OrderStatus.PENDING_PAYMENT;

  function handleCancelOrder() {
    if (!window.confirm("Cancel this order? Any reserved stock will be released.")) return;
    cancelMutation.mutate();
  }

  return (
    <main className="min-h-screen bg-[#f7f7f6] px-4 py-8 text-[#222222] sm:px-6 sm:py-12">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/orders"
          className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-500 transition-colors hover:text-[#222222]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to orders
        </Link>

        <header className="mt-6 flex flex-col gap-4 border-b border-zinc-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand-primary)]">Order Details</p>
            <h1 className="mt-2 text-2xl font-bold sm:text-3xl">Order #{order.id.slice(-12).toUpperCase()}</h1>
            <p className="mt-2 break-all font-mono text-xs text-zinc-400">{order.id}</p>
          </div>
          <div className="sm:text-right">
            <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${statusStyle}`}>
              {statusLabel}
            </span>
            <p className="mt-2 text-xs text-zinc-500">
              Placed {new Date(order.createdAt).toLocaleString("en-IN")}
            </p>
          </div>
        </header>

        <section className="mt-6 rounded-lg border border-zinc-200 bg-white p-5 sm:p-6">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="font-bold">Shipment progress</h2>
              <p className="mt-1 text-xs text-zinc-500">Latest progress for this order</p>
            </div>
            <Truck className="h-5 w-5 text-[var(--brand-primary)]" />
          </div>

          {order.status === OrderStatus.CANCELLED ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <p className="font-bold">This order was cancelled</p>
              <p className="mt-1 text-xs leading-relaxed">
                {order.notes || "Eligible refunds will be returned to the original payment method."}
              </p>
            </div>
          ) : (
            <ol className="relative grid gap-5 pl-3 sm:grid-cols-4 sm:gap-0 sm:pl-0">
              <div className="absolute bottom-4 left-[26px] top-4 w-px bg-zinc-200 sm:hidden" />
              {TIMELINE_STEPS.map((step, index) => {
                const isReached = currentStep >= index;
                const isCurrent = currentStep === index;

                return (
                  <li key={step.label} className="relative flex gap-4 sm:flex-col sm:items-center sm:gap-3 sm:text-center">
                    {index < TIMELINE_STEPS.length - 1 && (
                      <span
                        className={cn(
                          "absolute left-1/2 top-4 hidden h-px w-full sm:block",
                          currentStep > index ? "bg-emerald-500" : "bg-zinc-200",
                        )}
                      />
                    )}
                    <span
                      className={cn(
                        "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 bg-white",
                        isReached ? "border-emerald-500 text-emerald-600" : "border-zinc-200 text-zinc-400",
                        isCurrent && "ring-4 ring-emerald-50",
                      )}
                    >
                      {isReached ? <Check className="h-4 w-4" /> : <Clock3 className="h-3.5 w-3.5" />}
                    </span>
                    <span>
                      <span className={cn("block text-xs font-bold", isReached ? "text-[#222222]" : "text-zinc-400")}>
                        {step.label}
                      </span>
                      <span className="mt-1 block text-[10px] text-zinc-400">{step.description}</span>
                    </span>
                  </li>
                );
              })}
            </ol>
          )}
        </section>

        <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="rounded-lg border border-zinc-200 bg-white">
            <div className="border-b border-zinc-200 px-5 py-4">
              <h2 className="font-bold">Items ({order.items.length})</h2>
            </div>
            <div className="divide-y divide-zinc-200">
              {order.items.map((item) => (
                <div key={item.id} className="grid grid-cols-[72px_minmax(0,1fr)_auto] gap-4 p-4 sm:p-5">
                  <div className="h-[72px] w-[72px] overflow-hidden rounded-lg bg-zinc-50">
                    <ProductImage
                      src={item.component?.imageUrl}
                      alt={item.description}
                      className="h-full w-full"
                      imageClassName="object-contain p-2"
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="line-clamp-2 text-sm font-semibold">{item.description}</h3>
                    <p className="mt-1 text-xs text-zinc-500">Quantity: {item.quantity}</p>
                    {item.componentId && (
                      <Link
                        href={`/components/${item.component?.slug || item.componentId}`}
                        className="mt-2 inline-flex text-xs font-semibold text-[var(--brand-primary)] hover:underline"
                      >
                        View product
                      </Link>
                    )}
                  </div>
                  <p className="text-sm font-bold">{formatPrice(item.subtotalCents)}</p>
                </div>
              ))}
            </div>
          </section>

          <aside className="space-y-4 lg:sticky lg:top-28">
            <section className="rounded-lg border border-zinc-200 bg-white p-5">
              <h2 className="font-bold">Order summary</h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between gap-4 text-zinc-500">
                  <dt>Subtotal</dt>
                  <dd className="font-medium text-[#222222]">{formatPrice(subtotalCents)}</dd>
                </div>
                {shippingCents > 0 && (
                  <div className="flex justify-between gap-4 text-zinc-500">
                    <dt>Shipping</dt>
                    <dd className="font-medium text-[#222222]">{formatPrice(shippingCents)}</dd>
                  </div>
                )}
                {discountCents > 0 && (
                  <div className="flex justify-between gap-4 text-zinc-500">
                    <dt>Discount</dt>
                    <dd className="font-medium text-emerald-600">-{formatPrice(discountCents)}</dd>
                  </div>
                )}
                <div className="flex justify-between gap-4 border-t border-zinc-200 pt-3">
                  <dt className="font-bold">Total</dt>
                  <dd className="text-lg font-bold">{formatPrice(order.totalAmountCents)}</dd>
                </div>
              </dl>

              <dl className="mt-5 space-y-2 border-t border-zinc-200 pt-4 text-xs text-zinc-500">
                <div className="flex justify-between gap-4">
                  <dt>Payment</dt>
                  <dd className="text-right font-semibold text-[#222222]">
                    {payment ? formatEnum(payment.status) : "Not available"}
                  </dd>
                </div>
                {payment?.gateway && (
                  <div className="flex justify-between gap-4">
                    <dt>Method</dt>
                    <dd className="text-right font-semibold text-[#222222]">{formatEnum(payment.gateway)}</dd>
                  </div>
                )}
                <div className="flex justify-between gap-4">
                  <dt>Order type</dt>
                  <dd className="text-right font-semibold text-[#222222]">{formatEnum(order.orderType)}</dd>
                </div>
              </dl>

              <div className="mt-5 space-y-2">
                {canPay && (
                  <button
                    type="button"
                    onClick={() => paymentMutation.mutate()}
                    disabled={paymentMutation.isPending}
                    className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#222222] text-xs font-bold text-white transition-colors hover:bg-[var(--brand-primary)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <CreditCard className="h-4 w-4" />
                    {paymentMutation.isPending ? "Opening Zoho..." : "Complete Payment"}
                  </button>
                )}
                {canCancel && (
                  <button
                    type="button"
                    onClick={handleCancelOrder}
                    disabled={cancelMutation.isPending}
                    className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-red-200 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                  >
                    <Ban className="h-4 w-4" />
                    {cancelMutation.isPending ? "Cancelling..." : "Cancel Order"}
                  </button>
                )}
              </div>
            </section>

            {order.address && (
              <section className="rounded-lg border border-zinc-200 bg-white p-5">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[var(--brand-primary)]" />
                  <h2 className="font-bold">Shipping address</h2>
                </div>
                <address className="mt-3 text-xs not-italic leading-5 text-zinc-500">
                  <p className="font-semibold text-[#222222]">{order.address.name}</p>
                  <p>{order.address.line1}</p>
                  {order.address.line2 && <p>{order.address.line2}</p>}
                  <p>{order.address.city}, {order.address.state} - {order.address.pincode}</p>
                  <p>{order.address.country}</p>
                  <p className="mt-1">{order.address.phone}</p>
                </address>
              </section>
            )}

            <section className="rounded-lg border border-zinc-200 bg-white p-5">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-[var(--brand-primary)]" />
                <h2 className="font-bold">Shipping information</h2>
              </div>
              {order.trackingAwb ? (
                <div className="mt-3 space-y-2 text-xs text-zinc-500">
                  <p>AWB: <span className="break-all font-mono font-semibold text-[#222222]">{order.trackingAwb}</span></p>
                  {order.shippedAt && <p>Shipped: <span className="font-medium text-[#222222]">{new Date(order.shippedAt).toLocaleString("en-IN")}</span></p>}
                  {order.deliveredAt && <p>Delivered: <span className="font-medium text-[#222222]">{new Date(order.deliveredAt).toLocaleString("en-IN")}</span></p>}
                  {order.trackingUrl && (
                    <a
                      href={order.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1.5 font-bold text-[var(--brand-primary)] hover:underline"
                    >
                      Carrier tracking
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              ) : (
                <p className="mt-3 text-xs leading-relaxed text-zinc-500">
                  Carrier and AWB details will appear after the order ships.
                </p>
              )}
            </section>

            {[OrderStatus.PAID, OrderStatus.PROCESSING, OrderStatus.PACKED, OrderStatus.SHIPPED, OrderStatus.OUT_FOR_DELIVERY, OrderStatus.DELIVERED].includes(order.status) && (
              <a
                href={`${API_BASE_URL}/api/orders/${order.id}/invoice`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-zinc-300 bg-white text-xs font-semibold text-zinc-600 transition-colors hover:border-[#222222] hover:text-[#222222]"
              >
                <FileText className="h-4 w-4" />
                Download Invoice
              </a>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}
