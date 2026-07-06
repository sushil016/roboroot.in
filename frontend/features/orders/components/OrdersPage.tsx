"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { PackageCheck, ArrowRight } from "lucide-react";
import { orderApi } from "@/features/products/services/product.service";
import { formatPrice } from "@/store/cart.store";
import { useAuthStore } from "@/store/user.store";
import { ProductImage } from "@/features/products/components/ProductImage";
import { Skeleton } from "@/components/ui/skeleton";
import { MagicCard } from "@/components/ui/magic-card";
import { AccountShell } from "@/features/user/components/AccountShell";
import { Button } from "@/components/ui/button";
import { ORDER_STATUS_LABEL, OrderStatus } from "@/types/marketplace.types";

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

function OrderSkeleton() {
  return (
    <div className="rounded-2xl border border-[#D2D2D0] bg-white p-5 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-3.5 w-20" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3.5 w-32" />
        </div>
        <div className="text-right space-y-2">
          <Skeleton className="h-7 w-24 ml-auto" />
          <Skeleton className="h-8 w-28 rounded-lg ml-auto" />
        </div>
      </div>
      <div className="flex gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-24 shrink-0 rounded-xl" />
        ))}
      </div>
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
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-5 px-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#E8E8E6]">
          <PackageCheck className="h-7 w-7 text-zinc-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#222222]">Login to view orders</h1>
          <p className="mt-1 text-sm text-zinc-500">Your order history is linked to your account.</p>
        </div>
        <Button asChild className="bg-[#1CA2D1] hover:bg-[#1CA2D1]/90">
          <Link href="/login?redirect=/orders">Login</Link>
        </Button>
      </div>
    );
  }

  return (
    <AccountShell>
      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#222222]">Order History</h1>
          <p className="mt-1 text-sm text-zinc-500">Track and manage your past purchases.</p>
        </div>

        {ordersQuery.isLoading && (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <OrderSkeleton key={i} />
            ))}
          </div>
        )}

        {!ordersQuery.isLoading && ordersQuery.data?.length === 0 && (
          <MagicCard
            className="rounded-2xl [--color-background:#ffffff]"
            gradientFrom="#1CA2D1"
            gradientTo="#E8E8E6"
            gradientColor="#1CA2D1"
            gradientOpacity={0.05}
          >
            <div className="flex flex-col items-center gap-5 p-14 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#E8E8E6]">
                <PackageCheck className="h-7 w-7 text-zinc-300" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#222222]">No orders yet</h2>
                <p className="mt-1 text-sm text-zinc-500">Start shopping to see your orders here.</p>
              </div>
              <Button asChild className="bg-[#222222] hover:bg-[#1CA2D1]">
                <Link href="/components">Browse Components</Link>
              </Button>
            </div>
          </MagicCard>
        )}

        <div className="space-y-4">
          {ordersQuery.data?.map((order, i) => (
            <motion.div
              key={order.id}
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
                <div className="p-5 space-y-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400">
                        Order ID
                      </p>
                      <p className="font-mono text-sm font-semibold text-[#222222] truncate max-w-[220px]">
                        {order.id}
                      </p>
                      <p className="text-xs text-zinc-400">
                        {new Date(order.createdAt).toLocaleString("en-IN")}
                      </p>
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
                          STATUS_STYLES[order.status] ?? "text-zinc-600 bg-zinc-50 border-zinc-200"
                        }`}
                      >
                        {ORDER_STATUS_LABEL[order.status as OrderStatus] ?? order.status}
                      </span>
                    </div>
                    <div className="flex flex-col items-start gap-2 sm:items-end">
                      <p className="text-2xl font-bold text-[#1CA2D1]">
                        {formatPrice(order.totalAmountCents)}
                      </p>
                      <Link
                        href={`/orders/${order.id}`}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-[#D2D2D0] px-4 py-2 text-xs font-semibold text-[#222222] hover:bg-[#E8E8E6] hover:border-[#222222] transition-colors"
                      >
                        View Details
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>

                  {order.items.length > 0 && (
                    <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="w-36 shrink-0 rounded-xl border border-[#D2D2D0] bg-[#F2F2F0] p-2.5"
                        >
                          <div className="aspect-square overflow-hidden rounded-lg bg-[#F2F2F0] mb-2">
                            <ProductImage
                              src={item.component?.imageUrl}
                              alt={item.description}
                              className="h-full w-full"
                              imageClassName="object-contain"
                            />
                          </div>
                          <p className="line-clamp-2 text-[11px] font-semibold text-[#222222] leading-4">
                            {item.description}
                          </p>
                          <p className="mt-1 text-[10px] text-zinc-400">Qty {item.quantity}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </MagicCard>
            </motion.div>
          ))}
        </div>
      </div>
    </AccountShell>
  );
}
