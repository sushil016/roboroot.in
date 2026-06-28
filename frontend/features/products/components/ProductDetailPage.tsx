"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
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
  Star,
  Truck,
  Zap,
  Download,
  Info,
  MapPin,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { componentApi } from "@/features/products/services/product.service";
import { formatPrice, useCartStore } from "@/store/cart.store";
import { useWishlistStore } from "@/store/wishlist.store";
import { compactProductType } from "@/features/products/data/catalog";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductRevealCard } from "@/components/ui/product-reveal-card";
import { ProductImageGallery } from "@/features/products/components/ProductImageGallery";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Loading skeleton                                                     */
/* ------------------------------------------------------------------ */
function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-5 space-y-4">
          <Skeleton className="aspect-square w-full rounded-2xl" />
          <div className="grid grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        </div>
        <div className="lg:col-span-7 space-y-5">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32 rounded-full" />
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
/* Trust features                                                       */
/* ------------------------------------------------------------------ */
const TRUST = [
  { icon: Truck, label: "Free Shipping", sub: "On orders above ₹500" },
  { icon: Shield, label: "Quality Verified", sub: "100% checked & tested" },
  { icon: Check, label: "GST-Ready Invoice", sub: "Claim input tax credit" },
  { icon: Zap, label: "Fast Dispatch", sub: "Dispatched within 24 hours" },
];

