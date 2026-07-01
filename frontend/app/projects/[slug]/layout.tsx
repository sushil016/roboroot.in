import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getProjectMetadataBySlug, getProjectMetadataById } from "@/features/projects/services/project.service";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  let project;

  try {
    project = await getProjectMetadataBySlug(slug);
  } catch {
    try {
      project = await getProjectMetadataById(slug);
    } catch {
      return {
        title: "Project | RoboRoot",
        description: "Robotics and electronics project kits for makers and engineers.",
      };
    }
  }

  const title = project.title ?? "Project";
  const description = project.description ?? `${title} on RoboRoot`;
  const image = project.thumbnailUrl;

  return {
    title: `${title} | RoboRoot`,
    description,
    openGraph: {
      title: `${title} | RoboRoot`,
      description,
      ...(image ? { images: [{ url: image }] } : {}),
    },
  };
}

export default function ProjectDetailLayout({ children }: { children: ReactNode }) {
  return children;
}
