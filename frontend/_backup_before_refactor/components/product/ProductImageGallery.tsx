"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Package, Play, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProductMedia } from "@/lib/types/marketplace.types";

interface GalleryItem {
  id: string;
  type: "IMAGE" | "VIDEO";
  url: string;
}

interface ProductImageGalleryProps {
  /** Fallback single image URL from the Component record */
  fallbackImageUrl?: string | null;
  /** Media items from the ProductMedia table */
  media?: ProductMedia[];
  productName: string;
}

function isYouTubeUrl(url: string): boolean {
  return /youtu\.be|youtube\.com/.test(url);
}

function youtubeEmbedUrl(url: string): string {
  const match = url.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1` : url;
}

export function ProductImageGallery({
  fallbackImageUrl,
  media = [],
  productName,
}: ProductImageGalleryProps) {
  // Build the canonical gallery list
  const items: GalleryItem[] = media.length > 0
    ? media.map((m) => ({ id: m.id, type: m.type, url: m.url }))
    : fallbackImageUrl
    ? [{ id: "fallback", type: "IMAGE", url: fallbackImageUrl }]
    : [];

  const [activeIdx, setActiveIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [direction, setDirection] = useState<1 | -1>(1);

  const active = items[activeIdx];

  const go = useCallback(
    (delta: 1 | -1) => {
      if (items.length <= 1) return;
      setDirection(delta);
      setActiveIdx((i) => (i + delta + items.length) % items.length);
    },
    [items.length]
  );

  // Keyboard nav
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "Escape") setLightboxOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  // No media at all
  if (items.length === 0) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-2xl border border-[#D2D2D0] bg-[#F2F2F0]">
        <Package className="h-20 w-20 text-zinc-200" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* ── Main viewer ── */}
      <div className="group relative overflow-hidden rounded-2xl border border-[#D2D2D0] bg-white">
        <AnimatePresence mode="popLayout" initial={false} custom={direction}>
          <motion.div
            key={activeIdx}
            custom={direction}
            initial={{ opacity: 0, x: direction * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -40 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="aspect-square w-full"
          >
            {active?.type === "VIDEO" ? (
              isYouTubeUrl(active.url) ? (
                <iframe
                  src={youtubeEmbedUrl(active.url)}
                  title={productName}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  src={active.url}
                  controls
                  className="h-full w-full object-contain bg-black"
                  playsInline
                />
              )
            ) : (
              <img
                src={active?.url}
                alt={`${productName} — image ${activeIdx + 1}`}
                className="h-full w-full object-contain p-6"
                loading="eager"
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Nav arrows — only when >1 item */}
        {items.length > 1 && (
          <>
            <button
              onClick={() => go(-1)}
              className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full border border-[#D2D2D0] bg-white/90 text-zinc-600 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#E8E8E6] hover:text-[#222222]"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => go(1)}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full border border-[#D2D2D0] bg-white/90 text-zinc-600 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#E8E8E6] hover:text-[#222222]"
              aria-label="Next image"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}

        {/* Zoom button for images */}
        {active?.type === "IMAGE" && (
          <button
            onClick={() => setLightboxOpen(true)}
            className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full border border-[#D2D2D0] bg-white/90 text-zinc-500 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#E8E8E6] hover:text-[#222222]"
            aria-label="Zoom image"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
        )}

        {/* Counter pill */}
        {items.length > 1 && (
          <div className="absolute bottom-3 left-3 rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-bold text-white">
            {activeIdx + 1} / {items.length}
          </div>
        )}
      </div>

      {/* ── Thumbnail strip ── */}
      {items.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {items.map((item, i) => (
            <button
              key={item.id}
              onClick={() => {
                setDirection(i > activeIdx ? 1 : -1);
                setActiveIdx(i);
              }}
              className={cn(
                "relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 bg-[#F2F2F0] transition-all duration-150",
                i === activeIdx
                  ? "border-[var(--brand-primary)] shadow-sm"
                  : "border-transparent hover:border-[#D2D2D0]"
              )}
              aria-label={`View ${item.type === "VIDEO" ? "video" : `image ${i + 1}`}`}
            >
              {item.type === "VIDEO" ? (
                <div className="flex h-full w-full items-center justify-center bg-zinc-900">
                  <Play className="h-5 w-5 fill-white text-white" />
                </div>
              ) : (
                <img
                  src={item.url}
                  alt={`Thumbnail ${i + 1}`}
                  className="h-full w-full object-contain p-1"
                  loading="lazy"
                />
              )}
              {/* Active indicator bar */}
              {i === activeIdx && (
                <motion.div
                  layoutId="thumb-active"
                  className="absolute inset-x-0 bottom-0 h-0.5 bg-[var(--brand-primary)]"
                  transition={{ duration: 0.2 }}
                />
              )}
            </button>
          ))}
        </div>
      )}

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {lightboxOpen && active?.type === "IMAGE" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 p-4"
            onClick={() => setLightboxOpen(false)}
          >
            <motion.img
              initial={{ scale: 0.92 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.92 }}
              src={active.url}
              alt={productName}
              className="max-h-[90vh] max-w-[90vw] rounded-2xl object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            {/* Lightbox nav */}
            {items.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); go(-1); }}
                  className="absolute left-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); go(1); }}
                  className="absolute right-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 transition-colors"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-xs font-bold text-white">
              {activeIdx + 1} / {items.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
