"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, ShoppingBag, Trash2, ArrowRight, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { formatPrice, useCartStore } from "@/store/cart.store";
import { ProductImage } from "@/features/products/components/ProductImage";
import { MagicCard } from "@/components/ui/magic-card";

export function CartPage() {
  const router = useRouter();
  const { items, updateQuantity, removeItem, clearCart, getSubtotal } = useCartStore();
  const subtotal = getSubtotal();
  const shipping = subtotal >= 50000 || subtotal === 0 ? 0 : 5000;
  const total = subtotal + shipping;
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  function handleRemove(componentId: string, name: string) {
    removeItem(componentId);
    toast.success("Removed from cart", { description: name });
  }

  return (
    <div className="min-h-screen bg-[#f2f2f0]">
      {/* Dark hero */}
      <div className="bg-[#222222] rounded-b-[2.5rem] px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-2 mb-3">
            <ShoppingCart className="h-4 w-4 text-[#1CA2D1]" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
              Shopping Cart
            </span>
          </div>
          <h1 className="text-4xl font-bold text-white md:text-5xl tracking-tight">
            Review your order
          </h1>
          <p className="mt-2 text-zinc-400 text-sm">
            {items.length === 0
              ? "Your cart is empty"
              : `${totalItems} item${totalItems === 1 ? "" : "s"} ready for checkout`}
          </p>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-6 py-10 lg:grid lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-8">
        {items.length === 0 ? (
          <div className="lg:col-span-2">
            <MagicCard
              className="rounded-2xl [--color-background:#ffffff]"
              gradientFrom="#1CA2D1"
              gradientTo="#EAEADB"
              gradientColor="#1CA2D1"
              gradientOpacity={0.05}
            >
              <div className="flex flex-col items-center gap-5 p-16 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#EAEADB]">
                  <ShoppingBag className="h-9 w-9 text-zinc-300" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#222222]">Your cart is empty</h2>
                  <p className="mt-1 text-sm text-zinc-500">
                    Browse components and add items to start checkout.
                  </p>
                </div>
                <Link
                  href="/components"
                  className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#222222] px-6 text-sm font-semibold text-white hover:bg-[#1CA2D1] transition-colors"
                >
                  Browse Components
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </MagicCard>
          </div>
        ) : (
          <>
            {/* Cart items */}
            <section className="space-y-4 mb-8 lg:mb-0">
              <AnimatePresence mode="popLayout">
                {items.map((item, i) => (
                  <motion.div
                    key={item.component.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -40, transition: { duration: 0.2 } }}
                    transition={{ duration: 0.35, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <MagicCard
                      className="rounded-2xl [--color-background:#ffffff]"
                      gradientFrom="#1CA2D1"
                      gradientTo="#EAEADB"
                      gradientColor="#1CA2D1"
                      gradientOpacity={0.05}
                    >
                      <div className="p-5">
                        <div className="grid gap-3 grid-cols-[80px_minmax(0,1fr)] sm:grid-cols-[108px_minmax(0,1fr)]">
                          <Link href={`/components/${item.component.slug}`}>
                            <div className="aspect-square overflow-hidden rounded-xl bg-[#F3F3E4] w-20 h-20 sm:w-28 sm:h-28">
                              <ProductImage
                                src={item.component.imageUrl}
                                alt={item.component.name}
                                className="h-full w-full"
                                imageClassName="object-contain p-1 sm:p-2"
                              />
                            </div>
                          </Link>
                          <div className="min-w-0 flex flex-col gap-2 sm:gap-3 justify-between">
                            <div>
                              <Link
                                href={`/components/${item.component.slug}`}
                                className="text-sm sm:text-base font-bold text-[#222222] hover:text-[#1CA2D1] transition-colors line-clamp-2"
                              >
                                {item.component.name}
                              </Link>
                              <p className="mt-0.5 text-[10px] sm:text-xs text-zinc-400">
                                {item.component.category}
                                {item.component.subcategory && ` / ${item.component.subcategory}`}
                              </p>
                              {item.component.sku && (
                                <p className="text-[9px] sm:text-[10px] font-semibold text-zinc-400 mt-0.5">
                                  SKU: {item.component.sku}
                                </p>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                              {/* Qty selector */}
                              <div className="flex items-center overflow-hidden rounded-xl border border-[#D8D8C4]">
                                <button
                                  onClick={() => updateQuantity(item.component.id, item.quantity - 1)}
                                  disabled={item.quantity <= 1}
                                  className="h-7 w-7 sm:h-9 sm:w-9 flex items-center justify-center text-zinc-600 hover:bg-[#EAEADB] disabled:opacity-40 transition-colors"
                                >
                                  <Minus className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                </button>
                                <input
                                  value={item.quantity}
                                  onChange={(e) =>
                                    updateQuantity(item.component.id, Number(e.target.value) || 1)
                                  }
                                  className="w-10 sm:w-12 h-7 sm:h-9 text-center text-xs sm:text-sm font-bold text-[#222222] bg-white outline-none border-x border-[#D8D8C4]"
                                  type="number"
                                  min="1"
                                  max={item.component.stockQuantity}
                                />
                                <button
                                  onClick={() => updateQuantity(item.component.id, item.quantity + 1)}
                                  disabled={item.quantity >= item.component.stockQuantity}
                                  className="h-7 w-7 sm:h-9 sm:w-9 flex items-center justify-center text-zinc-600 hover:bg-[#EAEADB] disabled:opacity-40 transition-colors"
                                >
                                  <Plus className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                </button>
                              </div>
                              <div className="flex items-center gap-3 sm:gap-4">
                                <p className="text-base sm:text-xl font-bold text-[#1CA2D1]">
                                  {formatPrice(item.component.unitPriceCents * item.quantity)}
                                </p>
                                <button
                                  onClick={() => handleRemove(item.component.id, item.component.name)}
                                  className="flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-zinc-400 hover:text-red-500 transition-colors"
                                  aria-label="Remove item"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  <span className="hidden sm:inline">Remove</span>
                                </button>
                              </div>
                            </div>
                            {item.component.stockQuantity < item.quantity && (
                              <p className="text-[10px] sm:text-xs font-semibold text-red-500 mt-1">
                                Only {item.component.stockQuantity} left in stock
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </MagicCard>
                  </motion.div>
                ))}
              </AnimatePresence>

              <button
                onClick={() => clearCart()}
                className="w-full h-10 rounded-xl border border-[#D8D8C4] bg-white text-sm font-semibold text-zinc-500 hover:border-red-200 hover:text-red-500 transition-colors"
              >
                Clear Cart
              </button>
            </section>

            {/* Order summary */}
            <aside className="h-fit lg:sticky lg:top-24">
              <MagicCard
                className="rounded-2xl [--color-background:#ffffff]"
                gradientFrom="#1CA2D1"
                gradientTo="#EAEADB"
                gradientColor="#1CA2D1"
                gradientOpacity={0.07}
              >
                <div className="p-6 space-y-5">
                  <h2 className="text-lg font-bold text-[#222222]">Order Summary</h2>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between text-zinc-600">
                      <span>Subtotal ({totalItems} items)</span>
                      <span className="font-semibold text-[#222222]">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-zinc-600">
                      <span>Shipping</span>
                      <span className={`font-semibold ${shipping === 0 ? "text-emerald-600" : "text-[#222222]"}`}>
                        {shipping === 0 ? "Free" : formatPrice(shipping)}
                      </span>
                    </div>
                    {subtotal < 50000 && subtotal > 0 && (
                      <p className="text-[11px] text-zinc-400 bg-[#FAFAED] rounded-lg px-3 py-2">
                        Add ₹{formatPrice(50000 - subtotal).replace("₹", "")} more for free shipping
                      </p>
                    )}
                    <div className="border-t border-[#D8D8C4] pt-3">
                      <div className="flex justify-between">
                        <span className="text-base font-bold text-[#222222]">Total</span>
                        <span className="text-xl font-bold text-[#1CA2D1]">{formatPrice(total)}</span>
                      </div>
                      <p className="text-[10px] text-emerald-600 font-medium mt-0.5">Including GST</p>
                    </div>
                  </div>
                  <button
                    onClick={() => router.push("/checkout")}
                    className="w-full h-12 rounded-xl bg-[#222222] text-sm font-bold text-white hover:bg-[#1CA2D1] transition-colors flex items-center justify-center gap-2"
                  >
                    Proceed to Checkout
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <Link
                    href="/components"
                    className="flex h-10 w-full items-center justify-center rounded-xl border border-[#D8D8C4] text-sm font-semibold text-zinc-600 hover:border-[#222222] hover:text-[#222222] transition-colors"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </MagicCard>
            </aside>
          </>
        )}
      </main>
    </div>
  );
}
