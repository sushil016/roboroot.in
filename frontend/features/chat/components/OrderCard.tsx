"use client";

import Link from "next/link";
import { Package, CheckCircle2, Clock, Truck, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatOrderCard } from "../types/chat.types";

interface OrderCardProps {
  order: ChatOrderCard;
}

const STATUS_STEPS = ["confirmed", "processing", "shipped", "delivered"] as const;
type OrderStatus = (typeof STATUS_STEPS)[number] | "cancelled";

const STEP_LABELS: Record<string, string> = {
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const STEP_ICONS = {
  confirmed: CheckCircle2,
  processing: Clock,
  shipped: Truck,
  delivered: MapPin,
};

export function OrderCard({ order }: OrderCardProps) {
  const currentIdx = STATUS_STEPS.indexOf(order.status as (typeof STATUS_STEPS)[number]);
  const isCancelled = order.status === "cancelled";

  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-border bg-card shadow-sm animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between bg-muted/60 px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2 text-foreground">
          <Package className="size-4 text-primary" />
          <span className="text-[11px] font-bold font-mono tracking-wider">ORDER #{order.orderId}</span>
        </div>
        <span
          className={cn(
            "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border",
            isCancelled
              ? "bg-red-500/10 border-red-500/20 text-red-500 dark:text-red-400"
              : "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400",
          )}
        >
          {STEP_LABELS[order.status] ?? order.status}
        </span>
      </div>

      {/* Status timeline progress flow */}
      {!isCancelled && (
        <div className="px-4 py-5 border-b border-border/50">
          <div className="flex items-center justify-between">
            {STATUS_STEPS.map((step, idx) => {
              const Icon = STEP_ICONS[step];
              const isCompleted = currentIdx >= idx;
              const isCurrent = currentIdx === idx;
              return (
                <div key={step} className="flex flex-1 flex-col items-center">
                  <div className="relative flex items-center justify-center w-full">
                    {idx > 0 && (
                      <div
                        className={cn(
                          "absolute right-1/2 h-[3px] w-full -translate-y-1/2",
                          isCompleted ? "bg-primary" : "bg-border",
                        )}
                        style={{ top: "50%" }}
                      />
                    )}
                    <div
                      className={cn(
                        "relative z-10 flex size-9 items-center justify-center rounded-full border-2 transition duration-300",
                        isCompleted
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background text-muted-foreground",
                        isCurrent && "shadow-md shadow-primary/20 ring-2 ring-primary/40 border-primary-foreground",
                      )}
                    >
                      {isCurrent && (
                        <span className="absolute inset-0 rounded-full animate-ping bg-primary/30" />
                      )}
                      <Icon className="size-4" />
                    </div>
                  </div>
                  <span
                    className={cn(
                      "mt-2 text-center text-[9px] font-bold uppercase tracking-wider",
                      isCompleted ? "text-primary font-extrabold" : "text-muted-foreground",
                    )}
                  >
                    {STEP_LABELS[step]}
                  </span>
                </div>
              );
            })}
          </div>

          {order.estimatedDelivery && (
            <p className="mt-4 text-center text-xs text-muted-foreground font-medium">
              Estimated Delivery: <strong className="text-foreground">{order.estimatedDelivery}</strong>
            </p>
          )}
        </div>
      )}

      {/* Items specifications */}
      <div className="px-4 py-3 bg-background/50">
        <div className="space-y-2">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs font-medium">
              <span className="text-foreground/90">
                {item.name} <span className="text-muted-foreground font-bold ml-1 font-mono text-[10px]">×{item.qty}</span>
              </span>
              <span className="font-bold text-foreground font-mono">
                ₹{((item.priceCents * item.qty) / 100).toLocaleString("en-IN")}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-2.5 flex items-center justify-between border-t border-border/50 pt-2.5">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Subtotal</span>
          <span className="text-sm font-extrabold text-primary font-mono">
            ₹{(order.totalCents / 100).toLocaleString("en-IN")}
          </span>
        </div>
      </div>

      {/* Primary Actions row */}
      <div className="flex gap-2 p-3 bg-card border-t border-border">
        {order.trackingUrl ? (
          <a
            href={order.trackingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary py-2 text-[10px] font-bold uppercase tracking-wider text-primary-foreground hover:bg-primary/95 transition cursor-pointer shadow-sm active:scale-95 duration-150"
          >
            <Truck className="size-3.5 shrink-0" />
            Track Package
          </a>
        ) : (
          <Link
            href={`/orders/${order.orderId}`}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary py-2 text-[10px] font-bold uppercase tracking-wider text-primary-foreground hover:bg-primary/95 transition cursor-pointer shadow-sm active:scale-95 duration-150"
          >
            Details
          </Link>
        )}
        <Link
          href={`/orders/${order.orderId}/invoice`}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border bg-secondary py-2 text-[10px] font-bold uppercase tracking-wider text-secondary-foreground hover:bg-secondary/80 hover:text-foreground transition cursor-pointer active:scale-95 duration-150"
        >
          Invoice
        </Link>
      </div>
    </div>
  );
}
