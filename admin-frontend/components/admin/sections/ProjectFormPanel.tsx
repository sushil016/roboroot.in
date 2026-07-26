"use client";

/* eslint-disable @next/next/no-img-element */

import { useState, useRef, type FormEvent } from "react";
import type { ProjectForm } from "@/types";
import { projectCategories } from "@/config/forms";
import { compactType } from "@/utils";
import { useAdmin } from "@/core/context/AdminContext";
import { API_BASE_URL } from "@/config/env";
import { RichTextEditor } from "../RichTextEditor";

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
  const { token } = useAdmin();
  const [uploading, setUploading] = useState(false);
  const [customImageUrl, setCustomImageUrl] = useState("");
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const descriptionTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Parse image URLs string into array
  const imageList = projectForm.imageUrls
    ? projectForm.imageUrls.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  // Update image list helper
  const updateImageList = (newImages: string[]) => {
    const joined = newImages.join(", ");
    let newThumbnail = projectForm.thumbnailUrl;
    if (!newThumbnail && newImages.length > 0) {
      newThumbnail = newImages[0];
    }
    onForm({
      ...projectForm,
      imageUrls: joined,
      thumbnailUrl: newThumbnail,
    });
  };

  // Handle file uploads to server
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    if (!token) {
      alert("Authentication token missing. Please log in.");
      return;
    }

    setUploading(true);
    const newlyUploadedUrls: string[] = [];

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch(`${API_BASE_URL}/api/components/upload/image`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        const json = await res.json();
        if (json.success && json.data?.url) {
          newlyUploadedUrls.push(json.data.url);
        } else {
          alert(`Failed to upload ${file.name}: ${json.error || "Upload error"}`);
        }
      }

      if (newlyUploadedUrls.length > 0) {
        updateImageList([...imageList, ...newlyUploadedUrls]);
      }
    } catch (err: any) {
      alert("Error uploading image: " + (err.message || "Network error"));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Add custom URL manually
  const handleAddCustomUrl = () => {
    if (!customImageUrl.trim()) return;
    const url = customImageUrl.trim();
    if (!imageList.includes(url)) {
      updateImageList([...imageList, url]);
    }
    setCustomImageUrl("");
  };

  // Remove image by index
  const handleRemoveImage = (index: number) => {
    const targetUrl = imageList[index];
    const updated = imageList.filter((_, i) => i !== index);
    let newThumbnail = projectForm.thumbnailUrl;
    if (newThumbnail === targetUrl) {
      newThumbnail = updated[0] || "";
    }
    onForm({
      ...projectForm,
      imageUrls: updated.join(", "),
      thumbnailUrl: newThumbnail,
    });
  };

  // Set image as main thumbnail
  const handleSetMainThumbnail = (url: string) => {
    onForm({
      ...projectForm,
      thumbnailUrl: url,
    });
  };

  // Extract YouTube ID for preview
  const getYouTubeVideoId = (url: string) => {
    if (!url) return null;
    if (url.includes("youtube.com/watch")) {
      try {
        return new URL(url).searchParams.get("v");
      } catch {
        return null;
      }
    } else if (url.includes("youtu.be/")) {
      return url.split("youtu.be/")[1]?.split("?")[0] || null;
    }
    return null;
  };

  const youtubeVideoId = getYouTubeVideoId(projectForm.youtubeUrl);

  // Markdown Formatting Helper
  const insertFormatting = (prefix: string, suffix: string = "", defaultPlaceholder: string = "text") => {
    const textarea = descriptionTextareaRef.current;
    const currentValue = projectForm.description || "";

    if (!textarea) {
      onForm({ ...projectForm, description: currentValue + `${prefix}${defaultPlaceholder}${suffix}` });
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = currentValue.substring(start, end) || defaultPlaceholder;
    const replacement = `${prefix}${selectedText}${suffix}`;

    const newValue = currentValue.substring(0, start) + replacement + currentValue.substring(end);
    onForm({ ...projectForm, description: newValue });

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
    }, 0);
  };

  // Simple Markdown renderer for Live Preview
  const renderMarkdownPreview = (text: string) => {
    if (!text) return <p className="text-zinc-400 italic">Nothing to preview yet.</p>;

    const lines = text.split("\n");
    return lines.map((line, idx) => {
      if (line.startsWith("# ")) {
        return <h1 key={idx} className="text-2xl font-black text-[#222222] my-2">{line.replace("# ", "")}</h1>;
      }
      if (line.startsWith("## ")) {
        return <h2 key={idx} className="text-xl font-extrabold text-[#222222] my-2">{line.replace("## ", "")}</h2>;
      }
      if (line.startsWith("### ")) {
        return <h3 key={idx} className="text-lg font-bold text-[#222222] my-1.5">{line.replace("### ", "")}</h3>;
      }
      if (line.startsWith("- ")) {
        return <li key={idx} className="ml-4 list-disc text-sm text-zinc-700 font-medium my-0.5">{line.replace("- ", "")}</li>;
      }
      if (line.startsWith("> ")) {
        return <blockquote key={idx} className="border-l-4 border-[#1CA2D1] pl-3 italic text-zinc-600 my-2">{line.replace("> ", "")}</blockquote>;
      }
      if (line.startsWith("```")) {
        return <pre key={idx} className="bg-zinc-900 text-zinc-200 p-3 rounded-lg text-xs font-mono my-2 overflow-x-auto">{line.replace(/```/g, "")}</pre>;
      }

      // Format bold and italics inside paragraph
      let formattedLine = line;
      const hasBold = formattedLine.includes("**");
      const hasItalic = formattedLine.includes("*");

      if (!line.trim()) return <br key={idx} />;

      return (
        <p key={idx} className="text-sm leading-relaxed text-zinc-800 font-medium my-1">
          {formattedLine}
        </p>
      );
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      
      {/* HEADER SECTION CARD */}
      <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 text-xs font-black uppercase text-[#1CA2D1] tracking-wider mb-2">
            <span>Project Workspace</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#222222]">
            {projectForm.id ? `Edit: ${projectForm.title || "Untitled Project"}` : "Create New Project"}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 font-semibold mt-1">
            Build and publish DIY kits, hardware tutorials, and STEM projects.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="h-8 px-3 rounded-full bg-zinc-100 border border-zinc-200 text-xs font-bold text-zinc-700 inline-flex items-center">
            {compactType(projectForm.category)}
          </span>
          <span className="h-8 px-3 rounded-full bg-cyan-50 border border-cyan-200 text-xs font-bold text-[#1CA2D1] inline-flex items-center">
            {projectForm.difficulty}
          </span>
          {projectForm.isFeatured && (
            <span className="h-8 px-3 rounded-full bg-amber-50 border border-amber-200 text-xs font-bold text-amber-600 inline-flex items-center">
              ★ Featured
            </span>
          )}
        </div>
      </div>

      {/* CORE INFO CARD */}
      <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
        <div className="border-b border-zinc-100 pb-3">
          <h2 className="text-lg font-extrabold text-[#222222]">Core Details & Classification</h2>
          <p className="text-xs text-zinc-500 font-medium">Basic information displayed on project listing cards</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-zinc-500 mb-1.5 block">Project Title *</label>
            <input
              className="w-full h-11 px-4 text-sm font-semibold rounded-xl border border-zinc-300 focus:outline-none focus:border-[#1CA2D1] bg-zinc-50 focus:bg-white transition"
              placeholder="e.g. Smart IoT Plant Monitoring System with ESP32"
              value={projectForm.title}
              onChange={(e) => onForm({ ...projectForm, title: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-500 mb-1.5 block">Short Summary (Card Teaser)</label>
            <input
              className="w-full h-11 px-4 text-sm font-semibold rounded-xl border border-zinc-300 focus:outline-none focus:border-[#1CA2D1] bg-zinc-50 focus:bg-white transition"
              placeholder="Brief 1-line overview of what this project builds..."
              value={projectForm.summary}
              onChange={(e) => onForm({ ...projectForm, summary: e.target.value })}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-bold text-zinc-500 mb-1.5 block">Category *</label>
              <select
                className="w-full h-11 px-3.5 text-sm font-semibold rounded-xl border border-zinc-300 focus:outline-none focus:border-[#1CA2D1] bg-zinc-50 focus:bg-white transition cursor-pointer"
                value={projectForm.category}
                onChange={(e) => onForm({ ...projectForm, category: e.target.value })}
              >
                {projectCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {compactType(cat)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-500 mb-1.5 block">Difficulty Level *</label>
              <select
                className="w-full h-11 px-3.5 text-sm font-semibold rounded-xl border border-zinc-300 focus:outline-none focus:border-[#1CA2D1] bg-zinc-50 focus:bg-white transition cursor-pointer"
                value={projectForm.difficulty}
                onChange={(e) => onForm({ ...projectForm, difficulty: e.target.value })}
              >
                {["BEGINNER", "INTERMEDIATE", "ADVANCED"].map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-500 mb-1.5 block">Tags (comma separated)</label>
            <input
              className="w-full h-11 px-4 text-sm font-semibold rounded-xl border border-zinc-300 focus:outline-none focus:border-[#1CA2D1] bg-zinc-50 focus:bg-white transition"
              placeholder="e.g. esp32, iot, sensors, wifi, arduino, beginner"
              value={projectForm.tags}
              onChange={(e) => onForm({ ...projectForm, tags: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* RICH TEXT DESCRIPTION EDITOR WITH WYSIWYG CONTROLS */}
      <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
        <div className="border-b border-zinc-100 pb-3">
          <h2 className="text-lg font-extrabold text-[#222222]">Full Project Description & Content *</h2>
          <p className="text-xs text-zinc-500 font-medium">Use text controls to format headings, bold, italics, lists, and line alignment</p>
        </div>

        <RichTextEditor
          value={projectForm.description}
          onChange={(val) => onForm({ ...projectForm, description: val })}
          placeholder="Write comprehensive project description, specifications, and tutorial instructions..."
          minHeight="240px"
        />
      </div>

      {/* PROJECT MEDIA MANAGER (MULTIPLE IMAGES + 1 VIDEO) */}
      <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-zinc-100 pb-3">
          <div>
            <h2 className="text-lg font-extrabold text-[#222222]">Project Media Gallery</h2>
            <p className="text-xs text-zinc-500 font-medium">Upload multiple high-res photos & 1 YouTube video link</p>
          </div>

          <label className="h-10 px-4 rounded-xl bg-[#222222] hover:bg-[#1CA2D1] text-xs font-bold text-white transition flex items-center justify-center gap-2 cursor-pointer shadow-xs">
            <span>{uploading ? "Uploading Images..." : "+ Upload Image Files"}</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              className="hidden"
              onChange={handleFileUpload}
              disabled={uploading}
            />
          </label>
        </div>

        {/* Custom URL Adder */}
        <div className="flex gap-2">
          <input
            type="url"
            placeholder="Or paste external image URL..."
            value={customImageUrl}
            onChange={(e) => setCustomImageUrl(e.target.value)}
            className="flex-1 h-10 px-3.5 text-xs font-semibold rounded-xl border border-zinc-300 focus:outline-none focus:border-[#1CA2D1] bg-zinc-50 focus:bg-white"
          />
          <button
            type="button"
            onClick={handleAddCustomUrl}
            disabled={!customImageUrl.trim()}
            className="h-10 px-4 rounded-xl bg-zinc-800 hover:bg-[#222222] text-xs font-bold text-white transition disabled:opacity-50 cursor-pointer"
          >
            + Add URL
          </button>
        </div>

        {/* Thumbnail URL Field */}
        <div>
          <label className="text-xs font-bold text-zinc-500 mb-1 block">Main Thumbnail Image URL (Front Card)</label>
          <input
            className="w-full h-10 px-3.5 text-xs font-semibold rounded-xl border border-zinc-300 focus:outline-none focus:border-[#1CA2D1] bg-zinc-50 focus:bg-white"
            placeholder="https://..."
            value={projectForm.thumbnailUrl}
            onChange={(e) => onForm({ ...projectForm, thumbnailUrl: e.target.value })}
          />
        </div>

        {/* Gallery Preview Grid */}
        <div>
          <label className="text-xs font-bold text-zinc-500 mb-2 block">
            Gallery Photos ({imageList.length} uploaded)
          </label>
          {imageList.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 py-10 text-xs text-zinc-500">
              No project images added yet. Click "+ Upload Image Files" above to upload photos.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {imageList.map((url, idx) => {
                const isMainThumbnail = projectForm.thumbnailUrl === url;
                return (
                  <div
                    key={idx}
                    className={`group relative aspect-square overflow-hidden rounded-2xl border transition-all shadow-xs ${
                      isMainThumbnail ? "border-[#1CA2D1] ring-2 ring-[#1CA2D1]/20 bg-cyan-50/20" : "border-zinc-200 bg-zinc-50"
                    }`}
                  >
                    <img src={url} alt={`Project media ${idx + 1}`} className="h-full w-full object-cover" />
                    
                    {isMainThumbnail ? (
                      <span className="absolute top-2 left-2 bg-[#1CA2D1] text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-xs">
                        MAIN THUMBNAIL
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSetMainThumbnail(url)}
                        className="absolute top-2 left-2 hidden group-hover:block bg-zinc-900/80 hover:bg-[#222222] text-white text-[9px] font-bold px-2 py-0.5 rounded-full backdrop-blur-xs shadow-xs"
                      >
                        Set Main
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-2 right-2 bg-rose-600 hover:bg-rose-700 text-white size-6 rounded-full flex items-center justify-center text-xs font-black shadow-xs transition"
                      title="Remove photo"
                    >
                      ✕
                    </button>

                    <div className="absolute bottom-0 inset-x-0 bg-black/60 backdrop-blur-xs p-1 text-[9px] text-zinc-300 font-mono truncate px-2">
                      Photo #{idx + 1}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* DEDICATED 1 VIDEO SECTION */}
        <div className="pt-4 border-t border-zinc-100 space-y-3">
          <div>
            <h3 className="text-sm font-extrabold text-[#222222]">Project Video (1 Tutorial / Demo Link)</h3>
            <p className="text-xs text-zinc-500 font-medium">Link a YouTube video for students and makers</p>
          </div>

          <div className="flex gap-2">
            <input
              type="url"
              className="flex-1 h-11 px-4 text-sm font-semibold rounded-xl border border-zinc-300 focus:outline-none focus:border-[#1CA2D1] bg-zinc-50 focus:bg-white"
              placeholder="e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ"
              value={projectForm.youtubeUrl}
              onChange={(e) => onForm({ ...projectForm, youtubeUrl: e.target.value })}
            />
            {projectForm.youtubeUrl && (
              <button
                type="button"
                onClick={() => onForm({ ...projectForm, youtubeUrl: "" })}
                className="h-11 px-4 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition cursor-pointer"
              >
                Clear Video
              </button>
            )}
          </div>

          {youtubeVideoId && (
            <div className="rounded-2xl border border-zinc-200 bg-zinc-900 p-4 text-white flex items-center gap-4 shadow-sm">
              <div className="relative aspect-video w-36 shrink-0 rounded-xl overflow-hidden bg-black border border-zinc-700 flex items-center justify-center">
                <img
                  src={`https://img.youtube.com/vi/${youtubeVideoId}/mqdefault.jpg`}
                  alt="YouTube video thumbnail"
                  className="h-full w-full object-cover opacity-80"
                />
                <div className="absolute size-9 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs font-bold shadow-md">
                  ▶
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-extrabold text-white truncate">YouTube Video Connected</p>
                <p className="text-[11px] text-zinc-400 truncate mt-0.5">{projectForm.youtubeUrl}</p>
                <a
                  href={projectForm.youtubeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-extrabold text-[#1CA2D1] hover:underline inline-flex items-center gap-1 mt-1.5"
                >
                  <span>Preview Video Link</span>
                  <span>↗</span>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* PDF Resources */}
        <div className="pt-3 border-t border-zinc-100 space-y-1.5">
          <label className="text-xs font-bold text-zinc-500">PDF Schematics & Zip Resource URLs (comma separated)</label>
          <input
            className="w-full h-10 px-3.5 text-xs font-semibold rounded-xl border border-zinc-300 focus:outline-none focus:border-[#1CA2D1] bg-zinc-50 focus:bg-white"
            placeholder="e.g. https://domain.com/schematic.pdf, https://domain.com/code.zip"
            value={projectForm.pdfUrls}
            onChange={(e) => onForm({ ...projectForm, pdfUrls: e.target.value })}
          />
        </div>
      </div>

      {/* ESTIMATES & LEARNING OUTCOMES */}
      <div className="grid gap-6 sm:grid-cols-2">
        
        {/* Cost & Build Time */}
        <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
          <div className="border-b border-zinc-100 pb-2">
            <h3 className="text-base font-extrabold text-[#222222]">Cost & Time Estimates</h3>
            <p className="text-xs text-zinc-500 font-medium">Project budget and build duration</p>
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-500 mb-1 block">Estimated Cost (₹ INR)</label>
            <input
              className="w-full h-11 px-4 text-sm font-semibold rounded-xl border border-zinc-300 focus:outline-none focus:border-[#1CA2D1] bg-zinc-50 focus:bg-white"
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g. 1499"
              value={projectForm.estimatedCost}
              onChange={(e) => onForm({ ...projectForm, estimatedCost: e.target.value })}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-500 mb-1 block">Build Time (Minutes)</label>
            <input
              className="w-full h-11 px-4 text-sm font-semibold rounded-xl border border-zinc-300 focus:outline-none focus:border-[#1CA2D1] bg-zinc-50 focus:bg-white"
              type="number"
              min="0"
              placeholder="e.g. 120"
              value={projectForm.estimatedBuildTimeMinutes}
              onChange={(e) => onForm({ ...projectForm, estimatedBuildTimeMinutes: e.target.value })}
            />
          </div>
        </div>

        {/* Pre-Built Assembly Kit */}
        <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
          <div className="border-b border-zinc-100 pb-2">
            <h3 className="text-base font-extrabold text-[#222222]">Pre-Built Assembled Kit</h3>
            <p className="text-xs text-zinc-500 font-medium">Ready-made unit purchase option</p>
          </div>

          <label className="flex items-center gap-3 p-3 rounded-2xl border border-zinc-200 bg-zinc-50 cursor-pointer">
            <input
              type="checkbox"
              className="size-4 rounded text-[#1CA2D1] focus:ring-0"
              checked={projectForm.preBuiltAvailable}
              onChange={(e) => onForm({ ...projectForm, preBuiltAvailable: e.target.checked })}
            />
            <div>
              <p className="text-xs font-extrabold text-[#222222]">Pre-built kit available</p>
              <p className="text-[10px] font-semibold text-zinc-500">Allow customers to buy pre-assembled hardware</p>
            </div>
          </label>

          {projectForm.preBuiltAvailable && (
            <div className="grid gap-3 sm:grid-cols-2 pt-1">
              <div>
                <label className="text-xs font-bold text-zinc-500 mb-1 block">Pre-built Price (₹ INR)</label>
                <input
                  className="w-full h-10 px-3.5 text-xs font-semibold rounded-xl border border-zinc-300 focus:outline-none focus:border-[#1CA2D1] bg-zinc-50 focus:bg-white"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="2499"
                  value={projectForm.preBuiltPrice}
                  onChange={(e) => onForm({ ...projectForm, preBuiltPrice: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-500 mb-1 block">Stock Quantity</label>
                <input
                  className="w-full h-10 px-3.5 text-xs font-semibold rounded-xl border border-zinc-300 focus:outline-none focus:border-[#1CA2D1] bg-zinc-50 focus:bg-white"
                  type="number"
                  min="0"
                  placeholder="10"
                  value={projectForm.preBuiltStock}
                  onChange={(e) => onForm({ ...projectForm, preBuiltStock: e.target.value })}
                />
              </div>
            </div>
          )}
        </div>

      </div>

      {/* LEARNING CONTENT */}
      <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
        <div className="border-b border-zinc-100 pb-2">
          <h3 className="text-lg font-extrabold text-[#222222]">Learning Outcomes & Prerequisites</h3>
          <p className="text-xs text-zinc-500 font-medium">Detailed course bullet points for students</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs font-bold text-zinc-500 mb-1.5 block">Learning Outcomes (one per line)</label>
            <textarea
              className="w-full min-h-[120px] p-3.5 text-xs font-semibold leading-relaxed rounded-2xl border border-zinc-300 focus:outline-none focus:border-[#1CA2D1] bg-zinc-50 focus:bg-white"
              placeholder="Understand I2C protocol&#10;Interface HC-SR04 sensor&#10;Program ESP32 motor driver"
              value={projectForm.learningOutcomes}
              onChange={(e) => onForm({ ...projectForm, learningOutcomes: e.target.value })}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-500 mb-1.5 block">Prerequisites (one per line)</label>
            <textarea
              className="w-full min-h-[120px] p-3.5 text-xs font-semibold leading-relaxed rounded-2xl border border-zinc-300 focus:outline-none focus:border-[#1CA2D1] bg-zinc-50 focus:bg-white"
              placeholder="Basic C/C++ programming&#10;Breadboard wiring experience"
              value={projectForm.prerequisites}
              onChange={(e) => onForm({ ...projectForm, prerequisites: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* VISIBILITY & STOREFRONT PLACEMENT */}
      <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
        <div className="border-b border-zinc-100 pb-2">
          <h3 className="text-lg font-extrabold text-[#222222]">Storefront Visibility & Placement</h3>
          <p className="text-xs text-zinc-500 font-medium">Control homepage featuring and public access</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex items-center gap-3 p-4 rounded-2xl border border-zinc-200 bg-zinc-50 cursor-pointer hover:border-zinc-300 transition">
            <input
              type="checkbox"
              className="size-4 rounded text-[#1CA2D1] focus:ring-0"
              checked={projectForm.isFeatured}
              onChange={(e) => onForm({ ...projectForm, isFeatured: e.target.checked })}
            />
            <div>
              <p className="text-xs font-extrabold text-[#222222]">Featured on Homepage</p>
              <p className="text-[10px] font-semibold text-zinc-500">Showcase in top featured project banner</p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-4 rounded-2xl border border-zinc-200 bg-zinc-50 cursor-pointer hover:border-zinc-300 transition">
            <input
              type="checkbox"
              className="size-4 rounded text-[#1CA2D1] focus:ring-0"
              checked={projectForm.isPublic}
              onChange={(e) => onForm({ ...projectForm, isPublic: e.target.checked })}
            />
            <div>
              <p className="text-xs font-extrabold text-[#222222]">Publicly Visible</p>
              <p className="text-[10px] font-semibold text-zinc-500">Visible to all visitors on roboroot.in</p>
            </div>
          </label>
        </div>
      </div>

      {/* STICKY BOTTOM ACTION BAR */}
      <div className="sticky bottom-4 z-20 bg-[#222222] text-white border border-zinc-800 rounded-2xl p-4 shadow-2xl flex items-center justify-between gap-4 backdrop-blur-md">
        <div className="min-w-0 hidden sm:block">
          <p className="text-xs font-black truncate">{projectForm.title || "Untitled Project"}</p>
          <p className="text-[10px] text-zinc-400 font-semibold">{projectForm.id ? "Project ID: " + projectForm.id : "Unsaved Draft"}</p>
        </div>

        <button
          type="submit"
          disabled={isLoading || uploading}
          className="h-11 px-8 rounded-xl bg-[#1CA2D1] hover:bg-cyan-500 text-xs font-black text-white transition flex items-center justify-center gap-2 shadow-sm cursor-pointer ml-auto disabled:opacity-50"
        >
          {uploading ? (
            <span>Uploading Media...</span>
          ) : isLoading ? (
            <span>Saving Project...</span>
          ) : (
            <span>{projectForm.id ? "Save & Update Project" : "Publish New Project"}</span>
          )}
        </button>
      </div>

    </form>
  );
}
