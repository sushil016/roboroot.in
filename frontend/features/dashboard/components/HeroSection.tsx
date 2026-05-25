"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { serviceTiles } from "@/features/dashboard/data/homepage";
import { homeIcons } from "@/features/dashboard/components/home-icons";
import RoborootServices from "./Services";
import RoborootAiSection from "./Services";

const descriptions = [
  "Thousands of sensors, microcontrollers, motors, power modules, and components ready to ship for any build.",
  "End-to-end hardware and software builds for students, institutions, and companies — prototype to product.",
  "Robotics course kits, Lego sets, AI books, and BlockSquare educational software for hands-on learning.",
  "Flight controllers, propulsion systems, aero modeling kits, satellite models, and payload prototypes.",
];

const ctas = [
  { label: "Browse Categories", href: "/categories" },
  { label: "Explore Projects", href: "/projects" },
  { label: "Visit Store", href: "/robomaniac-store" },
  { label: "Shop Drones & Aero", href: "/components?category=Drones%20%26%20Aerospace" },
];

const TOTAL = serviceTiles.length;
const BG_T = { duration: 1.0, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] };
const CONTENT_T = { duration: 0.52, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] };

// Background: Ken Burns zoom + subtle directional shift → appears to move slower than content
const bgVariants = {
  enter: (dir: number) => ({ scale: 1.14, opacity: 0, x: dir > 0 ? 28 : -28 }),
  center: { scale: 1, opacity: 1, x: 0 },
  exit: (dir: number) => ({ scale: 1.06, opacity: 0, x: dir < 0 ? 28 : -28 }),
};

// Content: slides further and faster than the background → parallax depth
const contentVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir < 0 ? 80 : -80, opacity: 0 }),
};

export function HeroSection() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);
  const router = useRouter();

  const goTo = useCallback((idx: number, dir: number) => {
    setDirection(dir);
    setCurrent(idx);
  }, []);

  const prev = useCallback(() => goTo((current - 1 + TOTAL) % TOTAL, -1), [current, goTo]);
  const next = useCallback(() => goTo((current + 1) % TOTAL, 1), [current, goTo]);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(next, 3000);
    return () => clearInterval(id);
  }, [paused, next]);

  const slide = serviceTiles[current];
  const Icon = homeIcons[slide.icon];

  return (
    <section className="border-b border-[#D8D8C4] bg-background">

      {/* ── Full-width parallax slider ── */}
      <div
        className="relative overflow-hidden bg-zinc-950"
        style={{ minHeight: 580 }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Ken Burns background — scale + subtle x shift → slower than content = parallax */}
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
              src="/homepage/components.png"
              alt={slide.title}
              fill
              className="object-cover opacity-55"
              sizes="100vw"
              priority={current === 0}
            />
          </motion.div>
        </AnimatePresence>

        {/* Fixed gradient overlay — always on top of image, below content */}
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(9,9,11,0.96)_0%,rgba(28,162,209,0.22)_50%,rgba(9,9,11,0.78)_100%)]" />

        {/* Slide content — moves faster than bg = parallax */}
        <div className="relative flex min-h-[580px] flex-col justify-center px-6 py-16 sm:px-10 lg:px-16">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={`content-${current}`}
              custom={direction}
              variants={contentVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={CONTENT_T}
              className="max-w-3xl"
            >
              {/* Service badge */}
              <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 ring-1 ring-white/20">
                <Icon className="h-4 w-4 text-[#1CA2D1]" />
                <span className="text-[10px] font-black uppercase tracking-[0.22em] text-[#1CA2D1]">
                  Service {String(current + 1).padStart(2, "0")} of {String(TOTAL).padStart(2, "0")}
                </span>
              </div>

              <h1 className="text-4xl font-black leading-[1.05] text-white sm:text-5xl lg:text-6xl">
                {slide.title}
              </h1>

              <p className="mt-5 max-w-2xl text-base font-medium leading-7 text-zinc-300 sm:text-lg">
                {descriptions[current]}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                {/* Primary CTA — InteractiveHoverButton with brand-blue override */}
                <div
                  style={
                    {
                      "--background": "#1CA2D1",
                      "--primary": "#ffffff",
                      "--primary-foreground": "#1CA2D1",
                    } as React.CSSProperties
                  }
                >
                  <InteractiveHoverButton
                    className="h-12 border-transparent text-sm font-black text-white"
                    onClick={() => router.push(ctas[current].href)}
                  >
                    {ctas[current].label}
                  </InteractiveHoverButton>
                </div>
                <Link
                  href="/categories"
                  className="inline-flex h-12 items-center justify-center rounded-full border border-white/30 px-8 text-sm font-black text-white transition hover:bg-white/10"
                >
                  All Services
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dot navigation — bottom left, aligned with content padding */}
        <div className="absolute bottom-7 left-6 flex items-center gap-2.5 sm:left-10 lg:left-16">
          {serviceTiles.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i, i > current ? 1 : -1)}
              aria-label={`Go to slide ${i + 1}`}
              className={`rounded-full transition-all duration-300 ${
                i === current
                  ? "h-[7px] w-9 bg-[#1CA2D1]"
                  : "h-[7px] w-[7px] bg-white/30 hover:bg-white/55"
              }`}
            />
          ))}
        </div>

        {/* Prev / Next arrow buttons — bottom right on mobile, mid-right on desktop */}
        <div className="absolute bottom-5 right-6 flex items-center gap-2 sm:bottom-auto sm:right-8 sm:top-1/2 sm:-translate-y-1/2 sm:flex-col">
          <button
            onClick={prev}
            aria-label="Previous slide"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white transition hover:bg-[#1CA2D1]"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={next}
            aria-label="Next slide"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white transition hover:bg-[#1CA2D1]"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Slide counter — top right */}
        <div className="absolute right-6 top-6 text-[11px] font-bold tabular-nums text-white/40">
          {String(current + 1).padStart(2, "0")} / {String(TOTAL).padStart(2, "0")}
        </div>
      </div>

      {/* ── Service tiles strip ── */}
      <RoborootAiSection />
      
    </section>
  );
}
