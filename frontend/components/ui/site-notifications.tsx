"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Truck, Package, IndianRupee, Bell, Star, Zap } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface Notification {
  id: number;
  icon: React.ElementType;
  title: string;
  description: string;
  variant?: "default" | "destructive";
  delay: number;
}

const NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    icon: Truck,
    title: "Free Shipping",
    description: "Get free delivery on all orders above ₹499 across India.",
    variant: "default",
    delay: 1200,
  },
  {
    id: 2,
    icon: Package,
    title: "New Arrivals",
    description: "ESP32-S3 boards and HC-SR04 ultrasonic sensors now in stock.",
    variant: "default",
    delay: 2600,
  },
  {
    id: 3,
    icon: IndianRupee,
    title: "COD Available",
    description: "Cash on Delivery available on all orders, pan India.",
    variant: "default",
    delay: 4000,
  },
];

const AUTO_DISMISS_MS = 5000;

export function SiteNotifications() {
  return null;
}
