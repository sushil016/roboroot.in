"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Box, Clock3, LoaderCircle, PackageOpen } from "lucide-react";
import { useAuthStore } from "@/store/user.store";
import { formatPrice } from "@/store/cart.store";
import { threeDPrintingApi } from "../services/three-d-printing.service";
import type { PrintOrderStatus } from "../types";

const STATUS_STYLE: Record<PrintOrderStatus, string> = {
  PAYMENT_PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  PAID: "bg-blue-50 text-blue-700 border-blue-200",
  UNDER_REVIEW: "bg-violet-50 text-violet-700 border-violet-200",
  APPROVED: "bg-cyan-50 text-cyan-700 border-cyan-200",
  PRINTING: "bg-indigo-50 text-indigo-700 border-indigo-200",
  POST_PROCESSING: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200",
  QUALITY_CHECK: "bg-sky-50 text-sky-700 border-sky-200",
  PACKED: "bg-teal-50 text-teal-700 border-teal-200",
  SHIPPED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  DELIVERED: "bg-green-50 text-green-700 border-green-200",
  ON_HOLD: "bg-orange-50 text-orange-700 border-orange-200",
  CANCELLED: "bg-zinc-100 text-zinc-600 border-zinc-200",
  REFUNDED: "bg-red-50 text-red-700 border-red-200",
};

export function PrintStatusBadge({ status }: { status: PrintOrderStatus }) {
  return (
    <span className={"inline-flex rounded-full border px-2.5 py-1 text-[10px] font-black uppercase " + STATUS_STYLE[status]}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

export function PrintOrdersPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const ordersQuery = useQuery({
    queryKey: ["3d-print-orders"],
    queryFn: threeDPrintingApi.listOrders,
    enabled: isAuthenticated,
  });

  if (authLoading || ordersQuery.isLoading) {
    return (
      <div className="grid min-h-[60vh] place-items-center bg-[#f4f4f2]">
        <LoaderCircle className="h-6 w-6 animate-spin text-zinc-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="grid min-h-[60vh] place-items-center bg-[#f4f4f2] px-4 text-center">
        <div>
          <Box className="mx-auto h-8 w-8 text-emerald-700" />
          <h1 className="mt-4 text-3xl font-bold">Your 3D print orders</h1>
          <Link href="/login?redirect=/3d-printing/orders" className="mt-5 inline-flex h-11 items-center rounded-md bg-zinc-950 px-5 text-sm font-bold text-white">
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  const orders = ordersQuery.data ?? [];

  return (
    <div className="min-h-screen bg-[#f4f4f2]">
      <header className="border-b border-zinc-800 bg-zinc-950 px-5 py-10 text-white">
        <div className="mx-auto flex max-w-5xl flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase text-emerald-400">Fabrication history</p>
            <h1 className="mt-2 text-3xl font-bold sm:text-4xl">My 3D Print Orders</h1>
          </div>
          <Link href="/3d-printing" className="inline-flex h-10 w-fit items-center gap-2 rounded-md border border-zinc-700 px-4 text-sm font-bold hover:bg-zinc-900">
            New print <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        {orders.length === 0 ? (
          <div className="border-y border-zinc-300 py-20 text-center">
            <PackageOpen className="mx-auto h-8 w-8 text-zinc-400" />
            <h2 className="mt-4 text-xl font-bold">No print orders yet</h2>
            <Link href="/3d-printing" className="mt-5 inline-flex h-10 items-center rounded-md bg-zinc-950 px-4 text-sm font-bold text-white">
              Open 3D Printing Studio
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-zinc-300 border-y border-zinc-300">
            {orders.map((order) => (
              <article key={order.id} className="grid gap-5 py-6 md:grid-cols-[1fr_auto] md:items-center">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="font-mono text-sm font-black">{order.reference}</p>
                    <PrintStatusBadge status={order.status} />
                  </div>
                  <h2 className="mt-3 truncate text-lg font-bold">{order.modelFile.originalName}</h2>
                  <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-zinc-500">
                    <span>{order.material.name} · {order.color}</span>
                    <span>{order.quantity} piece{order.quantity === 1 ? "" : "s"}</span>
                    <span>{order.totalWeightGrams.toFixed(1)} g</span>
                    <span className="flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" /> {new Date(order.createdAt).toLocaleDateString("en-IN")}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-5 md:justify-end">
                  <p className="text-xl font-black">{formatPrice(order.totalAmountCents)}</p>
                  <Link
                    href={"/3d-printing/orders/" + order.id}
                    className="inline-flex h-10 items-center gap-2 rounded-md border border-zinc-300 bg-white px-4 text-sm font-bold transition hover:border-zinc-950"
                  >
                    Details <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
