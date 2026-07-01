import type { Metadata } from "next";
import { RobomaniacStorePage } from "@/features/products";

export const metadata: Metadata = {
  title: "Robomaniac Store – STEM Kits, AI Books & BlockSquare Software",
  description:
    "Explore Robomaniac's STEM course kits, LEGO robotics kits, AI handbooks, and BlockSquare software. Designed for students, schools, and makers across India.",
  alternates: {
    canonical: "https://roboroot.in/stem-store",
  },
  openGraph: {
    title: "Robomaniac Store – STEM Kits, AI Books & BlockSquare Software | RoboRoot",
    description:
      "Explore Robomaniac's STEM course kits, LEGO robotics kits, AI handbooks, and BlockSquare software. Designed for students, schools, and makers across India.",
    url: "https://roboroot.in/stem-store",
  },
};

export default function Page() {
  return <RobomaniacStorePage />;
}
