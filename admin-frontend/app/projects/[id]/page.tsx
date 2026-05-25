"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAdmin } from "@/core/context/AdminContext";
import { emptyProjectForm } from "@/config/forms";
import type { ProjectForm } from "@/types";
import { fetchProjectById, updateProjectById, buildProjectBody } from "@/api/projects";
import { ProjectFormPanel } from "@/components/admin/sections/ProjectFormPanel";

export default function EditProjectPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { token, setStatus, setIsLoading, isLoading } = useAdmin();
  const [projectForm, setProjectForm] = useState<ProjectForm>(emptyProjectForm);

  useEffect(() => {
    async function loadProject() {
      if (!id) return;
      setIsLoading(true);
      try {
        const project = await fetchProjectById(id, token || undefined);
        setProjectForm({
          ...emptyProjectForm,
          id: project.id,
          title: project.title,
          summary: project.summary || "",
          description: project.description || project.summary || `${project.title} project details.`,
          category: project.category,
          difficulty: project.difficulty,
          youtubeUrl: project.youtubeUrl || "",
          thumbnailUrl: project.thumbnailUrl || "",
          estimatedCost: project.estimatedCostCents ? String(project.estimatedCostCents / 100) : "",
          estimatedBuildTimeMinutes: project.estimatedBuildTimeMinutes ? String(project.estimatedBuildTimeMinutes) : "",
          tags: project.tags ? project.tags.join(", ") : "",
          preBuiltAvailable: project.preBuiltAvailable || false,
          preBuiltPrice: project.preBuiltPriceCents ? String(project.preBuiltPriceCents / 100) : "",
          preBuiltStock: project.preBuiltStock ? String(project.preBuiltStock) : "",
          isFeatured: project.isFeatured,
          isPublic: project.isPublic,
        });
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Failed to load project");
      } finally {
        setIsLoading(false);
      }
    }
    
    if (token !== undefined) {
      void loadProject();
    }
  }, [id, token, setStatus, setIsLoading]);

  async function handleSaveProject(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return setStatus("Not authenticated.");
    
    setIsLoading(true);
    try {
      const body = buildProjectBody(projectForm);
      await updateProjectById(id, body, token);
      setStatus(`Updated project ${projectForm.title}`);
      router.push("/projects");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed to save project");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={() => router.push("/projects")} className="mb-6 admin-action">
        &larr; Back to Projects
      </button>
      <ProjectFormPanel 
        projectForm={projectForm} 
        isLoading={isLoading} 
        onForm={setProjectForm} 
        onSubmit={handleSaveProject} 
      />
    </div>
  );
}
