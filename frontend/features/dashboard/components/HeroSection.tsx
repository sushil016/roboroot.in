"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { serviceTiles } from "@/features/dashboard/data/homepage";

const TOTAL = serviceTiles.length;
const BG_T = { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] };

const bgVariants = {
  enter: { opacity: 0 },
  center: { scale: 1, opacity: 1, x: 0 },
  exit: { opacity: 0 },
};

const SLIDE_IMAGES = [
  "/homepage/1.jpg", // All Electronics
  "/homepage/2.jpg", // Custom Projects
  "/homepage/3.jpg", // STEM Store
  "/homepage/4.jpg", // Drones & Aero
];

export function HeroSection() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);

  const goTo = useCallback((idx: number, dir: number) => {
    setDirection(dir);
    setCurrent(idx);
  }, []);

  const prev = useCallback(() => goTo((current - 1 + TOTAL) % TOTAL, -1), [current, goTo]);
  const next = useCallback(() => goTo((current + 1) % TOTAL, 1), [current, goTo]);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(next, 4000);
    return () => clearInterval(id);
  }, [paused, next]);

  const slide = serviceTiles[current];

  return (
    <section className="relative z-10 bg-transparent px-4 py-6 sm:px-6">
      <div
        className="group relative mx-auto aspect-[1200/630] w-full max-w-7xl overflow-hidden rounded-3xl"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Linked background image slider */}
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={`bg-${current}`}
            custom={direction}
            variants={bgVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={BG_T}
            className="absolute inset-0"
          >
            <Link
              href={slide.href}
              aria-label={`Open ${slide.title}`}
              className="absolute inset-0 block"
            >
              <Image
                src={SLIDE_IMAGES[current] || SLIDE_IMAGES[0]}
                alt={slide.title}
                fill
                className="object-cover opacity-100"
                sizes="(max-width: 1280px) calc(100vw - 2rem), 1280px"
                priority={current === 0}
              />
            </Link>
          </motion.div>
        </AnimatePresence>

        {/* Dot navigation */}
        <div className="absolute bottom-5 left-6 z-20 flex items-center gap-2 sm:bottom-6 sm:left-8 lg:left-10">
          {serviceTiles.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i, i > current ? 1 : -1)}
              aria-label={`Go to slide ${i + 1}`}
              className={`cursor-pointer rounded-full transition-all duration-300 ${
                i === current
                  ? "h-1.5 w-6 bg-[var(--brand-primary)]"
                  : "h-1.5 w-2 bg-secondary"
              }`}
            />
          ))}
        </div>

        {/* Next / Prev controllers */}
        <div className="absolute bottom-5 right-6 z-20 flex items-center gap-2 opacity-100 transition-opacity duration-200 sm:bottom-auto sm:right-8 sm:top-1/2 sm:-translate-y-1/2 sm:flex-col sm:opacity-0 sm:group-hover:opacity-100">
          <button
            type="button"
            onClick={prev}
            aria-label="Previous slide"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-black/45 text-white transition hover:border-transparent hover:bg-[var(--brand-primary)]"
          >
            <ChevronLeft className="h-4.5 w-4.5" />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Next slide"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-black/45 text-white transition hover:border-transparent hover:bg-[var(--brand-primary)]"
          >
            <ChevronRight className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Slide Counter */}
        <div className="absolute right-6 top-5 z-20 text-[10px] font-bold tabular-nums tracking-wider text-white/45 sm:right-8 sm:top-8">
          {String(current + 1).padStart(2, "0")} / {String(TOTAL).padStart(2, "0")}
        </div>
      </div>
    </section>
  );
}
