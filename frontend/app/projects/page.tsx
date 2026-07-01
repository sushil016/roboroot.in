import type { Metadata } from "next";
import { ProjectsPage } from "@/features/projects";

export const metadata: Metadata = {
  title: "Ready-Made Robotics & Electronics Projects – Buy or Build Custom",
  description:
    "Explore ready-made robotics projects, drone kits, and IoT builds at RoboRoot. Or submit a custom build request — we design and deliver your project end-to-end.",
  alternates: {
    canonical: "https://roboroot.in/projects",
  },
  openGraph: {
    title: "Ready-Made Robotics Projects – Buy or Build Custom | RoboRoot",
    description:
      "Explore ready-made robotics projects, drone kits, and IoT builds. Or submit a custom build request — we design and deliver your project end-to-end.",
    url: "https://roboroot.in/projects",
  },
};

export default function Page() {
  return <ProjectsPage />;
}
