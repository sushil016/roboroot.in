"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { ChevronDown, Bot, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "../types/chat.types";
import { MessageBubble } from "./MessageBubble";

interface MessageListProps {
  messages: ChatMessage[];
  onRegenerate?: () => void;
  onRetry?: (content: string) => void;
  isStreaming?: boolean;
  status?: string | null;
  onEdit?: (content: string) => void;
  onEditLastQuery?: () => void;
}

const EXAMPLE_PROMPTS = [
  { icon: "🤖", text: "Which microcontroller is best for a drone?", label: "Product advice" },
  { icon: "📦", text: "Track my last order", label: "Order tracking" },
  { icon: "🔌", text: "Compare ESP32 vs Arduino Nano", label: "Comparison" },
];

export function MessageList({
  messages,
  onRegenerate,
  onRetry,
  isStreaming,
  status,
  onEdit,
  onEditLastQuery,
}: MessageListProps) {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const isUserScrollingRef = useRef(false);

  // Determine the index of the last assistant message for "regenerate" button
  const lastAssistantIdx = messages.reduce<number>((last, msg, idx) => {
    return msg.role === "assistant" ? idx : last;
  }, -1);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    endRef.current?.scrollIntoView({ behavior, block: "end" });
  }, []);

  // Scroll handler — detect if user scrolled away from bottom
  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    const awayFromBottom = distFromBottom > 80;
    setShowScrollButton(awayFromBottom);
    isUserScrollingRef.current = awayFromBottom;
  }, []);

  // Auto-scroll when new messages arrive, UNLESS user is reading old messages
  useEffect(() => {
    if (!isUserScrollingRef.current) {
      scrollToBottom("smooth");
    }
  }, [messages, scrollToBottom]);

  // Initial scroll to bottom (instant)
  useEffect(() => {
    scrollToBottom("instant");
  }, [scrollToBottom]);

  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-white text-zinc-900">
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 space-y-4 overflow-y-auto px-4 py-5 scroll-smooth scrollbar-hide bg-white"
      >
        {messages.length === 0 ? (
          <EmptyState onSelectPrompt={onRetry} />
        ) : (
          messages.map((message, idx) => (
            <MessageBubble
              key={message.id}
              message={message}
              isLast={idx === lastAssistantIdx}
              onRegenerate={idx === lastAssistantIdx ? onRegenerate : undefined}
              onRetry={onRetry}
              isStreaming={isStreaming}
              status={status}
              onEdit={onEdit}
              onEditLastQuery={onEditLastQuery}
            />
          ))
        )}
        <div ref={endRef} className="h-1" />
      </div>

      {/* Scroll-to-bottom floating button */}
      <button
        type="button"
        onClick={() => {
          isUserScrollingRef.current = false;
          setShowScrollButton(false);
          scrollToBottom("smooth");
        }}
        aria-label="Scroll to latest message"
        className={cn(
          "absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white/95 backdrop-blur-md px-3 py-1.5 text-xs font-semibold text-zinc-500 shadow-md transition-all duration-200 hover:text-zinc-900 hover:bg-zinc-50 cursor-pointer",
          showScrollButton ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-2 pointer-events-none",
        )}
      >
        <Bot className="size-3.5" />
        Latest
      </button>
    </div>
  );
}

interface EmptyStateProps {
  onSelectPrompt?: (text: string) => void;
}

function EmptyState({ onSelectPrompt }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[320px] gap-6 py-6 font-sans">
      {/* Premium pulsing AI Avatar */}
      <div className="flex size-14 items-center justify-center rounded-2xl bg-zinc-50 border border-zinc-200 shadow-xs animate-[float_3s_ease-in-out_infinite] shrink-0">
        <Bot className="size-7 text-[#1CA2D1]" />
      </div>

      <div className="text-center">
        <p className="text-sm font-black text-zinc-900 uppercase tracking-wider">What are you building today?</p>
        <p className="mt-1 text-xs text-zinc-500 font-semibold">Ask about drone builds, component comparison, or order tracking.</p>
      </div>

      {/* Example prompts in premium cards */}
      <div className="w-full space-y-2">
        {EXAMPLE_PROMPTS.map((prompt) => (
          <button
            key={prompt.text}
            type="button"
            onClick={() => onSelectPrompt?.(prompt.text)}
            className="w-full flex items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-3 text-left text-xs transition hover:border-zinc-400 hover:bg-zinc-50 hover:shadow-xs cursor-pointer group"
          >
            <span className="text-base select-none">{prompt.icon}</span>
            <span className="flex-1 font-bold text-zinc-700 group-hover:text-zinc-900 transition-colors">{prompt.text}</span>
            <span className="rounded bg-zinc-100 border border-zinc-200 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-zinc-400 transition group-hover:border-zinc-300">
              {prompt.label}
            </span>
          </button>
        ))}
      </div>

      {/* tip command list hint */}
      <p className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-black tracking-wider uppercase select-none">
        <Bot className="size-3 text-[#1CA2D1]" />
        Tip: type <kbd className="rounded bg-zinc-100 border border-zinc-200 px-1.5 py-0.5 font-mono text-[9px] text-[#1CA2D1]">/</kbd> for quick commands
      </p>
    </div>
  );
}
