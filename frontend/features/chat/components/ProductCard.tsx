"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ExternalLink,
  ShoppingCart,
  ChevronDown,
  ChevronUp,
  GitCompareArrows,
  Check,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatProductCard, StockStatus } from "../types/chat.types";
import { useCompare } from "../hooks/useCompare";
import { env } from "@/lib/env";

interface ProductCardProps {
  product: ChatProductCard;
}

const STOCK_CONFIG: Record<StockStatus, { label: string; className: string }> = {
  inStock: { label: "In Stock", className: "bg-transparent text-zinc-700 border border-zinc-200" },
  lowStock: { label: "Low Stock", className: "bg-transparent text-amber-700 border border-amber-500/30" },
  outOfStock: { label: "Out of Stock", className: "bg-transparent text-red-700 border border-red-500/30" },
};

export function ProductCard({ product }: ProductCardProps) {
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const { isCompared, toggle: toggleCompare } = useCompare(product);

  const stockConfig = product.stockStatus ? STOCK_CONFIG[product.stockStatus] : null;
  const isOutOfStock = product.stockStatus === "outOfStock";

  async function handleAddToCart() {
    if (isOutOfStock || addingToCart) return;
    setAddingToCart(true);
    try {
      await fetch(`${env.apiUrl}/api/cart/items`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ componentId: product.id, quantity: 1 }),
      });
      setAddedToCart(true);
      window.setTimeout(() => setAddedToCart(false), 2000);
    } catch {
      // Silently fallback if anything happens
    } finally {
      setAddingToCart(false);
    }
  }

  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-border bg-white shadow-xs transition-all duration-300 hover:border-black/30 hover:shadow-md font-sans">
      {/* Primary Info row */}
      <div className="flex gap-3.5 p-3">
        {/* Product image */}
        <Link href={product.href} className="shrink-0 group relative">
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-16 w-16 rounded-lg object-cover border border-border transition-transform duration-300 group-hover:scale-102"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-muted border border-border text-2xl transition-transform duration-300 group-hover:scale-102 select-none">
              🤖
            </div>
          )}
        </Link>

        {/* Details and Actions */}
        <div className="min-w-0 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-2">
              <Link
                href={product.href}
                className="flex-1 min-w-0 text-xs font-bold text-foreground hover:text-black transition-colors line-clamp-2 leading-5 tracking-wide"
              >
                {product.name}
              </Link>
              <Link
                href={product.href}
                className="shrink-0 grid size-6 place-items-center rounded-lg bg-white border border-zinc-200 text-zinc-500 hover:text-black transition-all"
                target="_blank"
                aria-label="Open product page in new tab"
                title="Full Page"
              >
                <ExternalLink className="size-3" />
              </Link>
            </div>

            {/* Badges strip */}
            <div className="mt-1.5 flex flex-wrap items-center gap-1">
              {product.category && (
                <span className="rounded bg-transparent border border-zinc-200 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-zinc-500">
                  {product.category}
                </span>
              )}
              {product.brand && (
                <span className="rounded bg-transparent border border-zinc-200 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-zinc-700">
                  {product.brand}
                </span>
              )}
              {stockConfig && (
                <span className={cn("rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider border", stockConfig.className)}>
                  {stockConfig.label}
                </span>
              )}
            </div>

            {/* Hardware specifications compatibility */}
            {product.compatibility && product.compatibility.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1">
                {product.compatibility.map((c) => (
                  <span
                    key={c}
                    className="rounded-full border border-zinc-200 bg-transparent px-2 py-0.5 text-[9px] font-bold text-zinc-500 uppercase tracking-wider"
                  >
                    ✓ {c}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Pricing and Actions Row */}
          <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-border pt-2.5">
            <span className="text-sm font-extrabold text-black font-mono">
              ₹{(product.priceCents / 100).toLocaleString("en-IN")}
            </span>
            <div className="flex items-center gap-1">
              {/* Compare toggle */}
              <button
                type="button"
                onClick={toggleCompare}
                title={isCompared ? "Remove from comparisons" : "Add to comparisons"}
                className={cn(
                  "grid size-7 place-items-center rounded-lg border transition cursor-pointer",
                  isCompared
                    ? "border-black bg-black/5 text-black"
                    : "border-border bg-transparent text-zinc-400 hover:border-black/30 hover:text-black",
                )}
                aria-label="Compare product specification"
              >
                <GitCompareArrows className="size-3.5" />
              </button>

              {/* Quick specifications toggle */}
              <button
                type="button"
                onClick={() => setQuickViewOpen((v) => !v)}
                title="Quick specifications"
                className="grid size-7 place-items-center rounded-lg border border-border bg-transparent text-zinc-400 hover:border-black/30 hover:text-black cursor-pointer transition"
                aria-label={quickViewOpen ? "Close details" : "Open details"}
              >
                {quickViewOpen ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
              </button>

              {/* Add to checkout cart */}
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock || addingToCart}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer shadow-sm",
                  isOutOfStock
                    ? "cursor-not-allowed border border-border text-zinc-400 bg-zinc-50"
                    : addedToCart
                      ? "bg-emerald-600 text-white"
                      : "bg-black text-white hover:bg-black/85",
                )}
                aria-label="Add product to cart"
              >
                {addingToCart ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : addedToCart ? (
                  <Check className="size-3" />
                ) : (
                  <ShoppingCart className="size-3" />
                )}
                {isOutOfStock ? "Out of Stock" : addedToCart ? "Added!" : "Buy"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Specs / Details slider row */}
      {quickViewOpen && (
        <div className="border-t border-border bg-zinc-50/50 px-4 py-3 text-xs text-foreground/90 animate-in slide-in-from-top duration-250">
          {product.description && (
            <p className="mb-3 leading-5 text-muted-foreground">{product.description}</p>
          )}
          {product.specs && Object.keys(product.specs).length > 0 && (
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="min-w-full text-[11px] font-sans">
                <tbody>
                  {Object.entries(product.specs).map(([key, val]) => (
                    <tr key={key} className="border-b border-border/40 last:border-0 hover:bg-muted/45 transition-colors">
                      <td className="w-1/3 px-3 py-2 font-bold text-muted-foreground uppercase tracking-wider">{key}</td>
                      <td className="px-3 py-2 text-foreground/90 font-medium leading-4">{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {(!product.description && (!product.specs || Object.keys(product.specs).length === 0)) && (
            <p className="text-muted-foreground italic py-1">No hardware parameters specified.</p>
          )}
          <div className="mt-3.5 pt-2.5 border-t border-border/40 flex items-center justify-end">
            <Link
              href={product.href}
              className="inline-flex items-center gap-1 text-[10px] font-bold text-black uppercase tracking-wider hover:underline"
            >
              Full details page
              <ExternalLink className="size-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
