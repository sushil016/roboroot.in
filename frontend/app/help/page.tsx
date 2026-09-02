import type { Metadata } from "next";
import { HelpCenterPage } from "@/features/support/components/HelpCenterPage";

export const metadata: Metadata = {
  title: "Help Center",
  description: "Find answers about RoboRoot orders, shipping, returns, products, and troubleshooting, or create a support ticket.",
  alternates: { canonical: "https://roboroot.in/help" },
};

export default function HelpPage() {
  return <HelpCenterPage />;
}
