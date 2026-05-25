"use client";

import Link from "next/link";
import { X, GitCompareArrows, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCompareStore } from "../hooks/useCompare";

export function ProductCompareBar() {
  const { compareList, remove, clearAll } = useCompareStore();

  if (compareList.length === 0) return null;

  return (
    <div
      className={cn(
        "border-t border-primary/20 bg-muted/65 px-4 py-3",
        "transition-all duration-300 animate-in slide-in-from-bottom duration-250",
      )}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-primary">
          <GitCompareArrows className="size-3.5" />
          Comparing {compareList.length}/3
        </span>
        <button
          type="button"
          onClick={clearAll}
          className="text-xs font-semibold text-muted-foreground hover:text-foreground transition duration-150"
        >
          Clear all
        </button>
      </div>

      <div className="flex gap-2">
        {compareList.map((product) => (
          <div
            key={product.id}
            className="relative flex-1 min-w-0 rounded-lg border border-border bg-card p-2 shadow-sm"
          >
            <button
              type="button"
              onClick={() => remove(product.id)}
              className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-foreground text-background hover:opacity-90 transition active:scale-90"
              aria-label={`Remove ${product.name} from compare`}
            >
              <X className="size-3" />
            </button>
            {product.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.imageUrl}
                alt=""
                className="mb-1.5 h-10 w-full rounded object-cover"
              />
            )}
            <p className="line-clamp-2 text-[10px] font-bold text-foreground leading-4">{product.name}</p>
            <p className="mt-0.5 text-[10px] font-extrabold text-primary font-mono">
              ₹{(product.priceCents / 100).toLocaleString("en-IN")}
            </p>
          </div>
        ))}

        {/* Empty slots */}
        {Array.from({ length: 3 - compareList.length }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="flex-1 min-w-0 rounded-lg border-2 border-dashed border-border/60 p-2 flex items-center justify-center bg-card/30"
          >
            <span className="text-[10px] font-bold text-muted-foreground/60 tracking-wide">+ Add product</span>
          </div>
        ))}
      </div>

      {compareList.length >= 2 && (
        <Link
          href={`/compare?ids=${compareList.map((p) => p.id).join(",")}`}
          className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary py-2 text-xs font-bold uppercase tracking-wider text-primary-foreground hover:bg-primary/95 transition active:scale-[0.98] duration-150 shadow-sm"
        >
          <ExternalLink className="size-3.5" />
          Compare side by side
        </Link>
      )}
    </div>
  );
}
