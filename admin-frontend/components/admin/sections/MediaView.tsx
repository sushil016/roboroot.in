"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useState, useRef } from "react";
import { useAdmin } from "@/core/context/AdminContext";
import { API_BASE_URL } from "@/config/env";

interface MediaItem {
  id: string;
  url: string;
  filename: string;
  mimeType: string | null;
  sizeBytes: number | null;
  createdAt: string;
}

export function MediaView() {
  const { token, setStatus, setIsLoading, isLoading } = useAdmin();
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load media library items
  async function loadMedia(pageNum: number, search = "") {
    if (!token) return;
    setIsLoading(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/admin/products/media?page=${pageNum}&limit=24`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const json = await res.json();
      if (json.success) {
        if (pageNum === 1) {
          setMediaItems(json.data.items);
        } else {
          setMediaItems((prev) => [...prev, ...json.data.items]);
        }
        setTotalPages(json.data.totalPages);
      } else {
        setStatus(json.error || "Failed to load media");
      }
    } catch (error) {
      setStatus("Error loading media library");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (token) {
      void loadMedia(1, searchQuery);
      setPage(1);
    }
  }, [token]);

  // Handle file uploads
  async function uploadFiles(files: FileList) {
    if (!token || files.length === 0) return;
    setIsLoading(true);
    setStatus(`Uploading ${files.length} images...`);

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("images", files[i]);
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/products/media/bulk-upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const json = await res.json();
      if (json.success) {
        setStatus(json.message || "Images uploaded successfully!");
        // Reload first page
        void loadMedia(1, searchQuery);
        setPage(1);
      } else {
        setStatus(json.error || "Upload failed");
      }
    } catch (error) {
      setStatus("Error uploading images");
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      void uploadFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      void uploadFiles(e.target.files);
    }
  };

  // Copy to clipboard
  const handleCopyUrl = (item: MediaItem) => {
    void navigator.clipboard.writeText(item.url);
    setCopiedId(item.id);
    setStatus(`Copied: ${item.filename}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Delete media item
  const handleDelete = async (item: MediaItem) => {
    if (!token) return;
    if (!window.confirm(`Delete ${item.filename} from the library?`)) return;

    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/products/media/${item.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const json = await res.json();
      if (json.success) {
        setStatus("Image deleted from library");
        setMediaItems((prev) => prev.filter((m) => m.id !== item.id));
      } else {
        setStatus(json.error || "Failed to delete image");
      }
    } catch (error) {
      setStatus("Error deleting image");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredItems = mediaItems.filter((item) =>
    item.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const hasMore = page < totalPages;

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    void loadMedia(nextPage, searchQuery);
  };

  return (
    <section className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Media Library</h1>
        <p className="text-sm text-zinc-500">Upload product images in bulk and copy their URLs for your CSV catalog.</p>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
          dragActive
            ? "border-zinc-800 bg-zinc-50 scale-[0.99]"
            : "border-zinc-200 bg-white hover:border-zinc-300"
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/png,image/jpeg,image/webp"
          multiple
          className="hidden"
        />
        <div className="flex flex-col items-center gap-2">
          <span className="text-3xl">📸</span>
          <p className="text-sm font-bold text-[#222222]">
            Drag & drop your product images here, or{" "}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-zinc-600 underline hover:text-[#222222] font-extrabold cursor-pointer"
            >
              browse files
            </button>
          </p>
          <p className="text-xs text-zinc-400 font-semibold">Supports PNG, JPEG, WebP (up to 7MB each)</p>
        </div>
      </div>

      {/* Search and Library Grid */}
      <div className="admin-card">
        <div className="admin-card-header md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="admin-card-title">All Uploaded Images</h2>
            <p className="admin-muted">Click "Copy URL" and paste it into the "imageUrl" column of your CSV.</p>
          </div>
          <input
            className="admin-input md:w-80"
            placeholder="Search by filename..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {filteredItems.length > 0 ? (
          <div className="p-5 space-y-6">
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="group relative flex flex-col rounded-xl border border-zinc-200 bg-white overflow-hidden transition hover:border-zinc-300 hover:shadow-xs"
                >
                  {/* Image Preview */}
                  <div className="aspect-square bg-zinc-50 p-2 flex items-center justify-center overflow-hidden border-b border-zinc-100">
                    <img
                      src={item.url}
                      alt={item.filename}
                      className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>

                  {/* Info & Copy Action */}
                  <div className="p-2.5 flex-1 flex flex-col justify-between min-w-0 bg-white">
                    <p className="text-xs font-bold text-zinc-700 truncate" title={item.filename}>
                      {item.filename}
                    </p>
                    <div className="mt-2.5 flex items-center gap-1.5">
                      <button
                        onClick={() => handleCopyUrl(item)}
                        className={`flex-1 text-[10px] font-bold py-1.5 px-2 rounded-lg text-center cursor-pointer transition ${
                          copiedId === item.id
                            ? "bg-emerald-600 text-white"
                            : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                        }`}
                      >
                        {copiedId === item.id ? "✓ Copied" : "Copy URL"}
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        className="p-1.5 rounded-lg bg-zinc-50 text-zinc-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                        title="Delete image"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {hasMore && (
              <div className="text-center pt-4 border-t border-zinc-100">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoading}
                  className="admin-button border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50"
                >
                  {isLoading ? "Loading..." : "Load More Images"}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="p-12 text-center text-zinc-400">
            <span className="text-3xl block mb-2">📂</span>
            <p className="text-sm font-bold">No images found in your library.</p>
            <p className="text-xs text-zinc-400 mt-1">Upload some images above to get started!</p>
          </div>
        )}
      </div>
    </section>
  );
}
