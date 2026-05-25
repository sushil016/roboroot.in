"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Copy, RefreshCw, ThumbsDown, ThumbsUp, ExternalLink, Bot, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatFeedback, ChatMessage } from "../types/chat.types";
import { MessageContent } from "./MessageContent";
import { ProductCard } from "./ProductCard";
import { OrderCard } from "./OrderCard";
import { PaymentCard } from "./PaymentCard";
import { InvoiceCard } from "./InvoiceCard";

interface MessageBubbleProps {
  message: ChatMessage;
  isLast?: boolean;
  onRegenerate?: () => void;
  onRetry?: (content: string) => void;
  isStreaming?: boolean;
}

export function MessageBubble({ message, isLast, onRegenerate, onRetry, isStreaming }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<ChatFeedback>(message.feedback ?? null);

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
  const isTyping = !isUser && message.content === "";
  const isErrorState = message.isError || message.isRateLimited;

  return (
    <div className={cn("group relative flex gap-3 max-w-full font-sans", isUser ? "justify-end" : "justify-start")}>
      {/* Bot Icon for assistant */}
      {!isUser && (
        <div className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-zinc-150 border border-zinc-200 shadow-xs">
          <Bot className="size-4 text-zinc-600" />
        </div>
      )}

      <div className="flex min-w-0 max-w-[85%] flex-col gap-1.5">
        {/* Bubble */}
        <div
          className={cn(
            "relative rounded-[18px] px-4 py-3 text-sm leading-6 transition-all duration-200 shadow-xs",
            isUser
              ? "rounded-tr-sm bg-zinc-900 text-white"
              : "rounded-tl-sm bg-zinc-100 text-zinc-900 border-none",
            isErrorState && !isUser && "border border-red-200 bg-red-50 text-red-700",
          )}
        >
          {isTyping ? (
            <div className="flex items-center gap-1.5 py-1.5 pl-1" aria-label="Assistant is thinking">
              <span className="size-2 animate-bounce rounded-full bg-[#1CA2D1]" style={{ animationDelay: "0ms" }} />
              <span className="size-2 animate-bounce rounded-full bg-[#1CA2D1]/70" style={{ animationDelay: "150ms" }} />
              <span className="size-2 animate-bounce rounded-full bg-[#1CA2D1]/40" style={{ animationDelay: "300ms" }} />
            </div>
          ) : isUser ? (
            <p className="whitespace-pre-wrap font-medium">{message.content}</p>
          ) : (
            <div
              className={cn(
                "relative",
                isLast && isStreaming && "after:content-['▋'] after:animate-[cursor-blink_1s_infinite] after:ml-0.5 after:text-[#1CA2D1] after:text-xs after:align-middle"
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
            <div className="mt-4 space-y-1.5 border-t border-border pt-2.5">
              {message.citations.map((citation) => (
                <p
                  key={`${citation.sourceType}-${citation.title}-${citation.pageLabel ?? ""}`}
                  className="flex items-center gap-2 text-[10px] text-muted-foreground font-semibold"
                >
                  <span className="rounded bg-muted border border-border px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-muted-foreground">
                    {citation.sourceType === "product" ? "Product" : citation.sourceType === "document" ? "Manual" : "Project"}
                  </span>
                  {citation.href ? (
                    <a
                      href={citation.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-[#1CA2D1] hover:underline flex items-center gap-1 transition-colors"
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
                isUser ? "bg-white text-zinc-950 hover:bg-zinc-100" : "bg-[#1CA2D1] text-white hover:bg-[#1CA2D1]/90",
              )}
            >
              {message.actionLabel}
            </Link>
          )}

          {/* Retry sending message */}
          {message.retryContent && onRetry && (
            <button
              type="button"
              onClick={() => onRetry(message.retryContent!)}
              className="mt-2.5 flex items-center gap-1.5 text-xs font-bold text-red-400 hover:text-red-300 transition-colors cursor-pointer"
            >
              <RefreshCw className="size-3" />
              Try again
            </button>
          )}
        </div>

        {/* Hover Micro-Actions Toolbar */}
        <div
          className={cn(
            "flex items-center gap-1 opacity-0 transition-all duration-200 group-hover:opacity-100",
            isUser ? "justify-end pr-1" : "justify-start pl-1",
          )}
        >
          <span className="text-[10px] text-zinc-500 font-semibold select-none">{timestamp}</span>

          {!isUser && !isTyping && (
            <>
              {/* Copy message text */}
              <button
                type="button"
                onClick={copyMessage}
                className="grid size-6 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition"
                aria-label="Copy message content"
                title="Copy"
              >
                {copied ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
              </button>

              {/* Thumbs up */}
              <button
                type="button"
                onClick={() => handleFeedback("up")}
                className={cn(
                  "grid size-6 place-items-center rounded-lg transition",
                  feedback === "up"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
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
                  "grid size-6 place-items-center rounded-lg transition",
                  feedback === "down"
                    ? "bg-red-500/10 text-red-400 border border-red-500/20"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
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
                  className="grid size-6 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition"
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
                className="ml-1 flex items-center gap-1 rounded-lg px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground border border-border bg-card hover:bg-background hover:text-[#1CA2D1] transition"
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
