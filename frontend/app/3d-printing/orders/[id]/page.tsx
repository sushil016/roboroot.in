import type { Metadata } from "next";
import { PrintOrderDetailPage } from "@/features/three-d-printing";

export const metadata: Metadata = {
  title: "3D Print Order Details | RoboRoot",
};

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PrintOrderDetailPage orderId={id} />;
}
