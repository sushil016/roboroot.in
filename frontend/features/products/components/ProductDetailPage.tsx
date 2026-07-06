"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
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
import { reviewApi } from "@/features/products/services/review.service";
import { formatPrice, useCartStore } from "@/store/cart.store";
import { useWishlistStore } from "@/store/wishlist.store";
import { compactProductType } from "@/features/products/data/catalog";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductRevealCard } from "@/components/ui/product-reveal-card";
import { ProductImageGallery } from "@/features/products/components/ProductImageGallery";
import { cn } from "@/lib/utils";
import { ProductReviewsSection } from "./ProductReviewsSection";
import type { Component } from "@/types/marketplace.types";

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
  const { slug } = useParams() as { slug: string };
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [activeTab, setActiveTab] = useState<"description" | "specifications" | "warranty">("description");
  const [recentlyViewed, setRecentlyViewed] = useState<Component[]>([]);

  // Pincode state
  const [pincode, setPincode] = useState("");
  const [deliveryStatus, setDeliveryStatus] = useState<string | null>(null);
  const [deliveryError, setDeliveryError] = useState<string | null>(null);
  const [isCheckingPincode, setIsCheckingPincode] = useState(false);

  const { data: component, isLoading, error } = useQuery({
    queryKey: ["component", slug],
    queryFn: () => componentApi.getComponentBySlug(slug),
    enabled: Boolean(slug),
  });

  const componentId = component?.id || "";

  // Dynamic reviews stats fetch
  const { data: reviewsStats } = useQuery({
    queryKey: ["reviews-stats", componentId],
    queryFn: () => reviewApi.getReviews(componentId, 1, 1),
    enabled: Boolean(componentId),
  });

  const addItem = useCartStore((s) => s.addItem);
  const itemQty = useCartStore((s) => s.getItemQuantity(componentId));
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const isWishlisted = useWishlistStore((s) => s.isWishlisted(componentId));

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

  // Recently Viewed Logic
  useEffect(() => {
    if (!component) return;
    try {
      const stored = localStorage.getItem("roboroot_recently_viewed");
      let items: Component[] = stored ? JSON.parse(stored) : [];
      // Filter duplicate
      items = items.filter((item) => item.id !== component.id);
      // Insert front
      items.unshift(component);
      // Slice limit
      items = items.slice(0, 8);
      localStorage.setItem("roboroot_recently_viewed", JSON.stringify(items));
    } catch (e) {
      console.error(e);
    }
  }, [component]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("roboroot_recently_viewed");
      if (stored) {
        let items: Component[] = JSON.parse(stored);
        if (component) {
          items = items.filter((item) => item.id !== component.id);
        }
        setRecentlyViewed(items.slice(0, 4));
      }
    } catch (e) {
      console.error(e);
    }
  }, [component]);

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
      const options: Intl.DateTimeFormatOptions = { weekday: "long", month: "short", day: "numeric" };
      setDeliveryStatus(`Delivery by ${deliveryDate.toLocaleDateString("en-IN", options)}`);
    }, 700);
  }

  /* ---- Loading ---- */
  if (isLoading) {
    return (
      <div className="bg-[#fafaf9] min-h-screen">
        <div className="border-b border-zinc-200 bg-white px-4 sm:px-6 py-3">
          <Skeleton className="h-4 w-40" />
        </div>
        <DetailSkeleton />
      </div>
    );
  }

  /* ---- Error ---- */
  if (error || !component) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-5 px-4 text-center bg-white">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100">
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
          className="inline-flex items-center gap-2 rounded-full bg-[#222222] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#1CA2D1]"
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
  }

  function handleCartButtonClick() {
    if (itemQty > 0) {
      router.push("/cart");
      return;
    }

    if (isAdding) return;
    if (isOutOfStock) { toast.error("Out of stock"); return; }
    if (quantity > component!.stockQuantity) {
      toast.error(`Only ${component!.stockQuantity} available`);
      return;
    }

    setIsAdding(true);
    setTimeout(() => {
      handleAddToCart();
      toast.success("Added to cart", { description: `${quantity}× ${component!.name}` });
      setIsAdding(false);
    }, 850);
  }

  function handleBuyNow() {
    if (itemQty === 0) {
      handleAddToCart();
    }
    router.push("/cart");
  }

  function handleWishlist() {
    toggleWishlist(component!);
    toast.success(isWishlisted ? "Removed from wishlist" : "Saved to wishlist");
  }

  return (
    <div className="bg-[#fafaf9] text-[#222222] min-h-screen pb-20 lg:pb-12">
      {/* ── Apple Breadcrumb nav ── */}
      <div className="border-b border-zinc-200 bg-white/80 backdrop-blur-md px-4 sm:px-6 py-3 sticky top-0 z-30">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400">
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
          </div>
          <div className="hidden sm:flex items-center gap-4">
            <span className="text-xs font-bold text-zinc-800 truncate max-w-[200px]">
              {component.name}
            </span>
          </div>
        </div>
      </div>

      {/* ── Product layout container ── */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8 lg:py-16">
        <div className="grid gap-12 lg:grid-cols-12">
          
          {/* ── LEFT COLUMN (Sticky Image & Quick Tools) ── */}
          <div className="lg:col-span-6 lg:sticky lg:top-24 self-start space-y-8">
            <div className="bg-transparent">
              <ProductImageGallery
                fallbackImageUrl={component.imageUrl}
                media={productMedia}
                productName={component.name}
              />
            </div>

            {/* Delivery Pincode Checker */}
            <div className="space-y-3 pt-6 border-t border-zinc-200">
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                <MapPin className="h-4 w-4 text-[#1CA2D1]" />
                <span>Delivery Estimator</span>
              </div>
              <form onSubmit={handleCheckPincode} className="flex gap-2 max-w-md">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Enter 6-digit Pincode"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                  className="flex-1 h-11 px-4 text-sm font-semibold rounded-full border border-zinc-350 focus:outline-none focus:border-[#222222] bg-white transition-all"
                />
                <button
                  type="submit"
                  disabled={isCheckingPincode || pincode.length !== 6}
                  className="h-11 px-6 rounded-full bg-[#222222] text-xs font-bold text-white transition hover:bg-[#1CA2D1] disabled:opacity-50 flex items-center justify-center cursor-pointer"
                >
                  {isCheckingPincode ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Estimate"
                  )}
                </button>
              </form>
              
              {deliveryStatus && (
                <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-100/50 flex items-center gap-2 max-w-md">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span className="text-xs font-bold text-emerald-800">{deliveryStatus}</span>
                </div>
              )}

              {deliveryError && (
                <p className="text-xs font-bold text-red-500">{deliveryError}</p>
              )}
            </div>

            {/* Quick Trust Cards */}
            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-zinc-200">
              {TRUST.map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex items-start gap-3">
                  <Icon className="h-5 w-5 text-zinc-700 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-[#222222]">{label}</h4>
                    <p className="text-[10px] text-zinc-400 font-semibold mt-0.5 leading-normal">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT COLUMN (Product details scrolling flow) ── */}
          <div className="lg:col-span-6 space-y-8">
            <div className="space-y-6">
              {/* Product Badges & Metadata */}
              <div className="space-y-3">
                <span className="inline-block text-[11px] font-extrabold uppercase tracking-widest text-[#1CA2D1]">
                  {compactProductType(component.productType)}
                </span>

                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#222222] leading-tight">
                  {component.name}
                </h1>

                {/* Rating Row & Specs line */}
                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-zinc-400">
                  {reviewsStats && reviewsStats.reviewCount > 0 ? (
                    <div className="flex items-center gap-1.5 text-[#222222]">
                      <div className="flex items-center bg-[#222222] text-white font-bold px-1.5 py-0.5 rounded text-[10px] gap-0.5">
                        <span>{reviewsStats.averageRating.toFixed(1)}</span>
                        <Star className="h-3 w-3 fill-current text-white" />
                      </div>
                      <span className="text-zinc-500 font-bold">| {reviewsStats.reviewCount} Ratings & Reviews</span>
                    </div>
                  ) : (
                    <span className="text-zinc-400">No reviews yet</span>
                  )}

                  {component.sku && <span>SKU: <span className="text-[#222222] font-bold">{component.sku}</span></span>}
                  {component.brand && <span>Brand: <span className="text-[#222222] font-bold">{component.brand}</span></span>}
                </div>
              </div>

              {/* Pricing Panel */}
              <div className="space-y-1 py-4 border-t border-b border-zinc-200">
                <div className="flex items-baseline gap-3.5 flex-wrap">
                  <span className="text-3xl font-black tracking-tight text-[#222222]">
                    {formatPrice(activePriceCents)}
                  </span>
                  {hasDiscount && (
                    <>
                      <span className="text-base font-semibold text-zinc-400 line-through">
                        {formatPrice(originalPriceCents)}
                      </span>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                        {discountPercent}% OFF
                      </span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600">
                  <Check className="h-3.5 w-3.5 shrink-0" />
                  <span>Price includes GST. Invoicing ready.</span>
                </div>
              </div>

              {/* Actions & Inventory */}
              <div className="space-y-6 pt-2">
                {/* Stock Indicator */}
                <div
                  className={cn(
                    "flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider w-fit",
                    isOutOfStock
                      ? "text-red-500"
                      : isLowStock
                      ? "text-amber-600"
                      : "text-emerald-600"
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
                      <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Qty:</span>
                      <div className="flex items-center overflow-hidden rounded-full border border-zinc-300 bg-white">
                        <button
                          type="button"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="flex h-10 w-10 items-center justify-center text-zinc-500 hover:bg-zinc-100 transition-colors cursor-pointer"
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
                          className="h-10 w-12 bg-transparent text-center text-sm font-bold text-[#222222] outline-none"
                          type="number"
                          min="1"
                          max={maxQty}
                        />
                        <button
                          type="button"
                          onClick={() => setQuantity(Math.min(maxQty, quantity + 1))}
                          className="flex h-10 w-10 items-center justify-center text-zinc-500 hover:bg-zinc-100 transition-colors cursor-pointer"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                      Subtotal: <span className="text-lg text-[#222222] ml-1 font-extrabold">{formatPrice(activePriceCents * quantity)}</span>
                    </div>
                  </div>
                )}

                {/* Main CTAs */}
                <div className="grid gap-3 sm:grid-cols-2 pt-2">
                  <button
                    onClick={handleCartButtonClick}
                    disabled={isOutOfStock || isAdding}
                    className={cn(
                      "inline-flex h-12 items-center justify-center gap-2 rounded-full text-sm font-bold transition-all active:scale-95 cursor-pointer border relative overflow-hidden",
                      isOutOfStock
                        ? "cursor-not-allowed bg-zinc-100 text-zinc-400 border-zinc-200"
                        : itemQty > 0
                        ? "bg-emerald-600 text-white border-transparent hover:bg-emerald-700 shadow-md"
                        : "bg-zinc-900 text-[#F2F2F0] border-zinc-800 hover:bg-zinc-950 shadow-sm"
                    )}
                  >
                    {isAdding ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4.5 w-4.5 animate-spin shrink-0" />
                        <motion.span
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.15 }}
                          className="inline-block"
                        >
                          Adding to Cart...
                        </motion.span>
                      </div>
                    ) : itemQty > 0 ? (
                      <div className="flex items-center gap-2">
                        <ArrowRight className="h-4.5 w-4.5 shrink-0 animate-bounce" />
                        <motion.span
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        >
                          Go to Cart
                        </motion.span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <ShoppingCart className="h-4.5 w-4.5 shrink-0" />
                        <span>Add to Cart</span>
                      </div>
                    )}
                  </button>
                  
                  <button
                    onClick={handleBuyNow}
                    disabled={isOutOfStock}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-zinc-900 text-sm font-bold text-[#F2F2F0] hover:bg-zinc-950 border border-zinc-800 transition-all disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-400 active:scale-95 cursor-pointer shadow-xs"
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
                    "inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border text-xs font-bold uppercase tracking-wider transition-all active:scale-98 cursor-pointer",
                    isWishlisted
                      ? "border-transparent bg-zinc-100 text-red-500"
                      : "border-zinc-300 text-zinc-600 hover:border-[#222222] hover:text-[#222222]"
                  )}
                >
                  <Heart
                    className="h-4 w-4 shrink-0"
                    fill={isWishlisted ? "currentColor" : "none"}
                  />
                  {isWishlisted ? "Saved to Wishlist" : "Add to Wishlist"}
                </button>
              </div>
            </div>

            {/* Key Highlights */}
            <div className="space-y-4 pt-6 border-t border-zinc-200">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                <Info className="h-4 w-4" />
                Key Highlights
              </h3>
              
              <ul className="grid gap-3 text-sm text-zinc-650 font-medium">
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Category classification: <span className="font-bold text-[#222222]">{component.category}</span></span>
                </li>
                {component.subcategory && (
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Specialized classification: <span className="font-bold text-[#222222]">{component.subcategory}</span></span>
                  </li>
                )}
                {component.typicalUseCase && (
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Recommended use case: <span className="font-bold text-[#222222]">{component.typicalUseCase}</span></span>
                  </li>
                )}
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Verified stock: <span className="font-bold text-[#222222]">{component.stockQuantity} units</span> available immediately.</span>
                </li>
              </ul>
            </div>

            {/* Apple Styled Description & Specs Tab Panel */}
            <div className="pt-8 border-t border-zinc-200 space-y-6">
              <div className="border-b border-zinc-200">
                <div className="flex gap-8">
                  {(["description", "specifications", "warranty"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={cn(
                        "pb-3 text-xs font-extrabold uppercase tracking-widest border-b-2 transition-all cursor-pointer",
                        activeTab === tab 
                          ? "border-[#222222] text-[#222222]" 
                          : "border-transparent text-zinc-400 hover:text-zinc-600"
                      )}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Contents */}
              <div className="min-h-[150px]">
                {activeTab === "description" && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    {component.description ? (
                      <p className="text-sm leading-relaxed text-zinc-600 whitespace-pre-line font-medium">
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
                )}

                {activeTab === "specifications" && (
                  <div className="animate-in fade-in duration-200">
                    <div className="border border-zinc-200 rounded-xl overflow-hidden divide-y divide-zinc-200 bg-white">
                      {(
                        [
                          ["Category", component.category],
                          ["Subcategory", component.subcategory || "N/A"],
                          ["Product Type", compactProductType(component.productType)],
                          component.brand ? ["Brand", component.brand] : null,
                          component.sku ? ["SKU", component.sku] : null,
                          ["In Stock", `${component.stockQuantity} units`],
                        ] as ([string, string] | null)[]
                      )
                        .filter((row): row is [string, string] => row !== null)
                        .map(([label, value], idx) => (
                          <div
                            key={label}
                            className={cn(
                              "grid grid-cols-3 gap-4 px-4 py-3.5 text-xs sm:text-sm font-medium",
                              idx % 2 === 0 ? "bg-zinc-50" : "bg-white"
                            )}
                          >
                            <span className="font-bold text-zinc-400 uppercase tracking-wider col-span-1 shrink-0">
                              {label}
                            </span>
                            <span className="font-bold text-[#222222] col-span-2">{value}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {activeTab === "warranty" && (
                  <div className="space-y-4 animate-in fade-in duration-200 font-medium text-zinc-650 text-sm leading-relaxed">
                    <p className="font-bold text-zinc-800">
                      Standard 6-Month Manufacturer Warranty
                    </p>
                    <p>
                      This electronic component comes with a standard 6-month limited warranty covering manufacturing defects under normal operating parameters.
                    </p>
                    <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200/60 space-y-2">
                      <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                        Exclusions and Void conditions:
                      </p>
                      <ul className="list-disc pl-4 text-xs space-y-1 text-zinc-500">
                        <li>Physical damages due to drop impacts, pressure, or incorrect mounting.</li>
                        <li>Traces of moisture, liquid contact, corrosion, or soldering mishaps.</li>
                        <li>Burnt semiconductors resulting from reverse polarity, overvoltage, or short circuits.</li>
                        <li>Usage exceeding absolute maximum specifications outlined in the datasheet.</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Resources / Datasheets links */}
            <div className="pt-8 border-t border-zinc-200 space-y-4">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Resources & Downloads</h3>
              {component.vendorLink ? (
                <a
                  href={component.vendorLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between border border-zinc-200 rounded-xl p-4 hover:border-zinc-400 hover:bg-zinc-50 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-zinc-100 rounded-lg text-zinc-700">
                      <Download className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#222222] group-hover:text-[#1CA2D1] transition-colors">
                        Technical Datasheet & Specifications
                      </p>
                      <p className="text-[11px] text-zinc-400 truncate max-w-[250px] sm:max-w-xs font-semibold mt-0.5">
                        {component.vendorLink}
                      </p>
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-zinc-300 group-hover:text-zinc-600 transition-colors shrink-0" />
                </a>
              ) : (
                <p className="text-sm text-zinc-400 italic">No datasheet or resources linked yet.</p>
              )}
            </div>

          </div>
        </div>

        {/* ── Product Reviews & Ratings ── */}
        <div className="mt-16 pt-16 border-t border-zinc-200 bg-transparent">
          <ProductReviewsSection componentId={component.id} productName={component.name} />
        </div>

        {/* ── Related Products ── */}
        {related.length > 0 && (
          <section className="mt-16 border-t border-zinc-200 pt-16 bg-transparent">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1CA2D1]">
                  From Category {component.category}
                </p>
                <h2 className="mt-1 text-2xl font-extrabold text-[#222222] tracking-tight">Related Components</h2>
              </div>
              <Link
                href={`/components?category=${encodeURIComponent(component.category)}`}
                className="text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-[#222222] transition-colors"
              >
                View all →
              </Link>
            </div>

            <div className="grid gap-6 grid-cols-2 lg:grid-cols-4">
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

        {/* ── Recently Viewed Items ── */}
        {recentlyViewed.length > 0 && (
          <section className="mt-16 border-t border-zinc-200 pt-16 bg-transparent">
            <div className="mb-8">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
                Based on your interest
              </p>
              <h2 className="mt-1 text-2xl font-extrabold text-[#222222] tracking-tight">Recently Viewed Items</h2>
            </div>

            <div className="grid gap-6 grid-cols-2 lg:grid-cols-4">
              {recentlyViewed.map((item) => (
                <ProductRevealCard
                  key={item.id}
                  component={item}
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
        <div className="fixed inset-x-0 bottom-0 z-40 bg-white/95 backdrop-blur-md border-t border-zinc-200 px-6 py-4 flex items-center justify-between lg:hidden shadow-lg">
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Total Price</span>
            <span className="text-lg font-black text-[#222222]">
              {formatPrice(activePriceCents * quantity)}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Add to Cart icon button */}
            <button
              onClick={handleCartButtonClick}
              disabled={isAdding}
              className={cn(
                "w-11 h-11 flex items-center justify-center rounded-full transition cursor-pointer shrink-0 border relative",
                isAdding
                  ? "bg-zinc-100 text-zinc-400 border-zinc-200 cursor-not-allowed"
                  : itemQty > 0
                  ? "bg-[#1CA2D1] text-white border-transparent shadow-sm"
                  : "bg-zinc-50 text-zinc-650 border-zinc-200 hover:bg-zinc-100"
              )}
              aria-label={itemQty > 0 ? "Go to cart" : "Add to cart"}
            >
              {isAdding ? (
                <Loader2 className="h-4.5 w-4.5 animate-spin" />
              ) : itemQty > 0 ? (
                <ArrowRight className="h-4.5 w-4.5" />
              ) : (
                <ShoppingCart className="h-5 w-5" />
              )}
            </button>

            {/* Buy Now button */}
            <button
              onClick={handleBuyNow}
              className="h-11 px-6 rounded-full bg-[#1CA2D1] hover:bg-[#1CA2D1]/90 text-xs font-bold text-white transition active:scale-95 cursor-pointer shadow-xs flex items-center gap-1.5"
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
