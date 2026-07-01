import type { Metadata } from "next";
import { SiteInfoPage } from "@/features/static-pages/components/SiteInfoPage";
import { staticPages } from "@/features/static-pages/data/static-pages";

export const metadata: Metadata = {
  title: "Contact RoboRoot – Technical Support & Order Enquiries",
  description:
    "Reach out to RoboRoot for technical support, component enquiries, PCB design help, bulk orders, or custom build requests. Our engineering team responds quickly.",
  alternates: {
    canonical: "https://roboroot.in/contact",
  },
};

export default function ContactPage() {
  return <SiteInfoPage {...staticPages.contact} />;
}
