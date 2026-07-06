"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { MagicCard } from "@/components/ui/magic-card";

// Per-category border gradient colors for MagicCard
const gradientPairs: Record<string, [string, string]> = {
  "Semiconductors":     ["#6366f1", "#818cf8"],
  "Sensors":            ["#06b6d4", "#22d3ee"],
  "Development Boards": ["#1CA2D1", "#38bdf8"],
  "Motors & Actuators": ["#f97316", "#fb923c"],
  "Power & Batteries":  ["#10b981", "#34d399"],
  "Drones & Aerospace": ["#8b5cf6", "#a78bfa"],
  "Robomaniac Store":   ["#f43f5e", "#fb7185"],
  "Tools & Prototyping":["#64748b", "#94a3b8"],
};

// Per-category image section tint
const imageBgColors: Record<string, string> = {
  "Semiconductors":     "#eef2ff",
  "Sensors":            "#ecfeff",
  "Development Boards": "#eff6ff",
  "Motors & Actuators": "#fff7ed",
  "Power & Batteries":  "#f0fdf4",
  "Drones & Aerospace": "#f5f3ff",
  "Robomaniac Store":   "#fff1f2",
  "Tools & Prototyping":"#f8fafc",
};

export interface CategorySubcategory {
  name: string;
  href: string;
  count?: number;
}

export interface CategoryCardProps {
  index: number;
  name: string;
  description?: string;
  href: string;
  subcategories: CategorySubcategory[];
  totalCount?: number;
  productImages?: string[];
}

export function CategoryCard({
  index,
  name,
  description,
  href,
  subcategories,
  totalCount,
  productImages = [],
}: CategoryCardProps) {
  const [gradFrom, gradTo] = gradientPairs[name] ?? ["#1CA2D1", "#38bdf8"];
  const bgColor = imageBgColors[name] ?? "#eff6ff";

  const displayDescription =
    description ??
    (subcategories.length > 0
      ? subcategories.slice(0, 5).map((s) => s.name).join(", ") +
        (subcategories.length > 5 ? " & more." : ".")
      : "Browse all products in this category.");

  const images = productImages.filter(Boolean).slice(0, 3);

  return (
    <motion.div
      className="h-full"
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: (index % 4) * 0.06 }}
    >
      {/*
        Override --color-background so MagicCard's inner "bg-background" fill
        uses our beige (#F2F2F0) instead of the page background (#f2f2f0).
      */}
      <div
        className="h-full rounded-2xl"
        style={{ "--color-background": "#F2F2F0" } as React.CSSProperties}
      >
        <Link href={href} className="block h-full rounded-2xl group">
          <MagicCard
            className={`
              h-full
              [&>div:last-child]:h-full
              [&>div:last-child]:flex
              [&>div:last-child]:flex-col
            `}
            gradientFrom={gradFrom}
            gradientTo={gradTo}
            gradientSize={320}
            gradientColor={`${gradFrom}15`}
            gradientOpacity={1}
          >
            {/* ── Image area — always 200 px tall ── */}
            <div
              className="relative flex items-center justify-center overflow-hidden shrink-0"
              style={{ backgroundColor: bgColor, height: "200px" }}
            >
              {images.length === 0 ? (
                <span
                  className="text-8xl font-black select-none"
                  style={{ color: `${gradFrom}28` }}
                >
                  {name[0]}
                </span>
              ) : images.length === 1 ? (
                <div className="relative h-36 w-36 transition-transform duration-500 group-hover:scale-105">
                  <Image
                    src={images[0]}
                    alt={name}
                    fill
                    className="object-contain drop-shadow-lg"
                    sizes="144px"
                  />
                </div>
              ) : (
                <div className="flex items-end justify-center gap-3 px-4">
                  {images.map((src, i) => {
                    const w = [88, 110, 88];
                    const h = [88, 110, 88];
                    const rot = [-6, 0, 6];
                    const y = [12, 0, 16];
                    return (
                      <div
                        key={i}
                        className="relative shrink-0 transition-transform duration-500 group-hover:scale-105"
                        style={{
                          width: w[i] ?? 88,
                          height: h[i] ?? 88,
                          transform: `rotate(${rot[i] ?? 0}deg) translateY(${y[i] ?? 0}px)`,
                          transitionDelay: `${i * 40}ms`,
                        }}
                      >
                        <Image
                          src={src}
                          alt=""
                          fill
                          className="object-contain drop-shadow-md"
                          sizes="110px"
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ── Content — fills remaining height ── */}
            <div className="flex flex-col flex-1 p-5 gap-3">
              {/* Title + count */}
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-base font-bold text-[#222222] leading-snug line-clamp-1 flex-1">
                  {name}
                </h3>
                {totalCount !== undefined && (
                  <span className="shrink-0 text-[11px] font-semibold text-gray-400 tabular-nums mt-0.5">
                    {totalCount.toLocaleString()} items
                  </span>
                )}
              </div>

              {/* Description — always 2 lines */}
              <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 flex-1">
                {displayDescription}
              </p>

              {/* CTA */}
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-xl bg-[#E8E8E6] px-4 py-2 text-sm font-semibold text-gray-700 group-hover:bg-[#222222] group-hover:text-white transition-colors duration-200">
                  View Products
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </div>
          </MagicCard>
        </Link>
      </div>
    </motion.div>
  );
}
