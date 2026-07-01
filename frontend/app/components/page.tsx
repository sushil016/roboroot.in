import type { Metadata } from "next";
import { Suspense } from "react";
import { MarketplacePage } from "@/features/products/components/MarketplacePage";

export const metadata: Metadata = {
  title: "Buy Electronics & Robotics Components Online in India",
  description:
    "Shop 1000+ electronics components — Arduino, Raspberry Pi, sensors, motors, dev boards, ESP32, and more. Best prices. Fast shipping across India.",
  alternates: {
    canonical: "https://roboroot.in/components",
  },
  openGraph: {
    title: "Buy Electronics & Robotics Components Online in India | RoboRoot",
    description:
      "Shop 1000+ electronics components — Arduino, Raspberry Pi, sensors, motors, dev boards, ESP32, and more. Best prices. Fast shipping across India.",
    url: "https://roboroot.in/components",
    type: "website",
  },
};

export default function ComponentsPage() {
  return (
    <Suspense>
      <MarketplacePage />
    </Suspense>
  );
}
