"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface SlashCommand {
  command: string;
  label: string;
  description: string;
  icon: string;
}

const SLASH_COMMANDS: SlashCommand[] = [
  { command: "/order", label: "Order", description: "Create or view an order", icon: "📦" },
  { command: "/track", label: "Track", description: "Track an existing order", icon: "🚚" },
  { command: "/invoice", label: "Invoice", description: "Get an invoice by order ID", icon: "🧾" },
  { command: "/search", label: "Search", description: "Search for products", icon: "🔍" },
  { command: "/cart", label: "Cart", description: "View your current cart", icon: "🛒" },
  { command: "/support", label: "Support", description: "Talk to a human agent", icon: "💬" },
  { command: "/compare", label: "Compare", description: "Compare two products", icon: "⚖️" },
];

interface SlashCommandPopupProps {
  query: string;
  onSelect: (command: string) => void;
}

export function SlashCommandPopup({ query, onSelect }: SlashCommandPopupProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const filtered = SLASH_COMMANDS.filter((cmd) =>
    cmd.command.startsWith(query.toLowerCase()) ||
    cmd.label.toLowerCase().startsWith(query.replace("/", "").toLowerCase()),
  );

  // Keyboard navigation handled via window listener (InputBar calls this from textarea)
  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (filtered.length === 0) return;
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((i) => (i + 1) % filtered.length);
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex((i) => (i - 1 + filtered.length) % filtered.length);
      } else if (event.key === "Tab" || event.key === "Enter") {
        const item = filtered[activeIndex];
        if (item) {
          event.preventDefault();
          onSelect(item.command);
        }
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [activeIndex, filtered, onSelect]);

  if (filtered.length === 0) return null;

  return (
    <div className="absolute bottom-full left-3 right-3 z-50 mb-2 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl animate-in slide-in-from-bottom duration-150">
      <div className="border-b border-zinc-100 bg-zinc-50 px-3 py-1.5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Slash Commands</p>
      </div>
      <ul role="listbox" className="max-h-52 overflow-y-auto py-1">
        {filtered.map((cmd, idx) => (
          <li key={cmd.command} role="option" aria-selected={idx === activeIndex}>
            <button
              type="button"
              onClick={() => onSelect(cmd.command)}
              onMouseEnter={() => setActiveIndex(idx)}
              className={cn(
                "flex w-full items-center gap-3 px-3 py-2 text-left transition cursor-pointer",
                idx === activeIndex
                  ? "bg-zinc-100 text-zinc-900"
                  : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900",
              )}
            >
              <span className="shrink-0 text-base">{cmd.icon}</span>
              <div className="min-w-0 flex-1">
                <span className="block text-xs font-bold">{cmd.command}</span>
                <span className="block text-[10px] text-zinc-400 mt-0.5">{cmd.description}</span>
              </div>
              {idx === activeIndex && (
                <kbd className="shrink-0 rounded bg-zinc-50 px-1.5 py-0.5 text-[9px] font-bold font-mono text-zinc-400 border border-zinc-200">Tab</kbd>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
