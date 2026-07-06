"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { serviceTiles } from "@/features/dashboard/data/homepage";
import { SideRays } from "@/components/SideRays";

const descriptions = [
  "Thousands of sensors, microcontrollers, motors, power modules, and components ready to ship for any build.",
  "End-to-end hardware and software builds for students, institutions, and companies — prototype to product.",
  "Robotics course kits, Lego sets, AI books, and BlockSquare educational software for hands-on learning.",
  "Flight controllers, propulsion systems, aero modeling kits, satellite models, and payload prototypes.",
];

const TOTAL = serviceTiles.length;
const BG_T = { duration: 1.0, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] };
const CONTENT_T = { duration: 0.52, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] };

// Background: subtle zoom + slide
const bgVariants = {
  enter: (dir: number) => ({ scale: 1.1, opacity: 0, x: dir > 0 ? 15 : -15 }),
  center: { scale: 1, opacity: 1, x: 0 },
  exit: (dir: number) => ({ scale: 1.05, opacity: 0, x: dir < 0 ? 15 : -15 }),
};

// Content parallax slide
const contentVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 50 : -50, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir < 0 ? 50 : -50, opacity: 0 }),
};

const SLIDE_IMAGES = [
  "/homepage/image-electronic-components.png", // All Electronics
  "/homepage/2.svg",                            // Custom Projects
  "/homepage/components.png",                   // STEM Store
  "/homepage/1.svg",                            // Drones & Aero
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
    <section className="bg-transparent px-4 sm:px-6 py-6 relative z-10">
      <div
        className="mx-auto max-w-7xl relative overflow-hidden bg-zinc-950 rounded-3xl border border-[#D2D2D0] shadow-md group"
        style={{ minHeight: 440 }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Background Images Slider */}
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
            <Image
              src={SLIDE_IMAGES[current] || SLIDE_IMAGES[0]}
              alt={slide.title}
              fill
              className="object-cover opacity-60"
              sizes="(max-w-1280px) 100vw, 1280px"
              priority={current === 0}
            />
          </motion.div>
        </AnimatePresence>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(9,9,11,0.92)_0%,rgba(9,9,11,0.6)_50%,rgba(28,162,209,0.15)_100%)] z-0" />

        {/* Text Content */}
        <div className="relative flex min-h-[440px] flex-col justify-center px-8 py-12 sm:px-12 lg:px-20 z-10">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={`content-${current}`}
              custom={direction}
              variants={contentVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={CONTENT_T}
              className="max-w-2xl space-y-4"
            >
              <div className="inline-flex items-center gap-1.5 rounded bg-[#1CA2D1] px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-white">
                Featured Spotlight
              </div>

              <h1 className="text-3xl font-black leading-[1.1] text-white sm:text-4xl lg:text-5xl">
                {slide.title}
              </h1>

              <p className="max-w-xl text-xs sm:text-sm font-semibold leading-relaxed text-zinc-300">
                {descriptions[current]}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dot navigation */}
        <div className="absolute bottom-6 left-8 flex items-center gap-2 z-20 sm:left-12 lg:left-20">
          {serviceTiles.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i, i > current ? 1 : -1)}
              aria-label={`Go to slide ${i + 1}`}
              className={`rounded-full transition-all duration-300 cursor-pointer ${
                i === current
                  ? "h-1.5 w-6 bg-[#1CA2D1]"
                  : "h-1.5 w-1.5 bg-white/30 hover:bg-white/60"
              }`}
            />
          ))}
        </div>

        {/* Next / Prev controllers */}
        <div className="absolute bottom-5 right-8 flex items-center gap-2 z-20 sm:bottom-auto sm:right-8 sm:top-1/2 sm:-translate-y-1/2 sm:flex-col opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={prev}
            aria-label="Previous slide"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/45 text-white transition hover:bg-[#1CA2D1] hover:border-transparent cursor-pointer"
          >
            <ChevronLeft className="h-4.5 w-4.5" />
          </button>
          <button
            onClick={next}
            aria-label="Next slide"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/45 text-white transition hover:bg-[#1CA2D1] hover:border-transparent cursor-pointer"
          >
            <ChevronRight className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Slide Counter */}
        <div className="absolute right-8 top-8 text-[10px] font-bold tabular-nums text-white/30 tracking-wider">
          {String(current + 1).padStart(2, "0")} / {String(TOTAL).padStart(2, "0")}
        </div>
      </div>
    </section>
  );
}
