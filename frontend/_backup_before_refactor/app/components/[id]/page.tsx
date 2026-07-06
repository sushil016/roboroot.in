"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Check,
  ExternalLink,
  Heart,
  Minus,
  Package,
  Plus,
  Shield,
  ShoppingCart,
  Truck,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { componentApi } from "@/lib/api/marketplace.api";
import { formatPrice, useCartStore } from "@/lib/store/cartStore";
import { useWishlistStore } from "@/lib/store/wishlistStore";
import { compactProductType } from "@/features/marketplace/lib/catalog";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductRevealCard, ProductRevealCardSkeleton } from "@/components/ui/product-reveal-card";
import { ProductImageGallery } from "@/components/product/ProductImageGallery";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Loading skeleton                                                     */
/* ------------------------------------------------------------------ */
function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_440px]">
        <div className="space-y-4">
          <Skeleton className="aspect-square w-full rounded-2xl" />
        </div>
        <div className="space-y-5">
          <div className="space-y-2">
            <Skeleton className="h-5 w-28 rounded-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-3/4" />
            <Skeleton className="h-8 w-32 mt-3" />
          </div>
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tabs                                                                 */
/* ------------------------------------------------------------------ */
type Tab = "overview" | "specs" | "resources";

const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "specs", label: "Specifications" },
  { id: "resources", label: "Resources" },
];

/* ------------------------------------------------------------------ */
/* Trust badges                                                         */
/* ------------------------------------------------------------------ */
const TRUST = [
  { icon: Truck, label: "Free shipping above ₹500" },
  { icon: Shield, label: "Quality checked & tested" },
  { icon: Check, label: "GST-ready invoicing" },
  { icon: Zap, label: "Same-day dispatch" },
];

