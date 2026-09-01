"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2, CreditCard, Download, Share2, ArrowRight, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatPaymentCard } from "../types/chat.types";
import { startRazorpayCheckout } from "../services/checkout.service";

interface PaymentCardProps {
  payment: ChatPaymentCard;
}

type PayState = "idle" | "initiating" | "paid" | "error";

export function PaymentCard({ payment }: PaymentCardProps) {
  const [payState, setPayState] = useState<PayState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handlePay() {
    setPayState("initiating");
    setErrorMessage(null);
    try {
      await startRazorpayCheckout(payment.orderId, {
        onSuccess: () => setPayState("paid"),
        onDismiss: () => setPayState("idle"),
        onError: (message) => {
          setErrorMessage(message);
          setPayState("error");
        },
      });
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : "Could not open the payment gateway.");
      setPayState("error");
    }
  }

  if (payState === "paid") {
    return <PaymentSuccessCard orderId={payment.orderId} amountCents={payment.amountCents} />;
  }

  const initiating = payState === "initiating";

  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card shadow-sm animate-in fade-in slide-in-from-bottom-1 duration-300">
      <div className="bg-gradient-to-r from-[var(--brand-primary)]/10 to-transparent px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2 text-foreground">
          <CreditCard className="size-4 text-primary" />
          <span className="text-[11px] font-bold uppercase tracking-[0.14em]">Secure Payment</span>
        </div>
        <p className="mt-0.5 text-[10px] text-muted-foreground font-bold font-mono tracking-wider">ORDER #{payment.orderId}</p>
      </div>

      <div className="px-4 py-6 text-center bg-background/50 border-b border-border/50">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Amount Payable</p>
        <p className="mt-1 text-3xl font-extrabold text-primary font-mono tracking-tight tabular-nums">
          ₹{(payment.amountCents / 100).toLocaleString("en-IN")}
        </p>
        <p className="mt-2 text-[9px] font-bold text-muted-foreground uppercase tracking-[0.14em]">UPI · Cards · Net Banking — secure checkout</p>
      </div>

      <div className="p-3 bg-card">
        <button
          type="button"
          onClick={handlePay}
          disabled={initiating}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold uppercase tracking-[0.14em] text-primary-foreground transition cursor-pointer shadow-sm active:scale-[0.98] duration-150",
            initiating
              ? "bg-secondary text-secondary-foreground border border-border cursor-not-allowed"
              : "bg-primary hover:bg-primary/95 hover:shadow-md",
          )}
        >
          {initiating ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Opening Gateway…
            </>
          ) : (
            <>
              <CreditCard className="size-4" />
              Pay ₹{(payment.amountCents / 100).toLocaleString("en-IN")}
            </>
          )}
        </button>

        {payState === "error" && errorMessage && (
          <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[10px] font-bold text-red-600">
            <AlertCircle className="size-3 shrink-0" />
            {errorMessage}
          </p>
        )}

        <p className="mt-3 text-center text-[9px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          🔒 256-bit encrypted · funds captured only on success
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

      <div className="flex flex-col gap-2 p-3 bg-card">
        <Link
          href={`/orders/${orderId}`}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-primary-foreground hover:bg-primary/95 transition cursor-pointer shadow-sm active:scale-[0.98] duration-150"
        >
          View Order in Profile
          <ArrowRight className="size-3.5" />
        </Link>
        <div className="flex gap-2">
          {invoiceUrl && (
            <a
              href={invoiceUrl}
              download
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border bg-secondary py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-secondary-foreground hover:bg-secondary/80 hover:text-foreground transition cursor-pointer active:scale-[0.98] duration-150"
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
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border bg-secondary py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-secondary-foreground hover:bg-secondary/80 hover:text-foreground transition cursor-pointer active:scale-[0.98] duration-150"
          >
            <Share2 className="size-3.5" />
            Share
          </button>
        </div>
      </div>
    </div>
  );
}

