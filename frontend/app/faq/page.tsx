import type { Metadata } from "next";
import { SiteInfoPage } from "@/features/static-pages/components/SiteInfoPage";
import { staticPages } from "@/features/static-pages/data/static-pages";

export const metadata: Metadata = {
  title: "Frequently Asked Questions – Ordering, Shipping & Returns",
  description:
    "Find answers to common questions about RoboRoot — ordering, shipping timelines, return policy, payment methods, PCB services, and custom build requests.",
  alternates: {
    canonical: "https://roboroot.in/faq",
  },
};

export default function FaqPage() {
  return <SiteInfoPage {...staticPages.faq} />;
}
