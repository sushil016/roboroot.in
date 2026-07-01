import type { Metadata } from "next";
import { PcbPage } from "@/features/pcb";

export const metadata: Metadata = {
  title: "PCB Design & Fabrication Services India – Custom PCB Orders",
  description:
    "Professional PCB design and fabrication services in India. Submit your PCB files for custom manufacturing — fast turnaround, quality guaranteed. Get a free quote today.",
  alternates: {
    canonical: "https://roboroot.in/pcb",
  },
  openGraph: {
    title: "PCB Design & Fabrication Services India | RoboRoot",
    description:
      "Professional PCB design and fabrication services in India. Submit your PCB files for custom manufacturing — fast turnaround, quality guaranteed.",
    url: "https://roboroot.in/pcb",
  },
};

export default function Page() {
  return <PcbPage />;
}