/* ------------------------------------------------------------------ */
/* Main page                                                            */
/* ------------------------------------------------------------------ */
export default function ComponentDetailPage() {
  const router = useRouter();
  const { id: componentId } = useParams() as { id: string };
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const addItem = useCartStore((s) => s.addItem);
  const itemQty = useCartStore((s) => s.getItemQuantity(componentId));
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const isWishlisted = useWishlistStore((s) => s.isWishlisted(componentId));

  const { data: component, isLoading, error } = useQuery({
    queryKey: ["component", componentId],
    queryFn: () => componentApi.getComponentById(componentId),
    enabled: Boolean(componentId),
  });

  const { data: productMedia = [] } = useQuery({
    queryKey: ["product-media", componentId],
    queryFn: () => componentApi.getProductMedia(componentId),
    enabled: Boolean(componentId),
    staleTime: 5 * 60 * 1000,
  });

  /* Related products — same category, excluding current */
  const { data: relatedData } = useQuery({
    queryKey: ["related-components", component?.category],
    queryFn: () =>
      componentApi.getComponents({
        category: component!.category,
        limit: 6,
        sortBy: "name",
        sortOrder: "asc",
      }),
    enabled: Boolean(component?.category),
    staleTime: 5 * 60 * 1000,
  });
  const related = (relatedData?.components ?? []).filter((c) => c.id !== componentId).slice(0, 4);

  /* ---- Loading ---- */
  if (isLoading) {
    return (
      <div className="bg-[#f2f2f0]">
        <div className="bg-[#F2F2F0] border-b border-[#D2D2D0] px-6 py-4">
          <Skeleton className="h-4 w-40 rounded-full" />
        </div>
        <DetailSkeleton />
      </div>
    );
  }

  /* ---- Error ---- */
  if (error || !component) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-5 px-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#E8E8E6]">
          <Package className="h-7 w-7 text-zinc-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#222222]">Component not found</h1>
          <p className="mt-1 text-sm text-zinc-500">
            This product may have been removed or archived.
          </p>
        </div>
        <Link
          href="/components"
          className="inline-flex items-center gap-2 rounded-xl bg-[#222222] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#1CA2D1]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Components
        </Link>
      </div>
    );
  }

  const isOutOfStock = component.stockQuantity === 0;
  const isLowStock = !isOutOfStock && component.stockQuantity <= 10;
  const maxQty = Math.min(component.stockQuantity, 99);

  function handleAddToCart() {
    if (isOutOfStock) { toast.error("Out of stock"); return; }
    if (quantity > component!.stockQuantity) {
      toast.error(`Only ${component!.stockQuantity} available`);
      return;
    }
    addItem(component!, quantity);
    toast.success("Added to cart", { description: `${quantity}× ${component!.name}` });
  }

  function handleBuyNow() {
    handleAddToCart();
    router.push("/cart");
  }

  function handleWishlist() {
    toggleWishlist(component!);
    toast.success(isWishlisted ? "Removed from wishlist" : "Saved to wishlist");
  }

  /* ---------------------------------------------------------------- */
  return (
    <div className="bg-[#f2f2f0] text-[#222222]">
      {/* ── Breadcrumb nav ── */}
      <div className="border-b border-[#D2D2D0] bg-[#F2F2F0] px-6 py-3">
        <div className="mx-auto flex max-w-7xl items-center gap-2 text-xs font-medium text-zinc-500">
          <Link href="/" className="hover:text-[#222222] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/components" className="hover:text-[#222222] transition-colors">Components</Link>
          {component.category && (
            <>
              <span>/</span>
              <Link
                href={`/components?category=${encodeURIComponent(component.category)}`}
                className="hover:text-[#222222] transition-colors"
              >
                {component.category}
              </Link>
            </>
          )}
          {component.subcategory && (
            <>
              <span>/</span>
              <span className="font-semibold text-[#222222] truncate max-w-[200px]">
                {component.subcategory}
              </span>
            </>
          )}
        </div>
      </div>

      {/* ── Product Hero ── */}
      <main className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_440px]">

          {/* LEFT — Image gallery */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <ProductImageGallery
              fallbackImageUrl={component.imageUrl}
              media={productMedia}
              productName={component.name}
            />

            {/* Trust row below gallery */}
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {TRUST.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-1.5 rounded-xl border border-[#D2D2D0] bg-white p-3 text-center"
                >
                  <Icon className="h-4 w-4 text-[#1CA2D1]" />
                  <p className="text-[10px] font-semibold leading-tight text-zinc-600">{label}</p>
                </div>
              ))}
            </div>
          </motion.section>

          {/* RIGHT — Buy panel */}
          <motion.aside
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-5"
          >
            {/* Badges + name */}
            <div>
              <div className="mb-3 flex flex-wrap gap-1.5">
                <span className="rounded-full bg-[#1CA2D1]/10 px-3 py-0.5 text-[11px] font-semibold text-[#1CA2D1]">
                  {compactProductType(component.productType)}
                </span>
                {component.isBestSeller && (
                  <span className="rounded-full bg-amber-50 px-3 py-0.5 text-[11px] font-semibold text-amber-700 border border-amber-200">
                    Best Seller
                  </span>
                )}
                {component.isRobomaniacItem && (
                  <span className="rounded-full border border-[#D2D2D0] bg-white px-3 py-0.5 text-[11px] font-semibold text-zinc-600">
                    Robomaniac
                  </span>
                )}
              </div>

              <h1 className="text-2xl font-bold leading-tight text-[#222222] lg:text-3xl">
                {component.name}
              </h1>

              <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-zinc-400">
                {component.sku && <span>SKU: {component.sku}</span>}
                {component.brand && <span>Brand: {component.brand}</span>}
              </div>

              <div className="mt-4 flex items-end gap-3">
                <span className="text-3xl font-bold text-[#1CA2D1]">
                  {formatPrice(component.unitPriceCents)}
                </span>
                <span className="mb-0.5 text-xs font-semibold text-emerald-600">Inc. GST</span>
              </div>
            </div>

            {/* Stock + qty + actions */}
            <div className="rounded-2xl border border-[#D2D2D0] bg-white p-5 shadow-sm space-y-5">
              {/* Stock indicator */}
              <div
                className={cn(
                  "flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold",
                  isOutOfStock
                    ? "bg-red-50 text-red-600"
                    : isLowStock
                    ? "bg-amber-50 text-amber-700"
                    : "bg-emerald-50 text-emerald-700"
                )}
              >
                <div
                  className={cn(
                    "h-2 w-2 rounded-full",
                    isOutOfStock
                      ? "bg-red-500"
                      : isLowStock
                      ? "bg-amber-500"
                      : "bg-emerald-500"
                  )}
                />
                {isOutOfStock
                  ? "Out of Stock"
                  : isLowStock
                  ? `Only ${component.stockQuantity} left`
                  : `In Stock — ${component.stockQuantity} available`}
              </div>

              {/* Qty selector */}
              {!isOutOfStock && (
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-zinc-400">
                    Quantity
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center overflow-hidden rounded-xl border border-[#D2D2D0] bg-[#F2F2F0]">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="flex h-10 w-10 items-center justify-center text-zinc-600 hover:bg-[#E8E8E6] transition-colors"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <input
                        value={quantity}
                        onChange={(e) =>
                          setQuantity(
                            Math.min(maxQty, Math.max(1, Number(e.target.value) || 1))
                          )
                        }
                        className="h-10 w-14 bg-transparent text-center text-sm font-bold text-[#222222] outline-none"
                        type="number"
                        min="1"
                        max={maxQty}
                      />
                      <button
                        onClick={() => setQuantity(Math.min(maxQty, quantity + 1))}
                        className="flex h-10 w-10 items-center justify-center text-zinc-600 hover:bg-[#E8E8E6] transition-colors"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <span className="text-sm font-semibold text-zinc-500">
                      Total:{" "}
                      <span className="font-bold text-[#222222]">
                        {formatPrice(component.unitPriceCents * quantity)}
                      </span>
                    </span>
                  </div>
                </div>
              )}

              {/* CTA buttons */}
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={cn(
                    "inline-flex h-12 items-center justify-center gap-2 rounded-xl text-sm font-bold transition-colors",
                    isOutOfStock
                      ? "cursor-not-allowed bg-zinc-200 text-zinc-400"
                      : itemQty > 0
                      ? "bg-[#1CA2D1]/15 text-[#1CA2D1] border border-[#1CA2D1]/30 hover:bg-[#1CA2D1]/25"
                      : "bg-[#1CA2D1] text-white hover:bg-[#1CA2D1]/90"
                  )}
                >
                  <ShoppingCart className="h-4 w-4 shrink-0" />
                  {itemQty > 0 ? `In Cart (${itemQty})` : "Add to Cart"}
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={isOutOfStock}
                  className="inline-flex h-12 items-center justify-center rounded-xl bg-[#222222] text-sm font-bold text-white transition-colors hover:bg-[#1CA2D1] disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-400"
                >
                  Buy Now
                </button>
              </div>

              {/* Wishlist */}
              <button
                onClick={handleWishlist}
                className={cn(
                  "inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border text-sm font-semibold transition-all",
                  isWishlisted
                    ? "border-[#1CA2D1]/40 bg-[#1CA2D1]/8 text-[#1CA2D1]"
                    : "border-[#D2D2D0] text-zinc-600 hover:border-[#222222] hover:text-[#222222]"
                )}
              >
                <Heart
                  className="h-4 w-4 shrink-0"
                  fill={isWishlisted ? "currentColor" : "none"}
                />
                {isWishlisted ? "Saved to Wishlist" : "Add to Wishlist"}
              </button>
            </div>

            {/* Vendor link */}
            {component.vendorLink && (
              <a
                href={component.vendorLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1CA2D1] hover:underline"
              >
                View vendor / datasheet
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </motion.aside>
        </div>

        {/* ── Tabs ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
          className="mt-12"
        >
          {/* Tab bar */}
          <div className="relative flex border-b border-[#D2D2D0]">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative px-6 py-3 text-sm font-semibold transition-colors",
                  activeTab === tab.id
                    ? "text-[#222222]"
                    : "text-zinc-400 hover:text-[#222222]"
                )}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="tab-underline"
                    className="absolute inset-x-0 -bottom-px h-0.5 bg-[#222222] rounded-full"
                    transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="py-8"
            >
              {activeTab === "overview" && (
                <div className="max-w-3xl space-y-6">
                  {component.description ? (
                    <div>
                      <h2 className="mb-3 text-lg font-bold text-[#222222]">Description</h2>
                      <p className="text-sm leading-7 text-zinc-600">{component.description}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-zinc-400">No description available.</p>
                  )}

                  {component.typicalUseCase && (
                    <div className="rounded-2xl border border-[#1CA2D1]/20 bg-[#1CA2D1]/5 p-5">
                      <p className="mb-2 text-xs font-bold uppercase tracking-[0.15em] text-[#1CA2D1]">
                        Typical Use Case
                      </p>
                      <p className="text-sm leading-7 text-zinc-700">{component.typicalUseCase}</p>
                    </div>
                  )}

                  {component.tags.length > 0 && (
                    <div>
                      <p className="mb-3 text-xs font-bold uppercase tracking-[0.15em] text-zinc-400">
                        Tags
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {component.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-[#D2D2D0] bg-white px-3 py-1 text-xs font-medium text-zinc-600"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "specs" && (
                <div className="max-w-2xl">
                  <h2 className="mb-5 text-lg font-bold text-[#222222]">Specifications</h2>
                  <div className="divide-y divide-[#D2D2D0] rounded-2xl border border-[#D2D2D0] bg-white overflow-hidden">
                    {(
                      [
                        ["Category", component.category],
                        ["Subcategory", component.subcategory],
                        ["Product Type", compactProductType(component.productType)],
                        component.brand ? ["Brand", component.brand] : null,
                        component.sku ? ["SKU", component.sku] : null,
                        ["Stock Quantity", `${component.stockQuantity} units`],
                        ["Price (excl. GST)", formatPrice(Math.round(component.unitPriceCents / 1.18))],
                        ["Price (incl. GST)", formatPrice(component.unitPriceCents)],
                        ["Is Best Seller", component.isBestSeller ? "Yes" : "No"],
                        ["Robomaniac Item", component.isRobomaniacItem ? "Yes" : "No"],
                      ] as ([string, string] | null)[]
                    )
                      .filter((row): row is [string, string] => row !== null)
                      .map(([label, value]) => (
                        <div key={label} className="flex items-start gap-6 px-5 py-3.5">
                          <span className="w-40 shrink-0 text-xs font-bold uppercase tracking-[0.12em] text-zinc-400 pt-0.5">
                            {label}
                          </span>
                          <span className="text-sm font-medium text-[#222222]">{value}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {activeTab === "resources" && (
                <div className="max-w-2xl space-y-4">
                  <h2 className="text-lg font-bold text-[#222222]">Resources & Links</h2>

                  {component.vendorLink ? (
                    <a
                      href={component.vendorLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 rounded-2xl border border-[#D2D2D0] bg-white p-5 transition hover:border-[#1CA2D1]/40 hover:shadow-sm group"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1CA2D1]/10">
                        <ExternalLink className="h-4 w-4 text-[#1CA2D1]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[#222222] group-hover:text-[#1CA2D1] transition-colors">
                          Vendor / Datasheet Link
                        </p>
                        <p className="mt-0.5 truncate text-xs text-zinc-400">{component.vendorLink}</p>
                      </div>
                      <ExternalLink className="h-4 w-4 text-zinc-300 group-hover:text-[#1CA2D1] shrink-0 transition-colors" />
                    </a>
                  ) : (
                    <div className="flex flex-col items-center gap-3 rounded-2xl border border-[#D2D2D0] bg-white p-10 text-center">
                      <ExternalLink className="h-8 w-8 text-zinc-200" />
                      <p className="text-sm text-zinc-400">No datasheet or resources linked yet.</p>
                    </div>
                  )}

                  {/* Support links */}
                  <div className="rounded-2xl border border-[#D2D2D0] bg-white p-5">
                    <p className="mb-3 text-xs font-bold uppercase tracking-[0.15em] text-zinc-400">
                      Need Help?
                    </p>
                    <div className="space-y-2 text-sm">
                      <Link
                        href="/projects"
                        className="flex items-center gap-2 text-[#1CA2D1] hover:underline font-medium"
                      >
                        Browse project tutorials →
                      </Link>
                      <Link
                        href="/contact"
                        className="flex items-center gap-2 text-[#1CA2D1] hover:underline font-medium"
                      >
                        Contact technical support →
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* ── Related Products ── */}
        {related.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="mt-4 border-t border-[#D2D2D0] pt-10"
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1CA2D1]">
                  From {component.category}
                </p>
                <h2 className="mt-1 text-xl font-bold text-[#222222]">Related Components</h2>
              </div>
              <Link
                href={`/components?category=${encodeURIComponent(component.category)}`}
                className="text-sm font-semibold text-zinc-500 hover:text-[#222222] transition-colors"
              >
                View all →
              </Link>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((rel) => (
                <ProductRevealCard
                  key={rel.id}
                  component={rel}
                  onAddToCart={(c, qty) => {
                    if (c.stockQuantity === 0) { toast.error("Out of stock"); return; }
                    addItem(c, qty ?? 1);
                    toast.success("Added to cart", { description: c.name });
                  }}
                  onToggleWishlist={(c) => {
                    toggleWishlist(c);
                    toast.success("Wishlist updated");
                  }}
                  isWishlisted={isWishlisted}
                />
              ))}
            </div>
          </motion.section>
        )}
      </main>
    </div>
  );
}
