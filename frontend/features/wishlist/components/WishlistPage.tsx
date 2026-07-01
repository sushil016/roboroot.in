"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { useWishlistStore } from "@/store/wishlist.store";
import { useCartStore, formatPrice } from "@/store/cart.store";
import { ProductImage } from "@/features/products/components/ProductImage";
import { AccountShell } from "@/features/user/components/AccountShell";
import { MagicCard } from "@/components/ui/magic-card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function WishlistPage() {
  const { items, removeItem, clearWishlist } = useWishlistStore();
  const addItem = useCartStore((state) => state.addItem);

  function handleAddToCart(component: (typeof items)[0]) {
    addItem(component, 1);
    toast.success("Added to cart", { description: component.name });
  }

  function handleRemove(component: (typeof items)[0]) {
    removeItem(component.id);
    toast.success("Removed from wishlist");
  }

  return (
    <AccountShell>
      <div className="max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#222222]">Wishlist</h1>
            <p className="mt-1 text-sm text-zinc-500">
              {items.length > 0
                ? `${items.length} saved ${items.length === 1 ? "item" : "items"}`
                : "Your saved products"}
            </p>
          </div>
          {items.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              className="border-[#D8D8C4] text-zinc-500 hover:text-red-600 hover:border-red-200"
              onClick={clearWishlist}
            >
              Clear All
            </Button>
          )}
        </div>

        {/* Empty state */}
        {items.length === 0 && (
          <MagicCard
            className="rounded-2xl [--color-background:#ffffff]"
            gradientFrom="#1CA2D1"
            gradientTo="#EAEADB"
            gradientColor="#1CA2D1"
            gradientOpacity={0.05}
          >
            <div className="flex flex-col items-center gap-5 p-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#EAEADB]">
                <Heart className="h-7 w-7 text-zinc-300" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#222222]">No saved products</h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Tap the heart icon on any product to save it here.
                </p>
              </div>
              <Button asChild className="bg-[#222222] hover:bg-[#1CA2D1]">
                <Link href="/components">Browse Components</Link>
              </Button>
            </div>
          </MagicCard>
        )}

        {/* Grid */}
        {items.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <AnimatePresence mode="popLayout">
              {items.map((component, i) => (
                <motion.div
                  key={component.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.18 } }}
                  transition={{ duration: 0.3, delay: i * 0.04 }}
                >
                  <MagicCard
                    className="rounded-2xl [--color-background:#ffffff] h-full"
                    gradientFrom="#1CA2D1"
                    gradientTo="#EAEADB"
                    gradientColor="#1CA2D1"
                    gradientOpacity={0.06}
                  >
                    <div className="flex flex-col p-4 h-full">
                      <Link href={`/components/${component.slug}`} className="group">
                        <div className="aspect-square overflow-hidden rounded-xl bg-[#F3F3E4] mb-3">
                          <ProductImage
                            src={component.imageUrl}
                            alt={component.name}
                            className="h-full w-full transition-transform duration-300 group-hover:scale-105"
                            imageClassName="object-contain"
                          />
                        </div>
                        <p className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold text-[#222222] leading-5 group-hover:text-[#1CA2D1] transition-colors">
                          {component.name}
                        </p>
                      </Link>
                      <div className="mt-2">
                        <p className="text-lg font-bold text-[#1CA2D1]">
                          {formatPrice(component.unitPriceCents)}
                        </p>
                        <p className="text-[10px] font-semibold text-emerald-600">Inc. GST</p>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2 mt-auto pt-3">
                        <button
                          onClick={() => handleAddToCart(component)}
                          className="flex h-9 items-center justify-center gap-1.5 rounded-xl bg-[#222222] text-xs font-semibold text-white hover:bg-[#1CA2D1] transition-colors"
                        >
                          <ShoppingCart className="h-3.5 w-3.5" />
                          Add
                        </button>
                        <button
                          onClick={() => handleRemove(component)}
                          className="flex h-9 items-center justify-center gap-1.5 rounded-xl border border-[#D8D8C4] text-xs font-semibold text-zinc-500 hover:border-red-200 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Remove
                        </button>
                      </div>
                    </div>
                  </MagicCard>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </AccountShell>
  );
}
