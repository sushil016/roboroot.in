"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Heart, Package, ShoppingCart, Zap, ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { Component } from "@/types/marketplace.types";
import { useCartStore, formatPrice } from "@/store/cart.store";
import { productImageUrl } from "@/features/products/data/catalog";

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
  const router = useRouter();
  const [hovered, setHovered] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const itemQuantity = useCartStore((state) => state.getItemQuantity(component.id));

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
        href={`/components/${component.slug}`}
        className="relative block overflow-hidden bg-[#F7F7EF]"
        style={{ aspectRatio: compact ? "4/3" : "1/1" }}
      >
        {/* Accent top bar */}
        <div
          className="absolute inset-x-0 top-0 h-0.5 z-10 transition-opacity duration-300"
          style={{ backgroundColor: accent, opacity: hovered ? 1 : 0 }}
        />

        {/* Badges */}
        <div className="absolute left-2 top-2 sm:left-3 sm:top-3 z-10 flex flex-col gap-1 sm:gap-1.5">
          {isOutOfStock && (
            <span className="rounded-md bg-red-500 px-1.5 py-0.5 text-[8px] sm:text-[10px] font-bold text-white">
              Sold Out
            </span>
          )}
          {isLowStock && !isOutOfStock && (
            <span className="rounded-md bg-amber-500 px-1.5 py-0.5 text-[8px] sm:text-[10px] font-bold text-white">
              Only {component.stockQuantity} left
            </span>
          )}
          {component.isBestSeller && !isOutOfStock && (
            <span
              className="rounded-md px-1.5 py-0.5 text-[8px] sm:text-[10px] font-bold text-white"
              style={{ backgroundColor: accent }}
            >
              Best Seller
            </span>
          )}
          {component.isRobomaniacItem && (
            <span className="rounded-md border border-[#D2D2D0] bg-white/95 px-1.5 py-0.5 text-[8px] sm:text-[10px] font-bold text-zinc-600">
              Robomaniac
            </span>
          )}
          {component.discountedPriceCents && component.discountedPriceCents < component.unitPriceCents && (
            <span className="rounded-md bg-red-500 px-2 py-0.75 text-[9px] sm:text-[10px] font-medium text-white">
              {Math.round((1 - component.discountedPriceCents / component.unitPriceCents) * 100)}% OFF
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          className={cn(
            "absolute right-2 top-2 sm:right-3 sm:top-3 z-10 flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full border shadow-sm transition-all duration-200",
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
            className="h-3 w-3 sm:h-3.5 sm:w-3.5"
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
            className="h-full w-full object-contain p-3 sm:p-6"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Package className="h-10 w-10 sm:h-16 sm:w-16 text-zinc-200" />
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
      <div className="flex flex-1 flex-col px-2.5 sm:px-4 pt-2.5 sm:pt-3.5 pb-3 sm:pb-4">
        {/* Category label */}
        <p
          className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.10em] leading-none truncate text-[#414141] border-b border-[#f1f1e3]  pb-0.5 sm:pb-1"
          // style={{ color: accent }}
        >
          {component.subcategory || component.category}
        </p>

        {/* Product name */}
        <Link
          href={`/components/${component.slug}`}
          className="mt-1 block sm:mt-1.5"
        >
          <h3 className="line-clamp-2 text-xs sm:text-[14px]  leading-[1.4] text-[#242424] hover:text-[var(--brand-primary)] transition-colors">
            {component.name}
          </h3>
        </Link>

        {/* Brand */}
        {component.brand && (
          <p className="mt-1 text-[10px] sm:text-[11px] font-medium text-zinc-400">{component.brand}</p>
        )}

        {/* Price row */}
        <div className="mt-auto flex items-end justify-between pt-2 sm:pt-3">
          <div className="flex flex-row items-center gap-2 sm:gap-1.5">
            {component.discountedPriceCents && component.discountedPriceCents < component.unitPriceCents ? (
              <>
                <span className="text-sm sm:text-[18px] font-semibold leading-none text-[var(--brand-primary)]">
                  {formatPrice(component.discountedPriceCents)}
                </span>
                <div className="mt-0.5 flex flex-wrap items-center gap-1">
                  <span className="text-[11px] sm:text-[12px] font-medium text-zinc-400 line-through">
                    {formatPrice(component.unitPriceCents)}
                  </span>
                  {/* <span className="text-[9px] sm:text-[10px] font-semibold text-emerald-600">Inc. GST</span> */}
                  {component.discountedPriceCents && component.discountedPriceCents < component.unitPriceCents && (
            <span className="rounded-md px-2 py-0.75 text-[11px] sm:text-[12px] font-medium text-green-700 bg-green-100">
              {Math.round((1 - component.discountedPriceCents / component.unitPriceCents) * 100)}% OFF
            </span>
          )}
                </div>
              </>
            ) : (
              <>
                <span className="text-sm sm:text-[18px] font-semibold leading-none text-[var(--brand-primary)]">
                  {formatPrice(component.unitPriceCents)}
                </span>
                {/* <span className="mt-0.5 text-[9px] sm:text-[10px] font-semibold text-emerald-600">Inc. GST</span> */}
              </>
            )}
          </div>
          <span
            className={cn(
              "hidden xs:inline text-[9px] sm:text-[10px] font-semibold",
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
          disabled={isOutOfStock || isAdding}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();

            if (itemQuantity > 0) {
              router.push("/cart");
              return;
            }

            if (isOutOfStock) return;

            setIsAdding(true);
            setTimeout(() => {
              addItem(component, 1);
              toast.success("Added to cart!", {
                description: component.name,
              });
              setIsAdding(false);
            }, 750);
          }}
          className={cn(
            "mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl py-2 sm:py-2.5 text-[10px] sm:text-[12px] font-medium transition-all duration-200 relative overflow-hidden",
            isOutOfStock
              ? "cursor-not-allowed bg-zinc-100 text-zinc-400"
              : isAdding
              ? "bg-zinc-200 text-brand-primary-2 cursor-wait"
              : itemQuantity > 0
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
              : hovered
              ? "bg-gradient-to-r from-[var(--color-brand-secondary)] to-[var(--color-brand-secondary-2)] text-brand-secondary-3 shadow-md shadow-zinc-900/20"
              : "bg-gradient-to-r from-[var(--color-brand-primary)] to-[var(--color-brand-primary-2)] text-brand-secondary-3 shadow-md shadow-zinc-200/5"
          )}
        >
          {isOutOfStock ? ( 
            "Out of Stock"
          ) : isAdding ? (
            <>
              <Loader2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 animate-spin shrink-0" />
              <motion.span
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
              >
                Adding...
              </motion.span>
            </>
          ) : itemQuantity > 0 ? (
            <>
              <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
              <motion.span
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                Go to Cart
              </motion.span>
            </>
          ) : (
            <>
              <ShoppingCart className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
              <span>Add to Cart</span>
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
