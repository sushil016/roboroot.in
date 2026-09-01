"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Box,
  CheckCircle2,
  Clock3,
  Download,
  ExternalLink,
  LoaderCircle,
  MapPin,
  Scale,
} from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/user.store";
import { formatPrice } from "@/store/cart.store";
import { initiatePayment } from "@/features/payment/services/payment.service";
import { threeDPrintingApi } from "../services/three-d-printing.service";
import { PrintStatusBadge } from "./PrintOrdersPage";

export function PrintOrderDetailPage({ orderId }: { orderId: string }) {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [isPaying, setIsPaying] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const orderQuery = useQuery({
    queryKey: ["3d-print-order", orderId],
    queryFn: () => threeDPrintingApi.getOrder(orderId),
    enabled: isAuthenticated && Boolean(orderId),
  });

  async function handlePayment(commerceOrderId: string) {
    setIsPaying(true);
    try {
      const payment = await initiatePayment(commerceOrderId);
      if (payment.gateway === "ZOHO") {
        window.location.assign(payment.checkoutUrl);
        return;
      }
      window.location.assign("/checkout/payment/" + commerceOrderId);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not open payment");
    } finally {
      setIsPaying(false);
    }
  }

  if (authLoading || orderQuery.isLoading) {
    return <div className="grid min-h-[60vh] place-items-center bg-[#f4f4f2]"><LoaderCircle className="h-6 w-6 animate-spin" /></div>;
  }
  if (!isAuthenticated) {
    router.replace("/login?redirect=/3d-printing/orders/" + orderId);
    return null;
  }
  if (orderQuery.isError || !orderQuery.data) {
    return (
      <div className="grid min-h-[60vh] place-items-center bg-[#f4f4f2] px-4 text-center">
        <div>
          <h1 className="text-2xl font-bold">Print order not found</h1>
          <Link href="/3d-printing/orders" className="mt-4 inline-flex text-sm font-bold text-emerald-800">Back to print orders</Link>
        </div>
      </div>
    );
  }

  const order = orderQuery.data;
  const address = order.commerceOrder.address;
  const canPay = order.status === "PAYMENT_PENDING";

  return (
    <div className="min-h-screen bg-[#f4f4f2]">
      <header className="border-b border-zinc-800 bg-zinc-950 px-5 py-9 text-white">
        <div className="mx-auto max-w-6xl">
          <Link href="/3d-printing/orders" className="inline-flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Print orders
          </Link>
          <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-mono text-xs font-bold text-emerald-400">{order.reference}</p>
              <h1 className="mt-2 max-w-3xl break-words text-3xl font-bold">{order.modelFile.originalName}</h1>
              <div className="mt-3"><PrintStatusBadge status={order.status} /></div>
            </div>
            {canPay && (
              <button
                type="button"
                onClick={() => void handlePayment(order.commerceOrder.id)}
                disabled={isPaying}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-emerald-500 px-5 text-sm font-black text-zinc-950 hover:bg-emerald-400 disabled:opacity-50"
              >
                {isPaying && <LoaderCircle className="h-4 w-4 animate-spin" />}
                Pay {formatPrice(order.totalAmountCents)}
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-8">
          <section className="border-y border-zinc-300 bg-white">
            <div className="grid sm:grid-cols-2">
              <Detail label="Material" value={order.material.name + " · " + order.color} />
              <Detail label="Quality" value={order.quality.replace(/_/g, " ")} />
              <Detail label="Infill" value={order.infillPercent + "%"} />
              <Detail label="Finish" value={order.finish.replace(/_/g, " ")} />
              <Detail label="Quantity" value={String(order.quantity)} />
              <Detail label="Estimated weight" value={order.totalWeightGrams.toFixed(1) + " g"} />
            </div>
          </section>

          <section>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase text-emerald-800">Production</p>
                <h2 className="mt-1 text-2xl font-bold">Status timeline</h2>
              </div>
              <span className="flex items-center gap-2 text-xs font-bold text-zinc-500"><Clock3 className="h-4 w-4" /> {order.estimatedDays} working days</span>
            </div>
            <ol className="border-l border-zinc-300">
              {order.statusHistory.map((event) => (
                <li key={event.id} className="relative pb-7 pl-6 last:pb-0">
                  <span className="absolute -left-2 top-0 grid h-4 w-4 place-items-center rounded-full bg-emerald-700 ring-4 ring-[#f4f4f2]">
                    <CheckCircle2 className="h-2.5 w-2.5 text-white" />
                  </span>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-black">{event.status.replace(/_/g, " ")}</p>
                    <time className="text-xs font-semibold text-zinc-500">{new Date(event.createdAt).toLocaleString("en-IN")}</time>
                  </div>
                  {event.note && <p className="mt-1 text-sm text-zinc-500">{event.note}</p>}
                </li>
              ))}
            </ol>
          </section>

          <section>
            <div className="flex items-center justify-between border-b border-zinc-300 pb-4">
              <div className="flex items-center gap-3">
                <Box className="h-5 w-5" />
                <div>
                  <h2 className="font-bold">Original model</h2>
                  <p className="text-xs text-zinc-500">{order.modelFile.format} · {(order.modelFile.sizeBytes / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <button
                type="button"
                disabled={isDownloading}
                onClick={async () => {
                  setIsDownloading(true);
                  try {
                    await threeDPrintingApi.downloadModel(order.modelFile.id, order.modelFile.originalName);
                  } catch (error) {
                    toast.error(error instanceof Error ? error.message : "Download failed");
                  } finally {
                    setIsDownloading(false);
                  }
                }}
                className="grid h-10 w-10 place-items-center rounded-md border border-zinc-300 bg-white hover:border-zinc-950"
                aria-label="Download original model"
                title="Download original model"
              >
                {isDownloading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              </button>
            </div>
            <div className="grid grid-cols-2 divide-x divide-zinc-300 border-b border-zinc-300 sm:grid-cols-4">
              <Detail label="Width" value={order.modelFile.widthMm.toFixed(1) + " mm"} compact />
              <Detail label="Depth" value={order.modelFile.depthMm.toFixed(1) + " mm"} compact />
              <Detail label="Height" value={order.modelFile.heightMm.toFixed(1) + " mm"} compact />
              <Detail label="Volume" value={(order.modelFile.volumeMm3 / 1000).toFixed(1) + " cm3"} compact />
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="border border-zinc-300 bg-white p-5">
            <div className="flex items-center gap-2"><Scale className="h-4 w-4 text-emerald-700" /><h2 className="font-bold">Price summary</h2></div>
            <div className="mt-4 divide-y divide-zinc-200 text-sm">
              <PriceRow label="Base service" value={order.baseFeeCents} />
              <PriceRow label="Material" value={order.materialCostCents} />
              {order.qualityMarkupCents !== 0 && <PriceRow label="Quality adjustment" value={order.qualityMarkupCents} />}
              {order.finishFeeCents !== 0 && <PriceRow label="Finishing" value={order.finishFeeCents} />}
              <PriceRow label="Print subtotal" value={order.subtotalCents} />
              <PriceRow label="Delivery" value={order.shippingCents} free />
            </div>
            <div className="mt-4 flex items-end justify-between border-t border-zinc-950 pt-4">
              <span className="text-sm font-bold">Total</span>
              <strong className="text-2xl">{formatPrice(order.totalAmountCents)}</strong>
            </div>
          </section>

          <section className="border border-zinc-300 bg-white p-5">
            <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-emerald-700" /><h2 className="font-bold">Delivery</h2></div>
            <p className="mt-4 text-sm font-bold">{address.name}</p>
            <p className="mt-1 text-sm leading-6 text-zinc-500">
              {address.line1}{address.line2 ? ", " + address.line2 : ""}<br />
              {address.city}, {address.state} {address.pincode}<br />
              {address.phone}
            </p>
            {order.commerceOrder.trackingUrl && (
              <a href={order.commerceOrder.trackingUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-emerald-800">
                Track shipment <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </section>
        </aside>
      </main>
    </div>
  );
}

function Detail({
  label,
  value,
  compact = false,
}: {
  label: string;
  value: string;
  compact?: boolean;
}) {
  return (
    <div className={(compact ? "px-3 py-4" : "border-b border-zinc-200 p-5 sm:border-r")}>
      <p className="text-[10px] font-black uppercase text-zinc-500">{label}</p>
      <p className="mt-1 break-words text-sm font-bold">{value}</p>
    </div>
  );
}

function PriceRow({ label, value, free = false }: { label: string; value: number; free?: boolean }) {
  return (
    <div className="flex justify-between gap-3 py-2.5">
      <span className="text-zinc-500">{label}</span>
      <strong>{free && value === 0 ? "Free" : formatPrice(value)}</strong>
    </div>
  );
}
