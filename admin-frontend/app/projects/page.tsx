"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdmin } from "@/core/context/AdminContext";
import { ProjectsView } from "@/components/admin/sections/ProjectsView";
import type { Project } from "@/types";
import { fetchProjects, deleteProjectById } from "@/api/projects";

export default function ProjectsPage() {
  const router = useRouter();
  const { token, setStatus, setIsLoading } = useAdmin();
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    async function loadProjects() {
      setIsLoading(true);
      try {
        const projectList = await fetchProjects(token || undefined);
        setProjects(projectList);
        setStatus("Projects loaded");
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Failed to load projects");
      } finally {
        setIsLoading(false);
      }
    }
    if (token !== undefined) {
      void loadProjects();
    }
  }, [token, setStatus, setIsLoading]);

  async function handleDeleteProject(project: Project) {
    if (!token) { setStatus("Not authenticated."); return; }
    if (!window.confirm(`Delete project "${project.title}"?`)) return;
    setIsLoading(true);
    try {
      await deleteProjectById(project.id, token);
      setStatus(`Deleted project ${project.title}`);
      setProjects((prev) => prev.filter((p) => p.id !== project.id));
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed to delete project");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <ProjectsView
      projects={projects}
      onNew={() => router.push("/projects/new")}
      onSelectProject={(project) => router.push(`/projects/${project.id}`)}
      onDeleteProject={handleDeleteProject}
    />
  );
}
