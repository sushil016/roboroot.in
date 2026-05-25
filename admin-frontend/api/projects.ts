import { apiFetch } from "./client";
import type { Project, ProjectListResponse } from "@/types";
import { tagsToArray } from "@/utils";

export async function fetchProjects(token?: string): Promise<Project[]> {
  const payload = await apiFetch<ProjectListResponse>(
    "/api/projects?limit=100",
    token ? { token } : {},
  );
  return payload.data.projects;
}

export async function createProject(body: Record<string, unknown>, token: string): Promise<void> {
  await apiFetch("/api/projects", { method: "POST", body: JSON.stringify(body), token });
}

export async function updateProjectById(id: string, body: Record<string, unknown>, token: string): Promise<void> {
  await apiFetch(`/api/projects/${id}`, { method: "PUT", body: JSON.stringify(body), token });
}

export async function deleteProjectById(id: string, token: string): Promise<void> {
  await apiFetch(`/api/projects/${id}`, { method: "DELETE", token });
}

export function buildProjectBody(form: {
  title: string;
  summary: string;
  description: string;
  category: string;
  difficulty: string;
  youtubeUrl: string;
  thumbnailUrl: string;
  estimatedCost: string;
  estimatedBuildTimeMinutes: string;
  tags: string;
  learningOutcomes: string;
  prerequisites: string;
  preBuiltAvailable: boolean;
  preBuiltPrice: string;
  preBuiltStock: string;
  imageUrls: string;
  pdfUrls: string;
  isFeatured: boolean;
  isPublic: boolean;
}): Record<string, unknown> {
  return {
    title: form.title,
    summary: form.summary || undefined,
    description: form.description,
    category: form.category,
    difficulty: form.difficulty,
    youtubeUrl: form.youtubeUrl || undefined,
    thumbnailUrl: form.thumbnailUrl || undefined,
    estimatedCostCents: form.estimatedCost ? Math.round(Number(form.estimatedCost) * 100) : undefined,
    estimatedBuildTimeMinutes: form.estimatedBuildTimeMinutes ? Number(form.estimatedBuildTimeMinutes) : undefined,
    tags: form.tags ? tagsToArray(form.tags) : [],
    learningOutcomes: form.learningOutcomes
      ? form.learningOutcomes.split("\n").map((s) => s.trim()).filter(Boolean)
      : undefined,
    prerequisites: form.prerequisites
      ? form.prerequisites.split("\n").map((s) => s.trim()).filter(Boolean)
      : undefined,
    preBuiltAvailable: form.preBuiltAvailable,
    preBuiltPriceCents: form.preBuiltPrice ? Math.round(Number(form.preBuiltPrice) * 100) : undefined,
    preBuiltStock: form.preBuiltStock ? Number(form.preBuiltStock) : undefined,
    imageUrls: form.imageUrls ? form.imageUrls.split(",").map((s) => s.trim()).filter(Boolean) : undefined,
    pdfUrls: form.pdfUrls ? form.pdfUrls.split(",").map((s) => s.trim()).filter(Boolean) : undefined,
    isFeatured: form.isFeatured,
    isPublic: form.isPublic,
  };
}

export async function fetchProjectById(id: string, token?: string): Promise<Project> {
  const payload = await apiFetch<{ data: Project }>(`/api/projects/${id}`, token ? { token } : undefined);
  return payload.data;
}