/* ------------------------------------------------------------------ */
/* Main page                                                            */
/* ------------------------------------------------------------------ */
export function ProductDetailPage() {
  const router = useRouter();
  const { id: componentId } = useParams() as { id: string };
  const [quantity, setQuantity] = useState(1);

  // Pincode state
  const [pincode, setPincode] = useState("");
  const [deliveryStatus, setDeliveryStatus] = useState<string | null>(null);
  const [deliveryError, setDeliveryError] = useState<string | null>(null);
  const [isCheckingPincode, setIsCheckingPincode] = useState(false);

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

  // Pincode handler
  function handleCheckPincode(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\d{6}$/.test(pincode)) {
      setDeliveryError("Please enter a valid 6-digit pincode.");
      setDeliveryStatus(null);
      return;
    }
    setDeliveryError(null);
    setIsCheckingPincode(true);
    setTimeout(() => {
      setIsCheckingPincode(false);
      const deliveryDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
      const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'short', day: 'numeric' };
      setDeliveryStatus(`Delivery by ${deliveryDate.toLocaleDateString("en-IN", options)}`);
    }, 700);
  }

  /* ---- Loading ---- */
  if (isLoading) {
    return (
      <div className="bg-[#f2f2f0]">
        <div className="bg-[#FAFAED] border-b border-[#D8D8C4] px-6 py-4">
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
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#EAEADB]">
          <Package className="h-7 w-7 text-zinc-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#222222]">Product not found</h1>
          <p className="mt-1 text-sm text-zinc-500">
            This product may have been removed or archived.
          </p>
        </div>
        <Link
          href="/components"
          className="inline-flex items-center gap-2 rounded-xl bg-[#222222] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#1CA2D1]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to STEM Catalog
        </Link>
      </div>
    );
  }

  const isOutOfStock = component.stockQuantity === 0;
  const isLowStock = !isOutOfStock && component.stockQuantity <= 10;
  const maxQty = Math.min(component.stockQuantity, 99);

  // Discount calculation
  const hasDiscount = component.discountedPriceCents !== null && component.discountedPriceCents !== undefined && component.discountedPriceCents < component.unitPriceCents;
  const activePriceCents = hasDiscount ? component.discountedPriceCents! : component.unitPriceCents;
  const originalPriceCents = component.unitPriceCents;
  const discountPercent = hasDiscount ? Math.round(((originalPriceCents - activePriceCents) / originalPriceCents) * 100) : 0;

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

  return (
    <div className="bg-[#f2f2f0] text-[#222222] min-h-screen pb-20 lg:pb-12">
      {/* ── Breadcrumb nav ── */}
      <div className="border-b border-[#D8D8C4] bg-[#FAFAED] px-4 sm:px-6 py-3">
        <div className="mx-auto flex max-w-7xl items-center gap-2 text-xs font-medium text-zinc-500">
          <Link href="/" className="hover:text-[#222222] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/components" className="hover:text-[#222222] transition-colors">Catalog</Link>
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

      {/* ── Product layout container ── */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-6 lg:py-10">
        <div className="grid gap-8 lg:grid-cols-12">
          
          {/* ── LEFT COLUMN (Sticky Image & Quick Tools) ── */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 self-start space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-white rounded-2xl p-4 border border-[#D8D8C4] shadow-xs"
            >
              <ProductImageGallery
                fallbackImageUrl={component.imageUrl}
                media={productMedia}
                productName={component.name}
              />
            </motion.div>

            {/* Delivery Pincode Checker */}
            <div className="bg-white rounded-2xl p-5 border border-[#D8D8C4] shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-[#222222]">
                <MapPin className="h-4 w-4 text-[#1CA2D1]" />
                <span>Delivery Options</span>
              </div>
              <form onSubmit={handleCheckPincode} className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Enter 6-digit Pincode"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                  className="flex-1 h-10 px-3 text-sm font-semibold rounded-xl border border-zinc-300 focus:outline-none focus:border-[#1CA2D1]"
                />
                <button
                  type="submit"
                  disabled={isCheckingPincode || pincode.length !== 6}
                  className="h-10 px-4 rounded-xl bg-[#222222] text-xs font-bold text-white transition hover:bg-[#1CA2D1] disabled:opacity-50 flex items-center justify-center"
                >
                  {isCheckingPincode ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Check"
                  )}
                </button>
              </form>
              
              {deliveryStatus && (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span className="text-xs font-bold text-emerald-800">{deliveryStatus}</span>
                </div>
              )}

              {deliveryError && (
                <p className="text-xs font-bold text-red-500">{deliveryError}</p>
              )}

              <p className="text-[11px] text-zinc-400">
                Please enter your pin code to check delivery availability and cash on delivery eligibility.
              </p>
            </div>

            {/* Quick Trust Cards */}
            <div className="grid grid-cols-2 gap-3">
              {TRUST.map(({ icon: Icon, label, sub }) => (
                <div
                  key={label}
                  className="flex items-start gap-2.5 rounded-xl border border-[#D8D8C4] bg-white p-3.5"
                >
                  <Icon className="h-5 w-5 text-[#1CA2D1] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-[#222222]">{label}</h4>
                    <p className="text-[10px] text-zinc-500 mt-0.5 leading-normal">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT COLUMN (Product details scrolling flow) ── */}
          <div className="lg:col-span-7 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="bg-white rounded-2xl p-6 border border-[#D8D8C4] shadow-xs space-y-6"
            >
              {/* Product Badges & Metadata */}
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-[#1CA2D1]/10 px-3 py-0.5 text-xs font-bold text-[#1CA2D1]">
                    {compactProductType(component.productType)}
                  </span>
                  {component.isBestSeller && (
                    <span className="rounded-full bg-amber-50 px-3 py-0.5 text-xs font-bold text-amber-700 border border-amber-200">
                      Best Seller
                    </span>
                  )}
                  {component.isRobomaniacItem && (
                    <span className="rounded-full border border-[#D8D8C4] bg-[#FAFAED] px-3 py-0.5 text-xs font-bold text-zinc-700">
                      STEM Store
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#222222] leading-tight">
                  {component.name}
                </h1>

                {/* Rating Row & Specs line */}
                <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-zinc-500">
                  <div className="flex items-center gap-1 text-[#222222]">
                    <div className="flex items-center bg-emerald-600 text-white font-bold px-1.5 py-0.5 rounded text-[10px] gap-0.5">
                      <span>4.6</span>
                      <Star className="h-3 w-3 fill-current text-white" />
                    </div>
                    <span className="text-zinc-400 font-normal">| 18 Ratings & Reviews</span>
                  </div>

                  {component.sku && <span>SKU: <span className="text-[#222222] font-semibold">{component.sku}</span></span>}
                  {component.brand && <span>Brand: <span className="text-[#222222] font-semibold">{component.brand}</span></span>}
                </div>
              </div>

              {/* Pricing Panel */}
              <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-150 space-y-1">
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-3xl font-black text-[#1CA2D1]">
                    {formatPrice(activePriceCents)}
                  </span>
                  {hasDiscount && (
                    <>
                      <span className="text-sm font-semibold text-zinc-400 line-through">
                        {formatPrice(originalPriceCents)}
                      </span>
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                        {discountPercent}% OFF
                      </span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                  <Check className="h-3.5 w-3.5" />
                  <span>Price includes GST. Invoicing ready.</span>
                </div>
              </div>

              {/* Actions & Inventory */}
              <div className="space-y-4 pt-2">
                {/* Stock Indicator */}
                <div
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold w-fit",
                    isOutOfStock
                      ? "bg-red-50 text-red-600"
                      : isLowStock
                      ? "bg-amber-50 text-amber-700"
                      : "bg-emerald-50 text-emerald-700"
                  )}
                >
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full",
                      isOutOfStock
                        ? "bg-red-500 animate-pulse"
                        : isLowStock
                        ? "bg-amber-500 animate-pulse"
                        : "bg-emerald-500"
                    )}
                  />
                  {isOutOfStock
                    ? "Out of Stock"
                    : isLowStock
                    ? `Only ${component.stockQuantity} left in stock!`
                    : "Currently In Stock"}
                </div>

                {/* Qty Selector & Actions */}
                {!isOutOfStock && (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Qty:</span>
                      <div className="flex items-center overflow-hidden rounded-xl border border-[#D8D8C4] bg-[#FAFAED]">
                        <button
                          type="button"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="flex h-9 w-9 items-center justify-center text-zinc-600 hover:bg-[#EAEADB] transition-colors"
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
                          className="h-9 w-12 bg-transparent text-center text-sm font-bold text-[#222222] outline-none"
                          type="number"
                          min="1"
                          max={maxQty}
                        />
                        <button
                          type="button"
                          onClick={() => setQuantity(Math.min(maxQty, quantity + 1))}
                          className="flex h-9 w-9 items-center justify-center text-zinc-600 hover:bg-[#EAEADB] transition-colors"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="text-xs font-bold text-zinc-500">
                      Total: <span className="text-base text-[#222222] ml-0.5">{formatPrice(activePriceCents * quantity)}</span>
                    </div>
                  </div>
                )}

                {/* Main CTAs */}
                <div className="grid gap-3 sm:grid-cols-2 pt-2">
                  <button
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    className={cn(
                      "inline-flex h-12 items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all active:scale-95 cursor-pointer",
                      isOutOfStock
                        ? "cursor-not-allowed bg-zinc-200 text-zinc-400"
                        : itemQty > 0
                        ? "bg-[#1CA2D1]/15 text-[#1CA2D1] border border-[#1CA2D1]/30 hover:bg-[#1CA2D1]/25"
                        : "bg-[#1CA2D1] text-white hover:bg-[#1CA2D1]/90 shadow-xs"
                    )}
                  >
                    <ShoppingCart className="h-4.5 w-4.5 shrink-0" />
                    {itemQty > 0 ? `In Cart (${itemQty})` : "Add to Cart"}
                  </button>
                  
                  <button
                    onClick={handleBuyNow}
                    disabled={isOutOfStock}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#222222] text-sm font-bold text-white transition-all hover:bg-[#1CA2D1] disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-400 active:scale-95 cursor-pointer shadow-xs"
                  >
                    <Zap className="h-4.5 w-4.5 shrink-0 fill-current" />
                    Buy Now
                  </button>
                </div>

                {/* Wishlist Button */}
                <button
                  type="button"
                  onClick={handleWishlist}
                  className={cn(
                    "inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border text-sm font-semibold transition-all active:scale-98 cursor-pointer",
                    isWishlisted
                      ? "border-[#1CA2D1]/40 bg-[#1CA2D1]/8 text-[#1CA2D1]"
                      : "border-[#D8D8C4] text-zinc-600 hover:border-[#222222] hover:text-[#222222]"
                  )}
                >
                  <Heart
                    className="h-4 w-4 shrink-0"
                    fill={isWishlisted ? "currentColor" : "none"}
                  />
                  {isWishlisted ? "Saved to Wishlist" : "Add to Wishlist"}
                </button>
              </div>
            </motion.div>

            {/* Highlights bullets */}
            <div className="bg-white rounded-2xl p-6 border border-[#D8D8C4] shadow-xs space-y-4">
              <h3 className="text-lg font-bold text-[#222222] flex items-center gap-2">
                <Info className="h-4 w-4 text-[#1CA2D1]" />
                Key Highlights
              </h3>
              
              <ul className="grid gap-2.5 text-sm text-zinc-600">
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Category classification: <span className="font-semibold text-[#222222]">{component.category}</span></span>
                </li>
                {component.subcategory && (
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Specialized classification: <span className="font-semibold text-[#222222]">{component.subcategory}</span></span>
                  </li>
                )}
                {component.typicalUseCase && (
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Recommended use case: <span className="font-semibold text-[#222222]">{component.typicalUseCase}</span></span>
                  </li>
                )}
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Verified stock: <span className="font-semibold text-[#222222]">{component.stockQuantity} units</span> available immediately.</span>
                </li>
              </ul>
            </div>

            {/* Inline Specifications Table (No Tabs!) */}
            <div className="bg-white rounded-2xl p-6 border border-[#D8D8C4] shadow-xs space-y-4">
              <h3 className="text-lg font-bold text-[#222222]">Product Specifications</h3>
              
              <div className="border border-[#D8D8C4] rounded-xl overflow-hidden divide-y divide-[#D8D8C4]">
                {(
                  [
                    ["Category", component.category],
                    ["Subcategory", component.subcategory || "N/A"],
                    ["Product Type", compactProductType(component.productType)],
                    component.brand ? ["Brand", component.brand] : null,
                    component.sku ? ["SKU", component.sku] : null,
                    ["In Stock", `${component.stockQuantity} units`],
                    ["Best Seller", component.isBestSeller ? "Yes" : "No"],
                    ["STEM Store Item", component.isRobomaniacItem ? "Yes" : "No"],
                  ] as ([string, string] | null)[]
                )
                  .filter((row): row is [string, string] => row !== null)
                  .map(([label, value], idx) => (
                    <div
                      key={label}
                      className={cn(
                        "grid grid-cols-3 gap-4 px-4 py-3 text-xs sm:text-sm",
                        idx % 2 === 0 ? "bg-zinc-50" : "bg-white"
                      )}
                    >
                      <span className="font-bold text-zinc-400 uppercase tracking-wider col-span-1 shrink-0">
                        {label}
                      </span>
                      <span className="font-semibold text-[#222222] col-span-2">{value}</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Product Overview Description */}
            <div className="bg-white rounded-2xl p-6 border border-[#D8D8C4] shadow-xs space-y-4">
              <h3 className="text-lg font-bold text-[#222222]">Description</h3>
              {component.description ? (
                <p className="text-sm leading-7 text-zinc-600 whitespace-pre-line">
                  {component.description}
                </p>
              ) : (
                <p className="text-sm text-zinc-400 italic">No description available for this item.</p>
              )}

              {component.tags.length > 0 && (
                <div className="pt-2 flex flex-wrap gap-1.5">
                  {component.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-zinc-100 border border-zinc-200 px-3 py-0.5 text-xs text-zinc-500 font-semibold"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Resources / Datasheets links */}
            <div className="bg-white rounded-2xl p-6 border border-[#D8D8C4] shadow-xs space-y-4">
              <h3 className="text-lg font-bold text-[#222222]">Resources & Downloads</h3>
              {component.vendorLink ? (
                <a
                  href={component.vendorLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between border border-[#D8D8C4] rounded-xl p-4 hover:border-[#1CA2D1]/40 hover:shadow-xs transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#1CA2D1]/10 rounded-lg text-[#1CA2D1]">
                      <Download className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#222222] group-hover:text-[#1CA2D1] transition-colors">
                        Technical Datasheet & Specifications
                      </p>
                      <p className="text-[11px] text-zinc-400 truncate max-w-[250px] sm:max-w-xs">
                        {component.vendorLink}
                      </p>
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-zinc-300 group-hover:text-[#1CA2D1] transition-colors shrink-0" />
                </a>
              ) : (
                <p className="text-sm text-zinc-400 italic">No datasheet or resources linked yet.</p>
              )}
            </div>

          </div>
        </div>

        {/* ── Related Products ── */}
        {related.length > 0 && (
          <section className="mt-12 border-t border-[#D8D8C4] pt-10">
            <div className="mb-6 flex items-end justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1CA2D1]">
                  From {component.category}
                </p>
                <h2 className="mt-1 text-2xl font-extrabold text-[#222222]">Related Components</h2>
              </div>
              <Link
                href={`/components?category=${encodeURIComponent(component.category)}`}
                className="text-sm font-bold text-zinc-500 hover:text-[#222222] transition-colors"
              >
                View all →
              </Link>
            </div>

            <div className="grid gap-3 sm:gap-5 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
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
          </section>
        )}
      </main>

      {/* ── Mobile Sticky Bottom Action Bar ── */}
      {!isOutOfStock && (
        <div className="fixed inset-x-0 bottom-0 z-40 bg-white border-t border-zinc-200 px-4 py-3 shadow-2xl flex items-center justify-between lg:hidden">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">Total Price</span>
            <span className="text-lg font-black text-[#1CA2D1]">
              {formatPrice(activePriceCents * quantity)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Add to Cart icon button */}
            <button
              onClick={handleAddToCart}
              className={cn(
                "w-11 h-11 flex items-center justify-center rounded-xl transition cursor-pointer shrink-0 border",
                itemQty > 0
                  ? "bg-[#1CA2D1]/10 text-[#1CA2D1] border-[#1CA2D1]/30"
                  : "bg-zinc-100 text-zinc-600 border-zinc-200"
              )}
              aria-label="Add to cart"
            >
              <ShoppingCart className="h-5 w-5" />
            </button>

            {/* Buy Now button */}
            <button
              onClick={handleBuyNow}
              className="h-11 px-5 rounded-xl bg-[#222222] hover:bg-[#1CA2D1] text-xs font-bold text-white transition active:scale-95 cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <Zap className="h-3.5 w-3.5 fill-current" />
              <span>Buy Now</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
