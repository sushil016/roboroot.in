"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, CreditCard, Download, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatPaymentCard } from "../types/chat.types";

interface PaymentCardProps {
  payment: ChatPaymentCard;
}

export function PaymentCard({ payment }: PaymentCardProps) {
  const [initiating, setInitiating] = useState(false);
  const [paid, setPaid] = useState(false);

  async function handlePay() {
    setInitiating(true);
    try {
      if (typeof window !== "undefined" && !("Razorpay" in window)) {
        await loadScript("https://checkout.razorpay.com/v1/checkout.js");
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "",
        amount: payment.amountCents,
        currency: payment.currency ?? "INR",
        name: "RoboRoot",
        description: `Order #${payment.orderId}`,
        order_id: payment.razorpayOrderId,
        handler: () => {
          setPaid(true);
        },
        theme: { color: "#1CA2D1" },
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (e) {
      console.error("Razorpay initiation failed", e);
    } finally {
      setInitiating(false);
    }
  }

  if (paid) {
    return <PaymentSuccessCard orderId={payment.orderId} amountCents={payment.amountCents} />;
  }

  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-border bg-card shadow-sm animate-in fade-in duration-200">
      <div className="bg-muted/60 px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2 text-foreground">
          <CreditCard className="size-4 text-primary" />
          <span className="text-[11px] font-bold uppercase tracking-wider">Secure Payment</span>
        </div>
        <p className="mt-0.5 text-[10px] text-muted-foreground font-bold font-mono tracking-wider">ORDER #{payment.orderId}</p>
      </div>

      <div className="px-4 py-6 text-center bg-background/50 border-b border-border/50">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Amount Outstanding</p>
        <p className="mt-1 text-3xl font-extrabold text-primary font-mono tracking-tight">
          ₹{(payment.amountCents / 100).toLocaleString("en-IN")}
        </p>
        <p className="mt-2 text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Gateway transaction powered by Razorpay</p>
      </div>

      <div className="p-3 bg-card">
        <button
          type="button"
          onClick={handlePay}
          disabled={initiating}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold uppercase tracking-wider text-primary-foreground transition cursor-pointer shadow-sm active:scale-95 duration-150",
            initiating
              ? "bg-secondary text-secondary-foreground border border-border cursor-not-allowed"
              : "bg-primary hover:bg-primary/95",
          )}
        >
          {initiating ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Launching Gateway…
            </>
          ) : (
            <>
              <CreditCard className="size-4" />
              Pay ₹{(payment.amountCents / 100).toLocaleString("en-IN")}
            </>
          )}
        </button>
        <p className="mt-3 text-center text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
          🔒 Secure 256-bit encrypted checkout connection
        </p>
      </div>
    </div>
  );
}

// --- Payment Success Card ---

export interface PaymentSuccessCardData {
  orderId: string;
  amountCents: number;
  invoiceUrl?: string;
}

function PaymentSuccessCard({ orderId, amountCents, invoiceUrl }: PaymentSuccessCardData) {
  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-emerald-500/20 bg-card shadow-sm animate-in zoom-in duration-300">
      <div className="flex flex-col items-center gap-3.5 px-4 py-6 text-center bg-background/50 border-b border-border">
        {/* Animated emerald tick */}
        <div className="flex size-14 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)] animate-bounce">
          <CheckCircle2 className="size-8 text-emerald-500 dark:text-emerald-400" />
        </div>
        <div>
          <p className="text-sm font-bold text-foreground tracking-wide">Payment Successful!</p>
          <p className="text-xs font-semibold text-muted-foreground mt-1.5">
            ₹{(amountCents / 100).toLocaleString("en-IN")} received for order <strong className="text-foreground font-mono">#{orderId}</strong>
          </p>
        </div>
      </div>

      <div className="flex gap-2 p-3 bg-card">
        {invoiceUrl && (
          <a
            href={invoiceUrl}
            download
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary py-2 text-[10px] font-bold uppercase tracking-wider text-primary-foreground hover:bg-primary/95 transition cursor-pointer shadow-sm active:scale-95 duration-150"
          >
            <Download className="size-3.5" />
            Invoice PDF
          </a>
        )}
        <button
          type="button"
          onClick={() =>
            navigator.share?.({
              title: `RoboRoot Order #${orderId}`,
              text: `I just placed an order on RoboRoot! Order #${orderId}`,
            })
          }
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border bg-secondary py-2 text-[10px] font-bold uppercase tracking-wider text-secondary-foreground hover:bg-secondary/80 hover:text-foreground transition cursor-pointer active:scale-95 duration-150"
        >
          <Share2 className="size-3.5" />
          Share Order
        </button>
      </div>
    </div>
  );
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.body.appendChild(script);
  });
}

