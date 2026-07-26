"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdmin } from "@/core/context/AdminContext";
import { emptyProjectForm } from "@/config/forms";
import type { ProjectForm } from "@/types";
import { createProject, buildProjectBody } from "@/api/projects";
import { ProjectFormPanel } from "@/components/admin/sections/ProjectFormPanel";

export default function NewProjectPage() {
  const router = useRouter();
  const { token, setStatus, setIsLoading, isLoading } = useAdmin();
  const [projectForm, setProjectForm] = useState<ProjectForm>(emptyProjectForm);

  async function handleSaveProject(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return setStatus("Not authenticated.");
    
    setIsLoading(true);
    try {
      const body = buildProjectBody(projectForm);
      await createProject(body, token);
      setStatus(`Created project ${projectForm.title}`);
      router.push("/projects");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed to save project");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto pb-16">
      <button
        onClick={() => router.push("/projects")}
        className="mb-6 inline-flex items-center gap-2 text-xs font-extrabold text-zinc-600 hover:text-[#222222] transition cursor-pointer"
      >
        <span>&larr; Back to Projects Catalog</span>
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
