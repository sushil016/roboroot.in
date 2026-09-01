import type { Metadata } from "next";
import { PrintOrdersPage } from "@/features/three-d-printing";

export const metadata: Metadata = {
  title: "My 3D Print Orders | RoboRoot",
};

export default function Page() {
  return <PrintOrdersPage />;
}
