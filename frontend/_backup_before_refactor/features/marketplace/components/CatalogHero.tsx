"use client";

import { motion } from "framer-motion";
import { Cpu } from "lucide-react";
import type { ComponentCategoryNode, ComponentFilters } from "@/lib/types/marketplace.types";

type CatalogHeroProps = {
  categories: ComponentCategoryNode[];
  filters: ComponentFilters;
  onFilterChange: (filters: Partial<ComponentFilters>) => void;
  totalProducts?: number;
};

export function CatalogHero({
  categories,
  filters,
  onFilterChange,
  totalProducts,
}: CatalogHeroProps) {
  const selectedCategory = categories.find((c) => c.category === filters.category);
  const title =
    filters.subcategory ??
    selectedCategory?.category ??
    "All Components";

  const totalCount =
    selectedCategory?.count ??
    totalProducts ??
    categories.reduce((s, c) => s + c.count, 0);

  return (
    <div className="bg-[#222222] px-6 py-8 pb-10">
      <div className="mx-auto max-w-[1500px]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Cpu className="h-4 w-4 text-[var(--brand-primary)]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                Electronics Catalog
              </span>
            </div>
            <motion.h1
              key={title}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="text-3xl font-bold text-white md:text-4xl"
            >
              {title}
            </motion.h1>
            {totalCount > 0 && (
              <p className="mt-1.5 text-sm font-medium text-zinc-500">
                {totalCount.toLocaleString()} products
              </p>
            )}
          </div>

          {/* Category quick-select pills — hidden on mobile */}
          <div className="hidden flex-wrap justify-end gap-1.5 md:flex max-w-lg">
            <button
              onClick={() => onFilterChange({ category: undefined, subcategory: undefined })}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition-all duration-150 ${
                !filters.category
                  ? "border-[var(--brand-primary)] bg-[var(--brand-primary)] text-white"
                  : "border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
              }`}
            >
              All
            </button>
            {categories.slice(0, 6).map((cat) => (
              <button
                key={cat.category}
                onClick={() =>
                  onFilterChange({ category: cat.category, subcategory: undefined })
                }
                className={`rounded-full border px-3 py-1 text-xs font-semibold transition-all duration-150 ${
                  filters.category === cat.category
                    ? "border-[var(--brand-primary)] bg-[var(--brand-primary)] text-white"
                    : "border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
                }`}
              >
                {cat.category}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
