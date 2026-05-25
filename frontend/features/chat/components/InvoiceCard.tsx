"use client";

import { useState } from "react";
import { FileText, Download, Mail, Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatInvoiceCard } from "../types/chat.types";

interface InvoiceCardProps {
  invoice: ChatInvoiceCard;
}

export function InvoiceCard({ invoice }: InvoiceCardProps) {
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  async function handleEmailResend() {
    setEmailSending(true);
    try {
      await fetch(`/api/orders/${invoice.orderId}/invoice/email`, {
        method: "POST",
        credentials: "include",
      });
      setEmailSent(true);
      window.setTimeout(() => setEmailSent(false), 3000);
    } catch {
      // Silently fail
    } finally {
      setEmailSending(false);
    }
  }

  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-border bg-card shadow-sm animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between bg-muted/60 px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2 text-foreground">
          <FileText className="size-4 text-primary" />
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider">Invoice</p>
            {invoice.invoiceId && (
              <p className="text-[9px] font-bold text-muted-foreground font-mono tracking-wider">#{invoice.invoiceId}</p>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-muted-foreground font-mono uppercase tracking-wider">Order #{invoice.orderId}</p>
          {invoice.issuedAt && (
            <p className="text-[9px] font-semibold text-muted-foreground font-mono mt-0.5">
              {new Date(invoice.issuedAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          )}
        </div>
      </div>

      {/* PDF Preview thumbnail */}
      {invoice.previewUrl ? (
        <div className="border-b border-border/50 bg-background/50 px-4 py-3 flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={invoice.previewUrl}
            alt="Invoice preview"
            className="mx-auto max-h-32 rounded border border-border bg-card shadow-sm object-contain p-1"
          />
        </div>
      ) : (
        <div className="flex items-center justify-center border-b border-border/50 bg-background/50 py-6">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <div className="flex size-12 items-center justify-center rounded-full bg-card border border-border shadow-inner">
              <FileText className="size-5 text-primary" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-1">Invoice PDF Document</p>
          </div>
        </div>
      )}

      {/* Amount */}
      <div className="px-4 py-5 text-center bg-background/20 border-b border-border/50">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Invoice Total</p>
        <p className="mt-1 text-3xl font-extrabold text-primary font-mono tracking-tight">
          ₹{(invoice.totalCents / 100).toLocaleString("en-IN")}
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-2 p-3 bg-card">
        {invoice.downloadUrl ? (
          <a
            href={invoice.downloadUrl}
            download={`invoice-${invoice.orderId}.pdf`}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary py-2 text-[10px] font-bold uppercase tracking-wider text-primary-foreground hover:bg-primary/95 transition cursor-pointer shadow-sm active:scale-95 duration-150"
          >
            <Download className="size-3.5" />
            Download PDF
          </a>
        ) : (
          <a
            href={`/api/orders/${invoice.orderId}/invoice`}
            download={`invoice-${invoice.orderId}.pdf`}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary py-2 text-[10px] font-bold uppercase tracking-wider text-primary-foreground hover:bg-primary/95 transition cursor-pointer shadow-sm active:scale-95 duration-150"
          >
            <Download className="size-3.5" />
            Download PDF
          </a>
        )}

        <button
          type="button"
          onClick={handleEmailResend}
          disabled={emailSending || emailSent}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-lg border py-2 text-[10px] font-bold uppercase tracking-wider transition cursor-pointer active:scale-95 duration-150",
            emailSent
              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold cursor-default"
              : "border-border bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:text-foreground",
          )}
        >
          {emailSending ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : emailSent ? (
            <CheckCircle2 className="size-3.5 text-emerald-500 dark:text-emerald-400" />
          ) : (
            <Mail className="size-3.5" />
          )}
          {emailSent ? "Sent!" : "Email Invoice"}
        </button>
      </div>
    </div>
  );
}

