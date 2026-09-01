"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Flame } from "lucide-react";
import { componentApi } from "@/features/products/services/product.service";
import { HomeProductCard } from "@/features/dashboard/components/HomeProductCard";
import type { Component } from "@/types/marketplace.types";

const cardVariants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
} satisfies Variants;

const carouselVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
} satisfies Variants;

const ratingSamples = [
  4.9,
  4.8,
  4.8,
  4.7,
  4.7,
  4.6,
];

const MOCK_BEST_SELLERS: Component[] = [
  {
    id: "mock-bs-1",
    slug: "roboroot-uno-r3-development-board",
    name: "RoboRoot Uno R3 Development Board",
    sku: "DEV-UNO-R3",
    description: "Arduino compatible microcontroller board for prototyping and learning.",
    typicalUseCase: "Main controller for robotics and IoT projects",
    vendorLink: null,
    imageUrl: null,
    brand: "RoboRoot",
    unitPriceCents: 64900,
    discountedPriceCents: 59900,
    stockQuantity: 120,
    category: "Development Boards",
    subcategory: "Arduino compatible",
    productType: "DEVELOPMENT_BOARD",
    isBestSeller: true,
    isRobomaniacItem: false,
    isSoftware: false,
    isActive: true,
    tags: ["uno", "arduino", "dev-board"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "mock-bs-2",
    slug: "hc-sr04-ultrasonic-distance-sensor-module",
    name: "HC-SR04 Ultrasonic Distance Sensor Module",
    sku: "SEN-HCSR04",
    description: "Ultrasonic sensor for non-contact distance measurement.",
    typicalUseCase: "Obstacle detection for mobile robots",
    vendorLink: null,
    imageUrl: null,
    brand: null,
    unitPriceCents: 14900,
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
    id: "mock-bs-3",
    slug: "robotics-starter-course-kit-level-1",
    name: "Robotics Starter Course Kit - Level 1",
    sku: "KIT-ROBO-L1",
    description: "Complete hands-on kit with microcontrollers, motors, and sensors for beginners.",
    typicalUseCase: "School/College robotics labs and courses",
    vendorLink: null,
    imageUrl: null,
    brand: "STEM Store",
    unitPriceCents: 329900,
    discountedPriceCents: 299900,
    stockQuantity: 45,
    category: "STEM Store",
    subcategory: "DIY Kits",
    productType: "COURSE_KIT",
    isBestSeller: true,
    isRobomaniacItem: true,
    isSoftware: false,
    isActive: true,
    tags: ["kit", "robotics", "stem"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "mock-bs-4",
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
    id: "mock-bs-5",
    slug: "esp32-wroom-32-wifi-bluetooth-module",
    name: "ESP32 WROOM-32 WiFi Bluetooth Module",
    sku: "COM-ESP32-WROOM",
    description: "Dual-mode wireless module for IoT telemetry and connected devices.",
    typicalUseCase: "WiFi and Bluetooth robotics control",
    vendorLink: null,
    imageUrl: null,
    brand: "Espressif",
    unitPriceCents: 39900,
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
    id: "mock-bs-6",
    slug: "l298n-dual-h-bridge-motor-driver-module",
    name: "L298N Dual H-Bridge Motor Driver Module",
    sku: "DRV-L298N",
    description: "Reliable dual motor driver board for mobile robots and small automation builds.",
    typicalUseCase: "Driving DC motors from Arduino or ESP32",
    vendorLink: null,
    imageUrl: null,
    brand: null,
    unitPriceCents: 18900,
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

function ProductSkeleton() {
  return (
    <div className="min-h-[410px] w-[82vw] shrink-0 rounded-2xl border border-zinc-200 bg-white p-4 sm:w-[48vw] md:w-[34vw] lg:w-[300px] xl:w-[296px]">
      <div className="aspect-square animate-pulse rounded-xl bg-zinc-100" />
      <div className="space-y-3 px-1 pt-5">
        <div className="h-3 w-20 animate-pulse rounded-full bg-zinc-100" />
        <div className="h-5 w-full animate-pulse rounded bg-zinc-100" />
        <div className="h-5 w-3/4 animate-pulse rounded bg-zinc-100" />
        <div className="h-4 w-28 animate-pulse rounded bg-zinc-100" />
        <div className="flex items-end justify-between pt-7">
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

export function BestSellersSection() {
  const { data, isLoading } = useQuery({
    queryKey: ["best-sellers"],
    queryFn: () => componentApi.getComponents({ isBestSeller: true, limit: 10, sortBy: "name" }),
    staleTime: 5 * 60 * 1000,
  });

  const components =
    data?.components && data.components.length > 0
      ? data.components
      : MOCK_BEST_SELLERS;

  return (
  <section className="mx-auto max-w-7xl px-4 py-14 sm:py-16 border-0 border-zinc-200 border-t rounded-t-4xl ">
      <div className="mx-auto mb-12 max-w-2xl text-center sm:mb-14">
        <div>
          <span className="inline-flex rounded-full bg-brand-primary px-8 py-3 text-sm font-light uppercase tracking-[0.22em] text-brand-secondary-3 ">
            BEST SELLERS
          </span>
          <h2 className="mt-3 text-2xl font-bold sm:text-3xl">Fast-Moving Favorites</h2> 

        </div>
      </div>

      <motion.div
        className="-mx-4 flex snap-x gap-5 overflow-x-auto px-4 pb-4 [scrollbar-width:thin]"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        variants={carouselVariants}
      >
        {isLoading
          ? Array.from({ length: 6 }).map((_, index) => <ProductSkeleton key={index} />)
          : components.map((component, index) => {
              const rating = ratingSamples[index % ratingSamples.length];

              return (
                <motion.div
                  key={component.id}
                  variants={cardVariants}
                  className="w-[82vw] shrink-0 snap-start sm:w-[48vw] md:w-[34vw] lg:w-[300px] xl:w-[296px]"
                >
                  <HomeProductCard
                    component={component}
                    badge={`#${index + 1}`}
                    badgeTone="rank"
                    rating={rating}
                  />
                </motion.div>
              );
            })}
      </motion.div>

      {/* <div className="mt-8 flex justify-center">
        <Link
          href="/components?isBestSeller=true"
          className="inline-flex items-center gap-2 rounded-full bg-zinc-950 px-6 py-3 text-sm font-black text-white transition hover:bg-[var(--brand-primary)] hover:shadow-lg"
        >
          Explore All Best Sellers
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div> */}
    </section>
  );
}
