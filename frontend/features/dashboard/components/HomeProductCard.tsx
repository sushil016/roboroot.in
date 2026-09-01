"use client";

import type { MouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Package, ShoppingCart, Star } from "lucide-react";
import { toast } from "sonner";
import type { Component } from "@/types/marketplace.types";
import { formatPrice, useCartStore } from "@/store/cart.store";
import { useWishlistStore } from "@/store/wishlist.store";

type ProductBadgeTone = "new" | "rank";

export type HomeProductCardProps = {
  component: Component;
  badge: string;
  badgeTone: ProductBadgeTone;
  rating?: number;
  className?: string;
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function HomeProductCard({
  component,
  badge,
  badgeTone,
  rating,
  className,
}: HomeProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const toggleWishlist = useWishlistStore((state) => state.toggleItem);
  const isWishlisted = useWishlistStore((state) => state.isWishlisted(component.id));
  const isOutOfStock = component.stockQuantity === 0;
  const hasDiscount =
    component.discountedPriceCents !== null &&
    component.discountedPriceCents !== undefined &&
    component.discountedPriceCents < component.unitPriceCents;
  const activePrice = hasDiscount ? component.discountedPriceCents! : component.unitPriceCents;

  const handleAddToCart = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (isOutOfStock) {
      toast.error("Out of stock");
      return;
    }

    addItem(component, 1);
    toast.success("Added to cart", { description: component.name });
  };

  const handleWishlist = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    toggleWishlist(component);
    toast.success(isWishlisted ? "Removed from wishlist" : "Saved to wishlist");
  };

  return (
    <article
      className={cx(
        "group relative flex h-full min-h-[410px] flex-col rounded-2xl border border-zinc-200 bg-white p-4 transition-all duration-300 hover:border-zinc-300 hover:shadow-[0_16px_36px_rgba(15,23,42,0.07)]",
        className,
      )}
    >
      <div className="relative flex aspect-square items-center justify-center rounded-xl bg-white p-8">
        <span
          className={cx(
            "absolute left-3 top-3 z-10 rounded-full border bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em]",
            badgeTone === "new"
              ? "border-teal-200 text-teal-700"
              : "border-zinc-950 text-zinc-950",
          )}
        >
          {badge}
        </span>

        <button
          type="button"
          onClick={handleWishlist}
          aria-label={isWishlisted ? "Remove from wishlist" : "Save to wishlist"}
          className={cx(
            "absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-200",
            isWishlisted
              ? "border-zinc-950 bg-zinc-950 text-white"
              : "border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300 hover:text-zinc-950",
          )}
        >
          <Heart className="h-4 w-4" fill={isWishlisted ? "currentColor" : "none"} />
        </button>

        <Link href={`/components/${component.slug}`} className="relative h-full w-full">
        {component.imageUrl ? (
            <Image
              src={component.imageUrl}
              alt={component.name}
              fill
              className="object-contain transition-transform duration-500 group-hover:scale-[1.03]"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 260px"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center rounded-xl bg-white">
              <Package className="h-14 w-14 text-zinc-200" />
            </span>
          )}
        </Link>
      </div>

      <div className="flex flex-1 flex-col px-1 pt-5">
        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-teal-700">
          {component.subcategory || component.category}
        </p>

        <Link href={`/components/${component.slug}`} className="mt-2 block mb-3">
          <h3 className="line-clamp-2 min-h-11 text-base sm:text-base font-medium text-[#242424] leading-snug transition-colors group-hover:text-[var(--brand-primary)]">
            {component.name}
          </h3>
        </Link>

        {/* {rating !== undefined && (
          <div className="mt-3 flex items-center gap-0.5 text-amber-400">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                key={index}
                className={cx(
                  "h-3.5 w-3.5",
                  index < Math.round(rating) ? "fill-current" : "fill-none text-zinc-200",
                )}
              />
            ))}
          </div>
        )}

        {rating === undefined && (
          <div className="mt-1 flex h-3.5 items-center" aria-hidden="true" />
        )} */}

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-zinc-200 pt-2">
          <div className="min-w-0">
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="text-xl font-medium text-[var(--brand-primary)]">
                {formatPrice(activePrice)}
              </span>
              {hasDiscount && (
                <span className="text-sm font-semibold text-zinc-400 line-through">
                  {formatPrice(component.unitPriceCents)}
                </span>
              )}
            </div>
            {/* <p className="mt-1 truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
              SKU {component.sku || component.id}
            </p> */}
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            aria-label={isOutOfStock ? "Out of stock" : "Add to cart"}
            className={cx(
              "flex h-11 w-auto px-4 gap-2 shrink-0 items-center justify-center rounded-2xl transition-all duration-200",
              isOutOfStock
                ? "cursor-not-allowed bg-zinc-100 text-zinc-400"
                : "bg-white text-brand-primary-2 border hover:scale-105 hover:bg-[var(--brand-primary)] hover:text-white hover:shadow-lg",
            )}
          >
            Add <ShoppingCart className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>
    </article>
  );
}
