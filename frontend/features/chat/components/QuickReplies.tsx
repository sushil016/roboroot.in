"use client";

interface QuickRepliesProps {
  disabled: boolean;
  onSelect: (message: string) => void;
}

const QUICK_REPLIES = [
  "Compare ESP32 boards",
  "Create an order",
  "Pay with UPI",
  "Track my order",
];

export function QuickReplies({ disabled, onSelect }: QuickRepliesProps) {
  return (
    <div className="grid grid-cols-2 gap-2 px-5 pb-4">
      {QUICK_REPLIES.map((reply) => (
        <button
          key={reply}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(reply)}
          className="min-h-11 rounded-xl border border-zinc-200 bg-zinc-50/50 px-3.5 py-2.5 text-left text-xs font-bold leading-5 text-zinc-700 hover:border-zinc-400 hover:bg-zinc-50 hover:text-zinc-900 hover:shadow-xs transition active:scale-[0.98] disabled:opacity-50 cursor-pointer"
        >
          {reply}
        </button>
      ))}
    </div>
  );
}
