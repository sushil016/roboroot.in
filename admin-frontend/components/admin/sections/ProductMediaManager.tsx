"use client";

/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useRef, useState } from "react";
import { API_BASE_URL } from "@/config/env";

interface ProductMedia {
  id: string;
  type: "IMAGE" | "VIDEO";
  url: string;
  sortOrder: number;
}

const MAX_MEDIA = 10;

export function ProductMediaManager({ productId, token }: { productId: string; token: string }) {
  const [mediaList, setMediaList] = useState<ProductMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [addingVideo, setAddingVideo] = useState(false);
  const [showVideoForm, setShowVideoForm] = useState(false);
  const [reordering, setReordering] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const headers = { Authorization: `Bearer ${token}` };

  const fetchMedia = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/components/${productId}/media`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setMediaList(json.data.sort((a: ProductMedia, b: ProductMedia) => a.sortOrder - b.sortOrder));
      }
    } catch (err: any) {
      console.error("Failed to fetch product media:", err);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => { void fetchMedia(); }, [fetchMedia]);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    const remaining = MAX_MEDIA - mediaList.length;
    const toUpload = files.slice(0, remaining);

    setUploading(true);
    try {
      for (const file of toUpload) {
        const body = new FormData();
        body.append("file", file);
        const res = await fetch(`${API_BASE_URL}/api/components/${productId}/media`, {
          method: "POST",
          headers,
          body,
        });
        const json = await res.json();
        if (!json.success) alert(json.error ?? "Upload failed");
      }
    } catch (err: any) {
      alert("Error uploading images: " + (err.message || "Network error"));
    } finally {
      await fetchMedia();
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleAddVideo() {
    if (!videoUrl.trim()) return;
    setAddingVideo(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/components/${productId}/media/url`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ url: videoUrl.trim(), type: "VIDEO" }),
      });
      const json = await res.json();
      if (json.success) {
        setVideoUrl("");
        setShowVideoForm(false);
        await fetchMedia();
      } else {
        alert(json.error ?? "Failed to add video");
      }
    } catch (err: any) {
      alert("Error adding video: " + (err.message || "Network error"));
    } finally {
      setAddingVideo(false);
    }
  }

  async function handleDelete(mediaId: string) {
    if (!confirm("Are you sure you want to delete this media item?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/components/${productId}/media/${mediaId}`, {
        method: "DELETE",
        headers,
      });
      const json = await res.json();
      if (json.success) {
        setMediaList((prev) => prev.filter((m) => m.id !== mediaId));
      } else {
        alert(json.error ?? "Failed to delete media item.");
      }
    } catch (err: any) {
      alert("Error deleting media item: " + (err.message || "Network error"));
    } finally {
      await fetchMedia();
    }
  }

  // Reorder sequence (Move item left or right)
  async function handleMoveSequence(index: number, direction: "left" | "right") {
    const targetIndex = direction === "left" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= mediaList.length) return;

    const newList = [...mediaList];
    const [movedItem] = newList.splice(index, 1);
    newList.splice(targetIndex, 0, movedItem);

    // Update local sortOrders
    const updatedList = newList.map((item, idx) => ({ ...item, sortOrder: idx }));
    setMediaList(updatedList);

    setReordering(true);
    try {
      const order = updatedList.map((m) => m.id);
      const res = await fetch(`${API_BASE_URL}/api/components/${productId}/media/reorder`, {
        method: "PUT",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ order }),
      });
      const json = await res.json();
      if (!json.success) {
        alert(json.error ?? "Failed to update media sequence.");
        await fetchMedia();
      }
    } catch (err: any) {
      alert("Error updating sequence: " + (err.message || "Network error"));
      await fetchMedia();
    } finally {
      setReordering(false);
    }
  }

  const hasVideo = mediaList.some((m) => m.type === "VIDEO");
  const isFull = mediaList.length >= MAX_MEDIA;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-sm font-black text-[#222222]">Product Media & Sequence</p>
          <p className="text-xs text-zinc-500 font-medium">
            {mediaList.length}/{MAX_MEDIA} media items · Reorder sequence with ← / → arrows
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {!hasVideo && !isFull && (
            <button
              type="button"
              onClick={() => setShowVideoForm((v) => !v)}
              className="h-9 px-3.5 rounded-xl border border-zinc-300 bg-white hover:bg-zinc-50 text-xs font-bold text-zinc-700 transition cursor-pointer"
            >
              + Add Video URL
            </button>
          )}
          {!isFull && (
            <label className="h-9 px-4 rounded-xl bg-[#222222] hover:bg-[#1CA2D1] text-xs font-bold text-white transition flex items-center justify-center cursor-pointer shadow-xs">
              <span>{uploading ? "Uploading..." : "+ Upload Images"}</span>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={handleImageUpload}
                disabled={uploading}
              />
            </label>
          )}
        </div>
      </div>

      {/* Video URL form */}
      {showVideoForm && (
        <div className="flex gap-2 p-3 bg-zinc-50 rounded-2xl border border-zinc-200">
          <input
            type="url"
            placeholder="YouTube or video embed URL..."
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            className="flex-1 h-10 px-3.5 text-xs font-semibold rounded-xl border border-zinc-300 focus:outline-none focus:border-[#1CA2D1] bg-white"
          />
          <button
            type="button"
            onClick={handleAddVideo}
            disabled={addingVideo || !videoUrl.trim()}
            className="h-10 px-4 rounded-xl bg-[#222222] hover:bg-[#1CA2D1] text-xs font-bold text-white transition disabled:opacity-50 cursor-pointer"
          >
            {addingVideo ? "Adding..." : "Add Video"}
          </button>
          <button
            type="button"
            onClick={() => setShowVideoForm(false)}
            className="h-10 px-3.5 rounded-xl border border-zinc-300 bg-white text-xs font-bold text-zinc-600 hover:bg-zinc-100 transition cursor-pointer"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Media grid with delete & reorder sequence */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-square animate-pulse rounded-2xl bg-zinc-100" />
          ))}
        </div>
      ) : mediaList.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 py-10 text-xs text-zinc-500 font-medium">
          No product media added yet. Upload images or add a video link above.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {mediaList.map((m, idx) => (
            <div
              key={m.id}
              className={`group relative aspect-square overflow-hidden rounded-2xl border transition-all shadow-xs ${
                idx === 0 ? "border-[#1CA2D1] ring-2 ring-[#1CA2D1]/20 bg-cyan-50/20" : "border-zinc-200 bg-zinc-50"
              }`}
            >
              {m.type === "VIDEO" ? (
                <div className="flex h-full flex-col items-center justify-center gap-1 bg-zinc-900 text-white p-3 text-center">
                  <span className="text-3xl text-rose-500">▶</span>
                  <span className="max-w-full truncate text-[10px] text-zinc-400 font-mono">{m.url}</span>
                  <span className="text-[9px] font-extrabold uppercase text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded-full mt-1">
                    VIDEO
                  </span>
                </div>
              ) : (
                <img src={m.url} alt={`Media #${idx + 1}`} className="h-full w-full object-cover" />
              )}

              {/* Sequence Order Badge */}
              <span className="absolute top-2 left-2 bg-black/75 backdrop-blur-xs text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
                {idx === 0 ? "MAIN #1" : `#${idx + 1}`}
              </span>

              {/* DELETE BUTTON */}
              <button
                type="button"
                onClick={() => handleDelete(m.id)}
                className="absolute top-2 right-2 bg-rose-600 hover:bg-rose-700 text-white size-7 rounded-full flex items-center justify-center text-xs font-black shadow-xs transition cursor-pointer z-10"
                title="Delete media"
              >
                ✕
              </button>

              {/* REORDER SEQUENCE BUTTONS (MOVE LEFT / MOVE RIGHT) */}
              <div className="absolute bottom-2 inset-x-2 flex items-center justify-between opacity-90 group-hover:opacity-100 transition">
                <button
                  type="button"
                  onClick={() => handleMoveSequence(idx, "left")}
                  disabled={idx === 0 || reordering}
                  className="h-7 px-2.5 bg-black/80 hover:bg-black text-white rounded-lg text-xs font-black backdrop-blur-xs disabled:opacity-30 cursor-pointer shadow-xs flex items-center justify-center"
                  title="Move Left (Earlier in gallery)"
                >
                  ←
                </button>

                <button
                  type="button"
                  onClick={() => handleMoveSequence(idx, "right")}
                  disabled={idx === mediaList.length - 1 || reordering}
                  className="h-7 px-2.5 bg-black/80 hover:bg-black text-white rounded-lg text-xs font-black backdrop-blur-xs disabled:opacity-30 cursor-pointer shadow-xs flex items-center justify-center"
                  title="Move Right (Later in gallery)"
                >
                  →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
