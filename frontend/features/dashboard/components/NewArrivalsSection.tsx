"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { componentApi } from "@/features/products/services/product.service";
import { useCartStore, formatPrice } from "@/store/cart.store";
import { useWishlistStore } from "@/store/wishlist.store";
import { toast } from "sonner";
import { Heart, ShoppingCart, Sparkles, Package, ArrowRight } from "lucide-react";
import type { Component } from "@/types/marketplace.types";

const cardVariants: any = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
      delay: i * 0.08,
    },
  }),
};

// Fallback high-fidelity mock data for new arrivals
const MOCK_NEW_ARRIVALS: Component[] = [
  {
    id: "mock-new-1",
    slug: "esp32-s3-wroom-cam-development-board",
    name: "ESP32-S3 WROOM Cam Development Board",
    sku: "DEV-ESP32S3-CAM",
    description: "ESP32-S3 module with built-in camera and dual-core processor for computer vision and IoT applications.",
    typicalUseCase: "Smart security systems, robotics sight, and AIOT applications",
    vendorLink: null,
    imageUrl: null,
    brand: "Espressif",
    unitPriceCents: 124900,
    stockQuantity: 60,
    category: "Development Boards",
    subcategory: "ESP32",
    productType: "DEVELOPMENT_BOARD",
    isBestSeller: false,
    isRobomaniacItem: false,
    isSoftware: false,
    isActive: true,
    tags: ["esp32", "camera", "wifi", "bluetooth"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "mock-new-2",
    slug: "precision-flight-tof-lidar-distance-sensor",
    name: "Precision Flight ToF LiDAR Distance Sensor",
    sku: "SEN-TOF-LIDAR",
    description: "Time-of-Flight distance sensor for high precision distance measurement and collision avoidance.",
    typicalUseCase: "UAV altitude control and robotic collision avoidance",
    vendorLink: null,
    imageUrl: null,
    brand: null,
    unitPriceCents: 64900,
    stockQuantity: 110,
    category: "Sensors",
    subcategory: "LiDAR",
    productType: "SENSOR",
    isBestSeller: false,
    isRobomaniacItem: false,
    isSoftware: false,
    isActive: true,
    tags: ["sensor", "lidar", "tof", "distance"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "mock-new-3",
    slug: "t-motor-f60-pro-iv-fpv-racing-motor",
    name: "T-Motor F60 Pro IV FPV Racing Motor",
    sku: "MOT-TM-F60",
    description: "Premium high performance motor designed specifically for racing drones and FPV copters.",
    typicalUseCase: "FPV drone thrust propulsion systems",
    vendorLink: null,
    imageUrl: null,
    brand: "T-Motor",
    unitPriceCents: 289900,
    stockQuantity: 30,
    category: "Drones & Aerospace",
    subcategory: "Motors",
    productType: "MOTOR_ACTUATOR",
    isBestSeller: false,
    isRobomaniacItem: false,
    isSoftware: false,
    isActive: true,
    tags: ["motor", "drone", "fpv", "aerospace"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "mock-new-4",
    slug: "4s-1500mah-120c-lipo-battery-pack",
    name: "4S 1500mAh 120C LiPo Battery Pack",
    sku: "BAT-4S-1500",
    description: "High discharge rate LiPo battery pack providing maximum power and capacity for aerial platforms.",
    typicalUseCase: "High throttle power supply for multirotors and fixed-wing models",
    vendorLink: null,
    imageUrl: null,
    brand: null,
    unitPriceCents: 219900,
    stockQuantity: 40,
    category: "Power & Batteries",
    subcategory: "LiPo Batteries",
    productType: "POWER_BATTERY",
    isBestSeller: false,
    isRobomaniacItem: false,
    isSoftware: false,
    isActive: true,
    tags: ["power", "battery", "lipo", "4s"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

function NewArrivalCard({ component }: { component: Component }) {
  const addItem = useCartStore((state) => state.addItem);
  const toggleWishlist = useWishlistStore((state) => state.toggleItem);
  const isWishlisted = useWishlistStore((state) => state.isWishlisted(component.id));
  const isOutOfStock = component.stockQuantity === 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) {
      toast.error("Out of stock");
      return;
    }
    addItem(component, 1);
    toast.success("Added to cart", { description: component.name });
  };

  return (
    <div className="group relative flex flex-col h-full w-full overflow-hidden rounded-2xl border border-[#D8D8C4] bg-white p-3 sm:p-4 transition-all duration-300 hover:border-[#1CA2D1]/40 hover:shadow-xl hover:-translate-y-1">
      {/* New Badge */}
      <div className="absolute left-2 top-2 sm:left-3 sm:top-3 z-10 flex items-center gap-0.5 sm:gap-1 rounded-full bg-emerald-600 px-2 py-0.5 sm:px-2.5 sm:py-1 text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-white shadow-sm">
        <span>NEW</span>
        <Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white fill-current" />
      </div>

      {/* Wishlist Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleWishlist(component);
          toast.success(isWishlisted ? "Removed from wishlist" : "Saved to wishlist");
        }}
        className={`absolute right-2 top-2 sm:right-3 sm:top-3 z-10 flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full shadow-sm border transition-all duration-200 ${
          isWishlisted
            ? "border-transparent bg-[#1CA2D1] text-white scale-100"
            : "border-[#D8D8C4] bg-[#FAFAED]/90 text-zinc-500 hover:bg-white hover:text-zinc-800"
        }`}
      >
        <Heart className="h-3 w-3 sm:h-3.5 sm:w-3.5" fill={isWishlisted ? "currentColor" : "none"} />
      </button>

      {/* Image container */}
      <Link href={`/components/${component.slug}`} className="relative flex aspect-square w-full shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#FAFAED]/60 p-2 sm:p-4">
        {component.imageUrl ? (
          <img
            src={component.imageUrl}
            alt={component.name}
            className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Package className="h-8 w-8 sm:h-12 sm:w-12 text-zinc-200" />
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="mt-3 sm:mt-4 flex flex-1 flex-col justify-between">
        <div>
          {/* Category */}
          <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-[#1CA2D1] h-4 flex items-center truncate">
            {component.subcategory || component.category}
          </span>

          {/* Title */}
          <Link href={`/components/${component.slug}`} className="mt-1 block h-8 sm:h-10 flex-shrink-0 overflow-hidden">
            <h3 className="line-clamp-2 text-xs sm:text-sm font-bold leading-snug text-[#222222] group-hover:text-[#1CA2D1] transition-colors">
              {component.name}
            </h3>
          </Link>

          {/* Tags */}
          <div className="mt-1.5 flex h-5 items-center gap-1 overflow-hidden">
            {component.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="rounded bg-[#FAFAED] px-1.5 py-0.5 text-[8px] sm:text-[9px] font-semibold text-zinc-500">
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Price and Add button */}
        <div className="mt-3 flex items-center justify-between border-t border-[#FAFAED] pt-2 sm:pt-3 flex-shrink-0">
          <div className="flex flex-col">
            {component.discountedPriceCents && component.discountedPriceCents < component.unitPriceCents ? (
              <>
                <div className="flex flex-wrap items-baseline gap-1">
                  <span className="text-sm sm:text-lg font-black text-[#1CA2D1]">
                    {formatPrice(component.discountedPriceCents)}
                  </span>
                  <span className="text-[10px] sm:text-xs text-zinc-400 line-through">
                    {formatPrice(component.unitPriceCents)}
                  </span>
                </div>
              </>
            ) : (
              <>
                <span className="text-sm sm:text-lg font-black text-[#1CA2D1]">
                  {formatPrice(component.unitPriceCents)}
                </span>
              </>
            )}
            <span className="text-[8px] sm:text-[9px] font-medium text-zinc-400">Inc. GST</span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`flex h-8 sm:h-9 items-center justify-center gap-1.5 rounded-xl px-2 sm:px-3 text-[10px] sm:text-xs font-bold transition-all duration-200 ${
              isOutOfStock
                ? "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                : "bg-zinc-950 text-white hover:bg-[#1CA2D1] hover:shadow-md hover:shadow-[#1CA2D1]/15"
            }`}
          >
            <ShoppingCart className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            <span className="hidden xs:inline">Add</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export function NewArrivalsSection() {
  const { data, isLoading } = useQuery({
    queryKey: ["new-arrivals"],
    queryFn: () => componentApi.getComponents({ sortBy: "createdAt", sortOrder: "desc", limit: 4 }),
    staleTime: 5 * 60 * 1000,
  });

  const components = data?.components && data.components.length > 0
    ? data.components
    : MOCK_NEW_ARRIVALS;

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="rounded-[2.5rem] bg-[#E8ECEF] border border-[#D0D8DC] px-4 py-8 sm:px-12 shadow-sm">
        {/* Centered header */}
        <div className="mb-12 text-center">
          <span className="rounded-full bg-emerald-100 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-800">
            New Arrivals
          </span>
          <p className="mx-auto mt-3 max-w-2xl text-xs sm:text-sm font-medium leading-relaxed text-zinc-600">
            Stay ahead of the curve with our latest additions. Explore cutting-edge components, development boards, and modules fresh in our inventory.
          </p>
        </div>

        {/* Product grid */}
        <motion.div
          className="grid gap-3 sm:gap-6 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 items-stretch"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
        >
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="overflow-hidden rounded-2xl border border-[#E4E4D8] bg-white animate-pulse h-[280px] sm:h-[380px]">
                  <div className="aspect-square bg-[#F0F0E8]" />
                  <div className="space-y-2.5 px-4 py-4">
                    <div className="h-2.5 w-14 rounded-full bg-[#EAEADB]" />
                    <div className="h-4 w-full rounded-md bg-[#EAEADB]" />
                    <div className="h-4 w-3/4 rounded-md bg-[#EAEADB]" />
                    <div className="flex items-center justify-between pt-2">
                      <div className="h-6 w-20 rounded-md bg-[#EAEADB]" />
                      <div className="h-2.5 w-16 rounded-full bg-[#EAEADB]" />
                    </div>
                  </div>
                </div>
              ))
            : components.map((component, idx) => (
                <motion.div key={component.id} custom={idx} variants={cardVariants} className="h-full flex">
                  <NewArrivalCard component={component} />
                </motion.div>
              ))}
        </motion.div>

        {/* View All CTA */}
        <div className="mt-12 flex justify-center">
          <Link
            href="/components?sortBy=createdAt&sortOrder=desc"
            className="flex items-center gap-2 rounded-xl bg-zinc-950 px-6 py-3 sm:px-8 sm:py-3.5 text-xs sm:text-sm font-black text-white transition hover:bg-[#1CA2D1] hover:shadow-lg"
          >
            Browse New Arrivals
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
