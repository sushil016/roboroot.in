import type { Metadata } from "next";
import { ThreeDPrintingPage } from "@/features/three-d-printing";

export const metadata: Metadata = {
  title: "Online 3D Printing Service | RoboRoot",
  description:
    "Upload an STL or OBJ model, preview it in 3D, configure material and finish, and get an instant weight-based 3D printing price.",
  alternates: { canonical: "https://roboroot.in/3d-printing" },
};

export default function Page() {
  return <ThreeDPrintingPage />;
}
