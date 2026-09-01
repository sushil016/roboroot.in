"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Copy, RefreshCw, ThumbsDown, ThumbsUp, ExternalLink, Bot, HelpCircle, Pencil, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatFeedback, ChatMessage } from "../types/chat.types";
import { MessageContent } from "./MessageContent";
import { ProductCard } from "./ProductCard";
import { OrderCard } from "./OrderCard";
import { PaymentCard } from "./PaymentCard";
import { InvoiceCard } from "./InvoiceCard";
import { env } from "@/lib/env";

interface MessageBubbleProps {
  message: ChatMessage;
  isLast?: boolean;
  onRegenerate?: () => void;
  onRetry?: (content: string) => void;
  isStreaming?: boolean;
  status?: string | null;
  onEdit?: (content: string) => void;
  onEditLastQuery?: () => void;
}

function getStatusLabel(status: string | null | undefined): string {
  if (!status) return "Thinking...";
  if (status === "connecting") return "Connecting...";
  if (status === "classifying") return "Analyzing request...";
  if (status === "retrieving") return "Searching components...";
  if (status === "thinking") return "Thinking...";
  if (status === "writing") return "Formulating answer...";
  return "Thinking...";
}

export function MessageBubble({
  message,
  isLast,
  onRegenerate,
  onRetry,
  isStreaming,
  status,
  onEdit,
  onEditLastQuery,
}: MessageBubbleProps) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<ChatFeedback>(message.feedback ?? null);

  const [addressSaved, setAddressSaved] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  });

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.line1 || !formData.city || !formData.state || !formData.pincode) {
      setAddressError("Please fill out all required fields.");
      return;
    }
    setSavingAddress(true);
    setAddressError(null);
    try {
      const response = await fetch(`${env.apiUrl}/api/addresses`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, isDefault: true }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to save address");
      }
      setAddressSaved(true);
      window.dispatchEvent(new CustomEvent("chat-send-message", { detail: { message: "I have added my default shipping address, please checkout my cart." } }));
    } catch (err: any) {
      setAddressError(err.message || "An error occurred while saving.");
    } finally {
      setSavingAddress(false);
    }
  };

  async function copyMessage() {
    if (!message.content) return;
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  function handleFeedback(value: "up" | "down") {
    setFeedback((prev) => (prev === value ? null : value));
  }

  const timestamp = formatTimestamp(message.createdAt);
  const isTyping = !isUser && message.content === "" && !message.isCancelled;
  const isErrorState = message.isError || message.isRateLimited;

  return (
    <div className={cn("group relative flex gap-3 max-w-full font-sans", isUser ? "justify-end" : "justify-start")}>
      {/* Bot Icon for assistant */}
      {!isUser && (
        <div className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-black border border-black text-white shadow-md">
          <Bot className="size-4 text-white" />
        </div>
      )}

      <div className="flex min-w-0 max-w-[85%] flex-col gap-1.5">
        {/* Bubble */}
        <div
          className={cn(
            "relative rounded-[18px] px-4 py-3 text-sm leading-6 transition-all duration-300 shadow-xs",
            isUser
              ? "rounded-tr-sm bg-black text-white"
              : "rounded-tl-sm bg-[var(--brand-primary)]/5 border border-[var(--brand-primary)]/10 hover:border-[var(--brand-primary)]/25 text-black",
            isErrorState && !isUser && "border border-red-200 bg-red-50/80 text-red-700",
          )}
        >
          {isTyping ? (
            <div className="flex items-center gap-2 py-1.5 pl-1" aria-label="Assistant is thinking">
              <div className="flex items-center gap-1 shrink-0">
                <span className="size-1.5 animate-bounce rounded-full bg-black" style={{ animationDelay: "0ms" }} />
                <span className="size-1.5 animate-bounce rounded-full bg-black/70" style={{ animationDelay: "150ms" }} />
                <span className="size-1.5 animate-bounce rounded-full bg-black/40" style={{ animationDelay: "300ms" }} />
              </div>
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest animate-pulse ml-1 select-none">
                {getStatusLabel(status)}
              </span>
            </div>
          ) : message.isCancelled ? (
            <div className="flex flex-col gap-2">
              <p className="text-zinc-500 italic">Chat cancelled.</p>
              {onEditLastQuery && (
                <button
                  type="button"
                  onClick={onEditLastQuery}
                  className="mt-1.5 self-start inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-bold text-black hover:bg-black/5 transition-all cursor-pointer shadow-xs"
                >
                  <Pencil className="size-3 text-black" />
                  <span>Edit query</span>
                </button>
              )}
            </div>
          ) : isUser ? (
            <p className="whitespace-pre-wrap font-medium">{message.content}</p>
          ) : (
            <div
              className={cn(
                "relative",
                isLast && isStreaming && "after:content-['▋'] after:animate-[cursor-blink_1s_infinite] after:ml-0.5 after:text-[var(--brand-primary)] after:text-xs after:align-middle"
              )}
            >
              <MessageContent content={message.content} />
            </div>
          )}

          {/* Product recommendations */}
          {message.products.length > 0 && (
            <div className="mt-3 space-y-2.5">
              {message.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Order progress cards */}
          {message.orderCards?.length > 0 && (
            <div className="mt-3 space-y-2.5">
              {message.orderCards.map((order) => (
                <OrderCard key={order.orderId} order={order} />
              ))}
            </div>
          )}

          {/* UPI QR Payment cards */}
          {message.paymentCards?.length > 0 && (
            <div className="mt-3 space-y-2.5">
              {message.paymentCards.map((payment) => (
                <PaymentCard key={payment.orderId} payment={payment} />
              ))}
            </div>
          )}

          {/* Invoice cards */}
          {message.invoiceCards?.length > 0 && (
            <div className="mt-3 space-y-2.5">
              {message.invoiceCards.map((invoice) => (
                <InvoiceCard key={invoice.orderId} invoice={invoice} />
              ))}
            </div>
          )}

          {/* Citations / Links */}
          {message.citations.length > 0 && (
            <div className="mt-4 space-y-1.5 border-t border-[var(--brand-primary)]/10 pt-2.5">
              {message.citations.map((citation) => (
                <p
                  key={`${citation.sourceType}-${citation.title}-${citation.pageLabel ?? ""}`}
                  className="flex items-center gap-2 text-[10px] text-zinc-500 font-semibold"
                >
                  <span className="rounded bg-[var(--brand-primary)]/5 border border-[var(--brand-primary)]/15 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-[var(--brand-primary)]">
                    {citation.sourceType === "product" ? "Product" : citation.sourceType === "document" ? "Manual" : "Project"}
                  </span>
                  {citation.href ? (
                    <a
                      href={citation.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-[var(--brand-primary)] hover:underline flex items-center gap-1 transition-colors"
                    >
                      {citation.title}
                      {citation.pageLabel ? ` · ${citation.pageLabel}` : ""}
                      <ExternalLink className="size-2.5" />
                    </a>
                  ) : (
                    <span>{citation.title}{citation.pageLabel ? ` · ${citation.pageLabel}` : ""}</span>
                  )}
                </p>
              ))}
            </div>
          )}

          {/* Next.js Redirect Action button */}
          {message.actionHref && message.actionLabel && (
            <Link
              href={message.actionHref}
              className={cn(
                "mt-3 inline-flex min-h-9 items-center justify-center gap-2 rounded-xl px-4 text-xs font-bold transition hover:scale-[1.02] cursor-pointer",
                isUser ? "bg-white text-black hover:bg-white/90" : "bg-black text-white hover:bg-zinc-800",
              )}
            >
              {message.actionLabel}
            </Link>
          )}

          {/* Address Input Form */}
          {message.addressFormRequired && !addressSaved && (
            <form onSubmit={handleAddressSubmit} className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 p-4 space-y-3 font-sans text-zinc-950">
              <p className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Add Shipping Address</p>
              
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs focus:border-black focus:outline-none"
                    placeholder="Sushil Sahani"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs focus:border-black focus:outline-none"
                    placeholder="9876543210"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase">Address Line 1 *</label>
                <input
                  type="text"
                  required
                  value={formData.line1}
                  onChange={(e) => setFormData({ ...formData, line1: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs focus:border-black focus:outline-none"
                  placeholder="Flat No, Bldg Name, Street"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase">Address Line 2 (Optional)</label>
                <input
                  type="text"
                  value={formData.line2}
                  onChange={(e) => setFormData({ ...formData, line2: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs focus:border-black focus:outline-none"
                  placeholder="Landmark, Area"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase">City *</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs focus:border-black focus:outline-none"
                    placeholder="Mumbai"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase">State *</label>
                  <input
                    type="text"
                    required
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs focus:border-black focus:outline-none"
                    placeholder="MH"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase">Pincode *</label>
                  <input
                    type="text"
                    required
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs focus:border-black focus:outline-none"
                    placeholder="400037"
                  />
                </div>
              </div>

              {addressError && (
                <p className="text-[11px] font-semibold text-red-600">{addressError}</p>
              )}

              <button
                type="submit"
                disabled={savingAddress}
                className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-black py-2 text-xs font-bold text-white hover:bg-black/90 transition disabled:opacity-50 cursor-pointer"
              >
                {savingAddress && <Loader2 className="size-3.5 animate-spin" />}
                <span>Save Address & Continue</span>
              </button>
            </form>
          )}

          {addressSaved && (
            <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50/50 p-3.5 flex items-center gap-2 text-xs font-bold text-emerald-800 animate-in fade-in duration-200">
              <Check className="size-4 shrink-0" />
              <span>Address saved successfully! Resuming checkout...</span>
            </div>
          )}

          {/* Retry sending message */}
          {message.retryContent && onRetry && (
            <button
              type="button"
              onClick={() => onRetry(message.retryContent!)}
              className="mt-2.5 flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-600 transition-colors cursor-pointer"
            >
              <RefreshCw className="size-3" />
              Try again
            </button>
          )}
        </div>

        {/* Hover Micro-Actions Toolbar */}
        <div
          className={cn(
            "flex items-center gap-1 opacity-0 transition-all duration-300 group-hover:opacity-100",
            isUser ? "justify-end pr-1" : "justify-start pl-1",
          )}
        >
          <span className="text-[10px] text-zinc-400 font-semibold select-none">{timestamp}</span>

          {isUser && onEdit && (
            <button
              type="button"
              onClick={() => onEdit(message.content)}
              className="grid size-6 place-items-center rounded-lg text-zinc-400 hover:bg-black/5 hover:text-black transition-all ml-1 cursor-pointer"
              aria-label="Edit message"
              title="Edit"
            >
              <Pencil className="size-3" />
            </button>
          )}

          {!isUser && !isTyping && !message.isCancelled && (
            <>
              {/* Copy message text */}
              <button
                type="button"
                onClick={copyMessage}
                className="grid size-6 place-items-center rounded-lg text-zinc-400 hover:bg-black/5 hover:text-black transition-all"
                aria-label="Copy message content"
                title="Copy"
              >
                {copied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
              </button>

              {/* Thumbs up */}
              <button
                type="button"
                onClick={() => handleFeedback("up")}
                className={cn(
                  "grid size-6 place-items-center rounded-lg transition-all",
                  feedback === "up"
                    ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/25"
                    : "text-zinc-400 hover:bg-[var(--brand-primary)]/5 hover:text-[var(--brand-primary)]",
                )}
                aria-label="Thumbs up"
                title="Helpful"
              >
                <ThumbsUp className="size-3" />
              </button>

              {/* Thumbs down */}
              <button
                type="button"
                onClick={() => handleFeedback("down")}
                className={cn(
                  "grid size-6 place-items-center rounded-lg transition-all",
                  feedback === "down"
                    ? "bg-red-500/10 text-red-500 border border-red-500/25"
                    : "text-zinc-400 hover:bg-red-50/50 hover:text-red-500",
                )}
                aria-label="Thumbs down"
                title="Not helpful"
              >
                <ThumbsDown className="size-3" />
              </button>

              {/* Regenerate assistant reply */}
              {isLast && onRegenerate && (
                <button
                  type="button"
                  onClick={onRegenerate}
                  className="grid size-6 place-items-center rounded-lg text-zinc-400 hover:bg-[var(--brand-primary)]/10 hover:text-[var(--brand-primary)] transition-all"
                  aria-label="Regenerate last response"
                  title="Regenerate"
                >
                  <RefreshCw className="size-3" />
                </button>
              )}

              {/* Human handoff button */}
              <a
                href="/support"
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1 flex items-center gap-1 rounded-lg px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-zinc-500 border border-zinc-200 bg-white hover:bg-[var(--brand-primary)]/10 hover:text-[var(--brand-primary)] hover:border-[var(--brand-primary)]/20 transition-all"
                title="Talk to a support specialist"
              >
                <HelpCircle className="size-2.5" />
                <span>Talk to a person</span>
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function formatTimestamp(iso: string): string {
  try {
    const date = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `${diffH}h ago`;
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  } catch {
    return "";
  }
}
