"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { componentApi } from "@/features/products/services/product.service";
import { HomeProductCard } from "@/features/dashboard/components/HomeProductCard";
import type { Component } from "@/types/marketplace.types";

const cardVariants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
} satisfies Variants;

const gridVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
} satisfies Variants;

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
    discountedPriceCents: 109900,
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
    discountedPriceCents: 259900,
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

function ProductSkeleton() {
  return (
    <div className="min-h-[420px] rounded-2xl border border-zinc-200 bg-white p-4">
      <div className="aspect-square animate-pulse rounded-xl bg-zinc-100" />
      <div className="space-y-3 px-1 pt-5">
        <div className="h-3 w-20 animate-pulse rounded-full bg-zinc-100" />
        <div className="h-5 w-full animate-pulse rounded bg-zinc-100" />
        <div className="h-5 w-3/4 animate-pulse rounded bg-zinc-100" />
        <div className="flex items-end justify-between pt-10">
          <div className="space-y-2">
            <div className="h-5 w-24 animate-pulse rounded bg-zinc-100" />
            <div className="h-3 w-16 animate-pulse rounded bg-zinc-100" />
          </div>
          <div className="h-11 w-11 animate-pulse rounded-full bg-zinc-100" />
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

  const components =
    data?.components && data.components.length > 0
      ? data.components.slice(0, 4)
      : MOCK_NEW_ARRIVALS;

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:py-16 border-0 border-zinc-200 border-t rounded-t-4xl ">
      <div className="mx-auto mb-12 max-w-2xl text-center sm:mb-14">
        <div>
          <span className="inline-flex rounded-full bg-brand-primary px-8 py-3 text-sm font-light uppercase tracking-[0.22em] text-brand-secondary-3 ">
            NEW ARRIVALS
          </span>
          <h2 className="mt-3 text-2xl font-bold sm:text-3xl">Discover the latest in robotics and electronics</h2> 

        </div>
      </div>

      <motion.div
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        variants={gridVariants}
      >
        {isLoading
          ? Array.from({ length: 4 }).map((_, index) => <ProductSkeleton key={index} />)
          : components.map((component) => (
              <motion.div key={component.id} variants={cardVariants} className="h-full">
                <HomeProductCard component={component} badge="NEW" badgeTone="new" />
              </motion.div>
            ))}
      </motion.div>

      {/* <div className="mt-10 flex justify-center">
        <Link
          href="/components?sortBy=createdAt&sortOrder=desc"
          className="inline-flex items-center gap-2 rounded-2xl border-2 border-brand-primary px-6 py-3 text-sm font-semibold text-[#222222] transition-colors hover-border-0 hover:bg-brand-secondary-2 hover:text-brand-primary">
            Browse New Arrivals
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div> */}
    </section>
  );
}
