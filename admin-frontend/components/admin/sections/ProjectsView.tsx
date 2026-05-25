"use client";

/* eslint-disable @next/next/no-img-element */
import type { Project } from "@/types";

export function ProjectsView({
  projects,
  onNew,
  onSelectProject,
  onDeleteProject,
}: {
  projects: Project[];
  onNew: () => void;
  onSelectProject: (project: Project) => void;
  onDeleteProject: (project: Project) => void;
}) {
  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
         <h1 className="text-2xl font-bold">Projects</h1>
         <button onClick={onNew} className="admin-button admin-button-primary">Add New Project</button>
      </div>
      <div className="admin-card">
        <div className="admin-card-header mb-0 flex-row items-start justify-between">
          <div>
            <p className="admin-eyebrow">All Projects</p>
            <h2 className="admin-card-title">{projects.length} build services</h2>
            <p className="admin-muted">Select a project to edit its storefront display.</p>
          </div>
        </div>
        <div className="flex flex-col gap-4 p-5">
          {projects.map((project) => (
            <div key={project.id} className="flex gap-4 rounded-xl border border-zinc-200 bg-white p-4 transition-colors hover:border-zinc-300 hover:bg-[#F2F2F0]">
              <div className="relative h-24 w-36 shrink-0 overflow-hidden rounded-lg bg-[#222222]">
                {project.thumbnailUrl ? (
                  <img src={project.thumbnailUrl} alt={project.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-3xl font-black text-white/30">
                    {project.youtubeUrl ? "▶" : project.title[0]}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-base font-bold text-[#222222]">{project.title}</p>
                <p className="text-xs font-bold text-zinc-500 mt-0.5">{project.category} · {project.difficulty}</p>
                {project.summary && <p className="text-sm text-zinc-600 mt-1 line-clamp-2">{project.summary}</p>}
                <div className="flex flex-wrap gap-2 mt-3">
                  {project.isFeatured && <span className="admin-pill">Featured</span>}
                  {project.preBuiltAvailable && <span className="admin-pill">Pre-built</span>}
                  {!project.isPublic && <span className="admin-pill">Draft</span>}
                </div>
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                <button
                  onClick={() => onSelectProject(project)}
                  className="admin-action border-[#222222] bg-[#222222] text-white hover:bg-zinc-800"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDeleteProject(project)}
                  className="admin-action"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {projects.length === 0 && (
            <div className="py-12 text-center text-sm font-black text-zinc-400">
              No projects yet. Create your first project using the form.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
