import type { Metadata } from "next";
import type { ReactNode } from "react";
import { componentApi } from "@/features/products/services/product.service";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  try {
    const { slug } = await params;
    const component = await componentApi.getComponentBySlug(slug);
    const name = component.name ?? "Component";
    const rawDescription = component.description ? component.description.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ") : "";
    const description = rawDescription || `${name} available at RoboRoot`;
    const image = component.imageUrl;

    return {
      title: `${name}`,
      description,
      alternates: {
        canonical: `https://roboroot.in/components/${slug}`,
      },
      openGraph: {
        title: `${name} | RoboRoot`,
        description,
        ...(image ? { images: [{ url: image, alt: name }] } : {}),
      },
    };
  } catch {
    return {
      title: "Component | RoboRoot",
      description: "Electronics components and robotics kits for makers and engineers.",
    };
  }
}

export default function ComponentDetailLayout({ children }: { children: ReactNode }) {
  return children;
}
