"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, RotateCcw, SlidersHorizontal } from "lucide-react";
import type { ComponentCategoryNode, ComponentFilters } from "@/types/marketplace.types";
import { cn } from "@/lib/utils";

type CatalogSidebarProps = {
  categories: ComponentCategoryNode[];
  filters: ComponentFilters;
  minPrice: string;
  maxPrice: string;
  onMinPrice: (v: string) => void;
  onMaxPrice: (v: string) => void;
  onFilterChange: (f: Partial<ComponentFilters>) => void;
  onApplyPrice: () => void;
};

const QUICK_FILTERS = [
  { label: "In Stock", key: "inStock" as const },
  { label: "Best Sellers", key: "isBestSeller" as const },
  { label: "STEM Store", key: "isRobomaniacItem" as const },
];

function SidebarSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-[#D2D2D0] py-4 last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-2 text-left"
        aria-expanded={open}
      >
        <span className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-500">
          {title}
        </span>
        <motion.div
          animate={{ rotate: open ? 90 : 0 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <ChevronRight className="h-3.5 w-3.5 text-zinc-400" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function CatalogSidebar({
  categories,
  filters,
  minPrice,
  maxPrice,
  onMinPrice,
  onMaxPrice,
  onFilterChange,
  onApplyPrice,
}: CatalogSidebarProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(
    filters.category ?? null
  );

  // Expand the correct category when filters are set from URL params
  useEffect(() => {
    if (!filters.category) return;
    const frame = window.requestAnimationFrame(() => setExpandedCategory(filters.category ?? null));
    return () => window.cancelAnimationFrame(frame);
  }, [filters.category]);

  const hasActiveFilters = !!(
    filters.category ||
    filters.subcategory ||
    filters.inStock ||
    filters.isBestSeller ||
    filters.isRobomaniacItem ||
    filters.minPrice ||
    filters.maxPrice
  );

  function resetFilters() {
    onFilterChange({
      category: undefined,
      subcategory: undefined,
      inStock: undefined,
      isBestSeller: undefined,
      isRobomaniacItem: undefined,
      minPrice: undefined,
      maxPrice: undefined,
    });
    onMinPrice("");
    onMaxPrice("");
    setExpandedCategory(null);
  }

  return (
    <aside className="sticky top-24 h-[calc(100vh-6rem)] overflow-y-auto border-r border-[#D2D2D0] px-4 pb-8 pt-5 scrollbar-hide">
      {/* Sidebar header */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#222222]">
            <SlidersHorizontal className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-sm font-bold text-[#222222]">Filters</span>
        </div>

        <AnimatePresence>
          {hasActiveFilters && (
            <motion.button
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.18 }}
              onClick={resetFilters}
              className="flex items-center gap-1 text-[11px] font-semibold text-zinc-400 hover:text-[#222222] transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Quick filters (pill toggles) */}
      <SidebarSection title="Show">
        <div className="flex flex-wrap gap-1.5">
          {QUICK_FILTERS.map(({ label, key }) => {
            const active = Boolean(filters[key]);
            return (
              <button
                key={label}
                onClick={() => onFilterChange({ [key]: active ? undefined : true })}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-semibold transition-all duration-150",
                  active
                    ? "border-[#222222] bg-[#222222] text-white"
                    : "border-[#D2D2D0] bg-white text-zinc-600 hover:border-[#222222] hover:text-[#222222]"
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
      </SidebarSection>

      {/* Price range */}
      <SidebarSection title="Price Range">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="relative">
              <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-zinc-400">
                ₹
              </span>
              <input
                value={minPrice}
                onChange={(e) => onMinPrice(e.target.value)}
                className="h-9 w-full rounded-xl border border-[#D2D2D0] bg-white pl-6 pr-3 text-[11px] font-semibold text-[#222222] outline-none transition-colors focus:border-[var(--brand-primary)]"
                placeholder="Min"
                type="number"
                min="0"
              />
            </div>
            <div className="relative">
              <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-zinc-400">
                ₹
              </span>
              <input
                value={maxPrice}
                onChange={(e) => onMaxPrice(e.target.value)}
                className="h-9 w-full rounded-xl border border-[#D2D2D0] bg-white pl-6 pr-3 text-[11px] font-semibold text-[#222222] outline-none transition-colors focus:border-[var(--brand-primary)]"
                placeholder="Max"
                type="number"
                min="0"
              />
            </div>
          </div>
          <button
            onClick={onApplyPrice}
            className="w-full rounded-xl bg-[#222222] py-2 text-xs font-bold text-white transition-colors hover:bg-[var(--brand-primary)]"
          >
            Apply Price Filter
          </button>
        </div>
      </SidebarSection>

      {/* Categories tree */}
      <SidebarSection title="Categories">
        <nav className="flex flex-col gap-0.5">
          {/* All Categories */}
          <button
            onClick={() => {
              onFilterChange({ category: undefined, subcategory: undefined });
              setExpandedCategory(null);
            }}
            className={cn(
              "flex items-center justify-between rounded-lg px-2 py-2.5 text-left text-sm transition-colors",
              !filters.category
                ? "font-semibold text-[#222222]"
                : "text-zinc-500 hover:text-[#222222] hover:bg-white/60"
            )}
          >
            <span>All Categories</span>
            <span className="text-[10px] tabular-nums text-zinc-400">
              {categories.reduce((s, c) => s + c.count, 0)}
            </span>
          </button>

          {categories.map((cat) => {
            const isActive = filters.category === cat.category;
            const isExpanded = expandedCategory === cat.category;

            return (
              <div key={cat.category}>
                <button
                  onClick={() => {
                    onFilterChange({ category: cat.category, subcategory: undefined });
                    setExpandedCategory(isExpanded ? null : cat.category);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-sm transition-colors",
                    isActive
                      ? "font-semibold text-[#222222]"
                      : "text-zinc-500 hover:text-[#222222] hover:bg-white/60"
                  )}
                >
                  <span className="truncate">{cat.category}</span>
                  <div className="flex shrink-0 items-center gap-1.5 ml-1">
                    <span className="text-[10px] tabular-nums text-zinc-400">{cat.count}</span>
                    <motion.div
                      animate={{ rotate: isExpanded ? 90 : 0 }}
                      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <ChevronRight
                        className={cn(
                          "h-3 w-3",
                          isExpanded ? "text-[var(--brand-primary)]" : "text-zinc-400"
                        )}
                      />
                    </motion.div>
                  </div>
                </button>

                {/* Subcategories */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="ml-3 mb-1 mt-0.5 space-y-0.5 border-l border-[#D2D2D0] pl-3">
                        <button
                          onClick={() => onFilterChange({ subcategory: undefined })}
                          className={cn(
                            "flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-xs transition-colors",
                            !filters.subcategory && isActive
                              ? "font-semibold text-[var(--brand-primary)]"
                              : "text-zinc-500 hover:text-[#222222] hover:bg-white/70"
                          )}
                        >
                          <span className="font-semibold text-[var(--brand-primary)]">All {cat.category}</span>
                          <span className="text-[10px] tabular-nums text-zinc-400">{cat.count}</span>
                        </button>
                        {cat.subcategories.map((sub, si) => (
                          <motion.button
                            key={sub.name}
                            initial={{ x: -6, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: si * 0.025, duration: 0.16 }}
                            onClick={() => onFilterChange({ subcategory: sub.name })}
                            className={cn(
                              "flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-xs transition-colors",
                              filters.subcategory === sub.name
                                ? "font-semibold text-[var(--brand-primary)]"
                                : "text-zinc-500 hover:text-[#222222] hover:bg-white/70"
                            )}
                          >
                            <span className="flex items-center gap-1.5">
                              <span className="h-1 w-1 rounded-full bg-zinc-300 shrink-0" />
                              {sub.name}
                            </span>
                            <span className="text-[10px] tabular-nums text-zinc-400">
                              {sub.count}
                            </span>
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>
      </SidebarSection>
    </aside>
  );
}
