"use client";

import type { FormEvent } from "react";
import type { ProjectForm } from "@/types";
import { projectCategories } from "@/config/forms";
import { compactType } from "@/utils";

export function ProjectFormPanel({
  projectForm,
  isLoading,
  onForm,
  onSubmit,
}: {
  projectForm: ProjectForm;
  isLoading: boolean;
  onForm: (value: ProjectForm) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="admin-card p-5">
      <div className="mb-6">
        <p className="admin-eyebrow">Project Details</p>
        <h2 className="admin-card-title">{projectForm.id ? "Edit project" : "Create project"}</h2>
      </div>

      <fieldset className="space-y-3">
        <legend className="mb-2 text-xs font-bold uppercase tracking-wider text-zinc-500">Core Info</legend>
        <input className="admin-input" placeholder="Project title *" value={projectForm.title} onChange={(e) => onForm({ ...projectForm, title: e.target.value })} required />
        <input className="admin-input" placeholder="Short summary" value={projectForm.summary} onChange={(e) => onForm({ ...projectForm, summary: e.target.value })} />
        <textarea className="admin-textarea" placeholder="Full description *" value={projectForm.description} onChange={(e) => onForm({ ...projectForm, description: e.target.value })} required />
      </fieldset>

      <fieldset className="space-y-3 mt-6">
        <legend className="mb-2 text-xs font-bold uppercase tracking-wider text-zinc-500">Classification</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          <select className="admin-input" value={projectForm.category} onChange={(e) => onForm({ ...projectForm, category: e.target.value })}>
            {projectCategories.map((cat) => <option key={cat} value={cat}>{compactType(cat)}</option>)}
          </select>
          <select className="admin-input" value={projectForm.difficulty} onChange={(e) => onForm({ ...projectForm, difficulty: e.target.value })}>
            {["BEGINNER", "INTERMEDIATE", "ADVANCED"].map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <input className="admin-input" placeholder="Tags, comma separated (e.g. arduino, sensor, IoT)" value={projectForm.tags} onChange={(e) => onForm({ ...projectForm, tags: e.target.value })} />
      </fieldset>

      <fieldset className="space-y-3 mt-6">
        <legend className="mb-2 text-xs font-bold uppercase tracking-wider text-zinc-500">Media</legend>
        <input className="admin-input" placeholder="Thumbnail image URL" value={projectForm.thumbnailUrl} onChange={(e) => onForm({ ...projectForm, thumbnailUrl: e.target.value })} />
        <input className="admin-input" placeholder="YouTube URL (project video)" value={projectForm.youtubeUrl} onChange={(e) => onForm({ ...projectForm, youtubeUrl: e.target.value })} />
        <input className="admin-input" placeholder="Additional image URLs, comma separated" value={projectForm.imageUrls} onChange={(e) => onForm({ ...projectForm, imageUrls: e.target.value })} />
        <input className="admin-input" placeholder="PDF/resource URLs, comma separated (optional)" value={projectForm.pdfUrls} onChange={(e) => onForm({ ...projectForm, pdfUrls: e.target.value })} />
      </fieldset>

      <fieldset className="space-y-3 mt-6">
        <legend className="mb-2 text-xs font-bold uppercase tracking-wider text-zinc-500">Estimates</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          <input className="admin-input" type="number" min="0" step="0.01" placeholder="Estimated cost (INR)" value={projectForm.estimatedCost} onChange={(e) => onForm({ ...projectForm, estimatedCost: e.target.value })} />
          <input className="admin-input" type="number" min="0" placeholder="Build time (minutes)" value={projectForm.estimatedBuildTimeMinutes} onChange={(e) => onForm({ ...projectForm, estimatedBuildTimeMinutes: e.target.value })} />
        </div>
      </fieldset>

      <fieldset className="space-y-3 mt-6">
        <legend className="mb-2 text-xs font-bold uppercase tracking-wider text-zinc-500">Learning Content</legend>
        <textarea className="admin-textarea" placeholder="Learning outcomes (one per line)" value={projectForm.learningOutcomes} onChange={(e) => onForm({ ...projectForm, learningOutcomes: e.target.value })} />
        <textarea className="admin-textarea" placeholder="Prerequisites (one per line)" value={projectForm.prerequisites} onChange={(e) => onForm({ ...projectForm, prerequisites: e.target.value })} />
      </fieldset>

      <fieldset className="space-y-3 mt-6">
        <legend className="mb-2 text-xs font-bold uppercase tracking-wider text-zinc-500">Pre-Built Kit</legend>
        <label className="admin-checkbox-row cursor-pointer">
          <input type="checkbox" checked={projectForm.preBuiltAvailable} onChange={(e) => onForm({ ...projectForm, preBuiltAvailable: e.target.checked })} />
          Pre-built kit available for purchase
        </label>
        {projectForm.preBuiltAvailable && (
          <div className="grid gap-3 sm:grid-cols-2">
            <input className="admin-input" type="number" min="0" step="0.01" placeholder="Pre-built price (INR)" value={projectForm.preBuiltPrice} onChange={(e) => onForm({ ...projectForm, preBuiltPrice: e.target.value })} />
            <input className="admin-input" type="number" min="0" placeholder="Stock quantity" value={projectForm.preBuiltStock} onChange={(e) => onForm({ ...projectForm, preBuiltStock: e.target.value })} />
          </div>
        )}
      </fieldset>

      <div className="grid gap-2 sm:grid-cols-2 mt-6 mb-6">
        <label className="admin-checkbox-row cursor-pointer">
          <input type="checkbox" checked={projectForm.isFeatured} onChange={(e) => onForm({ ...projectForm, isFeatured: e.target.checked })} />
          Featured on homepage
        </label>
        <label className="admin-checkbox-row cursor-pointer">
          <input type="checkbox" checked={projectForm.isPublic} onChange={(e) => onForm({ ...projectForm, isPublic: e.target.checked })} />
          Public (visible to all)
        </label>
      </div>

      <button className="admin-button admin-button-primary w-full" disabled={isLoading}>
        {projectForm.id ? "Update Project" : "Create Project"}
      </button>
    </form>
  );
}
