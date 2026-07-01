import { redirect } from "next/navigation";
import { ProjectDetailPage } from "@/features/projects";
import { projectApi } from "@/features/projects/services/project.service";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  let project;

  try {
    // 1. Try fetching by slug
    project = await projectApi.getProjectBySlug(slug);
  } catch (error) {
    // 2. Fallback: try fetching by legacy ID
    try {
      project = await projectApi.getProjectById(slug);
      // 3. Issue a permanent redirect to the slug URL
      redirect(`/projects/${project.slug}`);
    } catch {
      // 4. Redirect to index if not found
      redirect("/projects");
    }
  }

  return <ProjectDetailPage />;
}
