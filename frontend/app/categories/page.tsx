import type { Metadata } from "next";
import { CategoriesPage } from "@/features/categories";

export const metadata: Metadata = {
  title: "Shop by Category – Robotics, Sensors, Motors & More",
  description:
    "Browse all electronics and robotics categories at RoboRoot — sensors, microcontrollers, motors, power supplies, drones, PCB tools, and STEM kits. Find exactly what you need.",
  alternates: {
    canonical: "https://roboroot.in/categories",
  },
  openGraph: {
    title: "Shop by Category – Robotics, Sensors, Motors & More | RoboRoot",
    description:
      "Browse all electronics and robotics categories at RoboRoot — sensors, microcontrollers, motors, power supplies, drones, PCB tools, and STEM kits.",
    url: "https://roboroot.in/categories",
  },
};

export default function Page() {
  return <CategoriesPage />;
}
