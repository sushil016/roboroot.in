import type { Metadata } from "next";
import { AboutContent } from "./AboutContent";

export const metadata: Metadata = {
  title: "About RoboRoot – India's Robotics & Electronics Marketplace",
  description:
    "Learn about RoboRoot — India's premier destination for high-quality electronics components, course kits, PCB fabrication, and custom drone/robot builds. Meet our mission and values.",
  alternates: {
    canonical: "https://roboroot.in/about",
  },
  openGraph: {
    title: "About RoboRoot – India's Robotics & Electronics Marketplace",
    description:
      "Learn about RoboRoot — India's premier destination for high-quality electronics components, course kits, PCB fabrication, and custom drone/robot builds.",
    url: "https://roboroot.in/about",
  },
};

export default function AboutPage() {
  return <AboutContent />;
}
