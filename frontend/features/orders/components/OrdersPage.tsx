"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, PackageCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductImage } from "@/features/products/components/ProductImage";
import { orderApi } from "@/features/products/services/product.service";
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

function OrderSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white p-4 sm:p-5">
      <Skeleton className="h-16 w-16 shrink-0 rounded-lg" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-3 w-36" />
      </div>
      <Skeleton className="hidden h-10 w-32 rounded-lg sm:block" />
    </div>
  );
}

export function OrdersPage() {
  const { isAuthenticated } = useAuthStore();
  const ordersQuery = useQuery({
    queryKey: ["my-orders"],
    queryFn: () => orderApi.getMyOrders(),
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <main className="flex min-h-[65vh] flex-col items-center justify-center gap-5 bg-[#f7f7f6] px-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-zinc-400 ring-1 ring-zinc-200">
          <PackageCheck className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#222222]">Login to view orders</h1>
          <p className="mt-1 text-sm text-zinc-500">Your order history is linked to your account.</p>
        </div>
        <Button asChild className="rounded-lg bg-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/90">
          <Link href="/login?redirect=/orders">Login</Link>
        </Button>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f7f6] px-4 py-10 sm:px-6 sm:py-14">
      <div className="mx-auto w-full max-w-4xl">
        <header className="mb-8 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand-primary)]">My Account</p>
          <h1 className="mt-2 text-3xl font-bold text-[#222222] sm:text-4xl">Your Orders</h1>
          <p className="mt-2 text-sm text-zinc-500">View order information and delivery progress in one place.</p>
        </header>

        {ordersQuery.isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <OrderSkeleton key={index} />
            ))}
          </div>
        )}

        {!ordersQuery.isLoading && ordersQuery.data?.length === 0 && (
          <div className="flex flex-col items-center rounded-xl border border-zinc-200 bg-white px-6 py-14 text-center">
            <PackageCheck className="h-9 w-9 text-zinc-300" />
            <h2 className="mt-4 text-lg font-bold text-[#222222]">No orders yet</h2>
            <p className="mt-1 text-sm text-zinc-500">Your purchases will appear here after checkout.</p>
            <Button asChild className="mt-5 rounded-lg bg-[#222222] hover:bg-[var(--brand-primary)]">
              <Link href="/components">Browse Components</Link>
            </Button>
          </div>
        )}

        <div className="space-y-3">
          {ordersQuery.data?.map((order) => {
            const previewItem = order.items[0];
            const remainingItems = Math.max(order.items.length - 1, 0);

            return (
              <article
                key={order.id}
                className="grid gap-4 rounded-xl border border-zinc-200 bg-white p-4 transition-colors hover:border-zinc-300 sm:grid-cols-[72px_minmax(0,1fr)_auto] sm:items-center sm:p-5"
              >
                <div className="h-[72px] w-[72px] overflow-hidden rounded-lg border border-zinc-100 bg-zinc-50">
                  <ProductImage
                    src={previewItem?.component?.imageUrl}
                    alt={previewItem?.description || "Order items"}
                    className="h-full w-full"
                    imageClassName="object-contain p-2"
                  />
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-mono text-sm font-semibold text-[#222222]">
                      #{order.id.slice(-12).toUpperCase()}
                    </p>
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${
                        STATUS_STYLES[order.status] ?? "border-zinc-200 bg-zinc-50 text-zinc-600"
                      }`}
                    >
                      {ORDER_STATUS_LABEL[order.status as OrderStatus] ?? order.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-zinc-500">
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                    <span className="mx-2 text-zinc-300">|</span>
                    {order.items.length} {order.items.length === 1 ? "item" : "items"}
                    {remainingItems > 0 && previewItem ? `, including ${previewItem.description}` : ""}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-4 border-t border-zinc-100 pt-4 sm:flex-col sm:items-end sm:border-0 sm:pt-0">
                  <p className="text-lg font-bold text-[#222222]">{formatPrice(order.totalAmountCents)}</p>
                  <Link
                    href={`/orders/${order.id}`}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#222222] px-4 text-xs font-bold text-white transition-colors hover:bg-[var(--brand-primary)]"
                  >
                    Order Details
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </main>
  );
}
