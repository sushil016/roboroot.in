"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, Package, ShoppingCart, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Component } from "@/lib/types/marketplace.types";
import { formatPrice } from "@/lib/store/cartStore";
import { productImageUrl } from "@/features/marketplace/lib/catalog";

interface ProductRevealCardProps {
  component: Component;
  onAddToCart?: (component: Component, qty?: number) => void;
  onToggleWishlist?: (component: Component) => void;
  isWishlisted?: boolean;
  className?: string;
  compact?: boolean;
}

const CATEGORY_ACCENT: Record<string, string> = {
  Semiconductors: "#6366f1",
  Sensors: "#06b6d4",
  "Development Boards": "var(--brand-primary)",
  "Motors & Actuators": "#f97316",
  "Power & Batteries": "#10b981",
  "Drones & Aerospace": "#8b5cf6",
  "Robomaniac Store": "#f43f5e",
  "Tools & Prototyping": "#64748b",
};

export function ProductRevealCard({
  component,
  onAddToCart,
  onToggleWishlist,
  isWishlisted = false,
  className,
  compact = false,
}: ProductRevealCardProps) {
  const [hovered, setHovered] = useState(false);
  const isOutOfStock = component.stockQuantity === 0;
  const isLowStock = !isOutOfStock && component.stockQuantity <= 10;
  const accent = CATEGORY_ACCENT[component.category] ?? "var(--brand-primary)";

  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border bg-white transition-all duration-300",
        hovered
          ? "border-zinc-300 shadow-xl -translate-y-0.5"
          : "border-[#E4E4D8] shadow-sm",
        isOutOfStock && "opacity-75",
        className
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image area */}
      <Link
        href={`/components/${component.id}`}
        className="relative block overflow-hidden bg-[#F7F7EF]"
        style={{ aspectRatio: compact ? "4/3" : "1/1" }}
      >
        {/* Accent top bar */}
        <div
          className="absolute inset-x-0 top-0 h-0.5 z-10 transition-opacity duration-300"
          style={{ backgroundColor: accent, opacity: hovered ? 1 : 0 }}
        />

        {/* Badges */}
        <div className="absolute left-3 top-3 z-10 flex flex-col gap-1.5">
          {isOutOfStock && (
            <span className="rounded-md bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
              Sold Out
            </span>
          )}
          {isLowStock && !isOutOfStock && (
            <span className="rounded-md bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white">
              Only {component.stockQuantity} left
            </span>
          )}
          {component.isBestSeller && !isOutOfStock && (
            <span
              className="rounded-md px-2 py-0.5 text-[10px] font-bold text-white"
              style={{ backgroundColor: accent }}
            >
              Best Seller
            </span>
          )}
          {component.isRobomaniacItem && (
            <span className="rounded-md border border-[#D2D2D0] bg-white/95 px-2 py-0.5 text-[10px] font-bold text-zinc-600">
              Robomaniac
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          className={cn(
            "absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border shadow-sm transition-all duration-200",
            isWishlisted
              ? "border-transparent bg-[var(--brand-primary)] text-white scale-100 opacity-100"
              : hovered
              ? "border-[#D2D2D0] bg-white text-zinc-400 opacity-100 scale-100"
              : "border-[#D2D2D0] bg-white text-zinc-400 opacity-0 scale-90"
          )}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleWishlist?.(component);
          }}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            className="h-3.5 w-3.5"
            fill={isWishlisted ? "currentColor" : "none"}
          />
        </button>

        {/* Product image */}
        {component.imageUrl ? (
          <motion.img
            src={productImageUrl(component)}
            alt={component.name}
            animate={{ scale: hovered ? 1.06 : 1 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="h-full w-full object-contain p-6"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Package className="h-16 w-16 text-zinc-200" />
          </div>
        )}

        {/* Subtle gradient on hover */}
        <motion.div
          animate={{ opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at 50% 100%, ${accent}18 0%, transparent 70%)`,
          }}
        />
      </Link>

      {/* Info area */}
      <div className="flex flex-1 flex-col px-4 pt-3.5 pb-4">
        {/* Category label */}
        <p
          className="text-[10px] font-bold uppercase tracking-[0.16em] leading-none truncate"
          style={{ color: accent }}
        >
          {component.subcategory || component.category}
        </p>

        {/* Product name */}
        <Link
          href={`/components/${component.id}`}
          className="mt-1.5 block"
        >
          <h3 className="line-clamp-2 text-[14px] font-bold leading-[1.4] text-[#222222] hover:text-[var(--brand-primary)] transition-colors">
            {component.name}
          </h3>
        </Link>

        {/* Brand */}
        {component.brand && (
          <p className="mt-1 text-[11px] font-medium text-zinc-400">{component.brand}</p>
        )}

        {/* Price row */}
        <div className="mt-auto flex items-end justify-between pt-3">
          <div className="flex flex-col">
            <span className="text-[18px] font-black leading-none text-[var(--brand-primary)]">
              {formatPrice(component.unitPriceCents)}
            </span>
            <span className="mt-0.5 text-[10px] font-semibold text-emerald-600">Inc. GST</span>
          </div>
          <span
            className={cn(
              "text-[10px] font-semibold",
              isOutOfStock
                ? "text-red-500"
                : isLowStock
                ? "text-amber-600"
                : "text-zinc-400"
            )}
          >
            {isOutOfStock
              ? "Out of stock"
              : `${component.stockQuantity} in stock`}
          </span>
        </div>

        {/* Add to cart button */}
        <button
          disabled={isOutOfStock}
          onClick={(e) => {
            e.preventDefault();
            if (!isOutOfStock) onAddToCart?.(component, 1);
          }}
          className={cn(
            "mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-[12px] font-bold transition-all duration-200",
            isOutOfStock
              ? "cursor-not-allowed bg-zinc-100 text-zinc-400"
              : hovered
              ? "bg-[var(--brand-primary)] text-white shadow-md shadow-[var(--brand-primary)]/20"
              : "bg-[#F2F2F0] text-[#222222] hover:bg-[var(--brand-primary)] hover:text-white"
          )}
        >
          {isOutOfStock ? (
            "Out of Stock"
          ) : (
            <>
              <ShoppingCart className="h-3.5 w-3.5 shrink-0" />
              Add to Cart
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export function ProductRevealCardSkeleton({ compact = false }: { compact?: boolean }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#E4E4D8] bg-white">
      <div
        className={cn("animate-pulse bg-[#F0F0E8]", compact ? "aspect-[4/3]" : "aspect-square")}
      />
      <div className="space-y-2.5 px-4 py-4">
        <div className="h-2.5 w-14 animate-pulse rounded-full bg-[#E8E8E6]" />
        <div className="h-4 w-full animate-pulse rounded-md bg-[#E8E8E6]" />
        <div className="h-4 w-3/4 animate-pulse rounded-md bg-[#E8E8E6]" />
        <div className="flex items-center justify-between pt-2">
          <div className="h-6 w-20 animate-pulse rounded-md bg-[#E8E8E6]" />
          <div className="h-2.5 w-16 animate-pulse rounded-full bg-[#E8E8E6]" />
        </div>
        <div className="h-9 w-full animate-pulse rounded-xl bg-[#E8E8E6]" />
      </div>
    </div>
  );
}
