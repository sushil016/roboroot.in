"use client";

import type { MouseEvent } from "react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, type Variants } from "framer-motion";
import { ArrowRight, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { ProductImage } from "@/features/products/components/ProductImage";
import { componentApi } from "@/features/products/services/product.service";
import type { Component } from "@/types/marketplace.types";
import { formatPrice, useCartStore } from "@/store/cart.store";
import { useWishlistStore } from "@/store/wishlist.store";

const RECENTLY_VIEWED_KEY = "roboroot_recently_viewed";

const cardVariants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] } },
} satisfies Variants;

const gridVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
} satisfies Variants;

const POPULAR_FALLBACK: Component[] = [
  {
    id: "mock-suggestion-1",
    slug: "esp32-wroom-32-wifi-bluetooth-module",
    name: "ESP32 WROOM-32 WiFi Bluetooth Module",
    sku: "COM-ESP32-WROOM",
    description: "Dual-mode wireless module for IoT telemetry and connected devices.",
    typicalUseCase: "WiFi and Bluetooth robotics control",
    vendorLink: null,
    imageUrl: null,
    brand: "Espressif",
    unitPriceCents: 39900,
    discountedPriceCents: 34900,
    stockQuantity: 160,
    category: "Communication Modules",
    subcategory: "WiFi & Bluetooth",
    productType: "MODULE",
    isBestSeller: true,
    isRobomaniacItem: false,
    isSoftware: false,
    isActive: true,
    tags: ["esp32", "wifi", "bluetooth"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "mock-suggestion-2",
    slug: "hc-sr04-ultrasonic-distance-sensor-module",
    name: "HC-SR04 Ultrasonic Distance Sensor Module",
    sku: "SEN-HCSR04",
    description: "Ultrasonic sensor for non-contact distance measurement.",
    typicalUseCase: "Obstacle detection for mobile robots",
    vendorLink: null,
    imageUrl: null,
    brand: null,
    unitPriceCents: 14900,
    discountedPriceCents: 11900,
    stockQuantity: 250,
    category: "Sensors",
    subcategory: "Ultrasonic",
    productType: "SENSOR",
    isBestSeller: true,
    isRobomaniacItem: false,
    isSoftware: false,
    isActive: true,
    tags: ["sensor", "distance", "ultrasonic"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "mock-suggestion-3",
    slug: "high-torque-mg996r-metal-gear-servo-motor",
    name: "High Torque MG996R Metal Gear Servo Motor",
    sku: "MOT-MG996R",
    description: "High torque metal geared servo for heavy duty applications.",
    typicalUseCase: "Robotic arms, steering systems, and mechanical actuators",
    vendorLink: null,
    imageUrl: null,
    brand: null,
    unitPriceCents: 29900,
    stockQuantity: 85,
    category: "Motors & Actuators",
    subcategory: "Servos",
    productType: "MOTOR_ACTUATOR",
    isBestSeller: true,
    isRobomaniacItem: false,
    isSoftware: false,
    isActive: true,
    tags: ["motor", "servo", "high-torque"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "mock-suggestion-4",
    slug: "l298n-dual-h-bridge-motor-driver-module",
    name: "L298N Dual H-Bridge Motor Driver Module",
    sku: "DRV-L298N",
    description: "Reliable dual motor driver board for mobile robots and small automation builds.",
    typicalUseCase: "Driving DC motors from Arduino or ESP32",
    vendorLink: null,
    imageUrl: null,
    brand: null,
    unitPriceCents: 18900,
    discountedPriceCents: 16900,
    stockQuantity: 135,
    category: "Motors & Actuators",
    subcategory: "Motor Drivers",
    productType: "MOTOR_ACTUATOR",
    isBestSeller: true,
    isRobomaniacItem: false,
    isSoftware: false,
    isActive: true,
    tags: ["driver", "motor", "robotics"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

function uniqueProducts(products: Component[]): Component[] {
  const seen = new Set<string>();
  return products.filter((product) => {
    if (seen.has(product.id)) return false;
    seen.add(product.id);
    return true;
  });
}

function getActivePrice(component: Component) {
  const hasDiscount =
    component.discountedPriceCents !== null &&
    component.discountedPriceCents !== undefined &&
    component.discountedPriceCents < component.unitPriceCents;

  return {
    hasDiscount,
    activePrice: hasDiscount ? component.discountedPriceCents! : component.unitPriceCents,
  };
}

function SuggestionCard({ component }: { component: Component }) {
  const addItem = useCartStore((state) => state.addItem);
  const isOutOfStock = component.stockQuantity === 0;
  const { hasDiscount, activePrice } = getActivePrice(component);

  function handleAddToCart(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    if (isOutOfStock) {
      toast.error("Out of stock");
      return;
    }

    addItem(component, 1);
    toast.success("Added to cart", { description: component.name });
  }

  return (
    <article className="group relative">
      <Link href={`/components/${component.slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden rounded-xl border border-zinc-200 bg-white">
          <ProductImage
            src={component.imageUrl}
            alt={component.name}
            className="h-full w-full"
            imageClassName="object-contain p-5 transition-transform duration-500 group-hover:scale-[1.04]"
          />
        </div>

        <div className="pt-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-400">
            {component.subcategory || component.category}
          </p>
          <h3 className="mt-1 line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-zinc-900 transition-colors group-hover:text-[var(--brand-primary)]">
            {component.name}
          </h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            {hasDiscount && (
              <span className="text-sm font-medium text-zinc-400 line-through">
                {formatPrice(component.unitPriceCents)}
              </span>
            )}
            <span className="text-base font-bold text-zinc-950">
              {formatPrice(activePrice)}
            </span>
          </div>
        </div>
      </Link>

      <button
        type="button"
        onClick={handleAddToCart}
        disabled={isOutOfStock}
        aria-label={isOutOfStock ? "Out of stock" : "Add to cart"}
        className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-zinc-950 text-white opacity-0 shadow-lg transition-all duration-200 hover:bg-[var(--brand-primary)] disabled:cursor-not-allowed disabled:bg-zinc-300 group-hover:opacity-100"
      >
        <ShoppingCart className="h-4 w-4" />
      </button>
    </article>
  );
}

function SuggestionSkeleton() {
  return (
    <div>
      <div className="aspect-[4/5] animate-pulse rounded-xl border border-zinc-200 bg-zinc-100" />
      <div className="space-y-2 pt-3">
        <div className="h-3 w-20 animate-pulse rounded-full bg-zinc-100" />
        <div className="h-4 w-full animate-pulse rounded bg-zinc-100" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-zinc-100" />
        <div className="h-5 w-24 animate-pulse rounded bg-zinc-100" />
      </div>
    </div>
  );
}

export function SuggestionForYouSection() {
  const cartItems = useCartStore((state) => state.items);
  const wishlistItems = useWishlistStore((state) => state.items);
  const [recentlyViewed] = useState<Component[]>(() => {
    if (typeof window === "undefined") return [];

    try {
      const stored = window.localStorage.getItem(RECENTLY_VIEWED_KEY);
      const parsed = stored ? (JSON.parse(stored) as Component[]) : [];
      return Array.isArray(parsed) ? parsed.slice(0, 6) : [];
    } catch {
      return [];
    }
  });

  const interactionProducts = useMemo(
    () => uniqueProducts([
      ...cartItems.map((item) => item.component),
      ...wishlistItems,
      ...recentlyViewed,
    ]),
    [cartItems, recentlyViewed, wishlistItems],
  );
  const interestCategory = interactionProducts[0]?.category;

  const { data, isLoading } = useQuery({
    queryKey: ["suggestion-for-you", interestCategory || "popular"],
    queryFn: () =>
      interestCategory
        ? componentApi.getComponents({ category: interestCategory, limit: 6, sortBy: "name" })
        : componentApi.getComponents({ isBestSeller: true, limit: 6, sortBy: "name" }),
    staleTime: 5 * 60 * 1000,
  });

  const components = useMemo(() => {
    const apiProducts = data?.components ?? [];
    const selected = interestCategory
      ? uniqueProducts([...apiProducts, ...interactionProducts])
      : apiProducts;

    return uniqueProducts([...selected, ...POPULAR_FALLBACK]).slice(0, 4);
  }, [data?.components, interactionProducts, interestCategory]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:py-16 border-0 border-zinc-200 border-t rounded-t-4xl">
      <div className="mx-auto mb-12 max-w-2xl text-center sm:mb-14">
        <span className="inline-flex rounded-full bg-brand-primary px-8 py-3 text-sm font-light uppercase tracking-[0.22em] text-brand-secondary-3">
          Suggestion for you
        </span>
        <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
          {interestCategory ? `More from ${interestCategory}` : "Popular picks to get started"}
        </h2>
      </div>

      <motion.div
        className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-6"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        variants={gridVariants}
      >
        {isLoading
          ? Array.from({ length: 4 }).map((_, index) => <SuggestionSkeleton key={index} />)
          : components.map((component) => (
              <motion.div key={component.id} variants={cardVariants}>
                <SuggestionCard component={component} />
              </motion.div>
            ))}
      </motion.div>

      {/* <div className="mt-10 flex justify-center">
        <Link
          href={interestCategory ? `/components?category=${encodeURIComponent(interestCategory)}` : "/components?isBestSeller=true"}
          className="inline-flex items-center gap-2 rounded-full bg-zinc-950 px-6 py-3 text-sm font-black text-white transition hover:bg-[var(--brand-primary)] hover:shadow-lg"
        >
          Explore Suggestions
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div> */}
    </section>
  );
}
