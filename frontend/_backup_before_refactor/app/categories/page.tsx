"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { PackageSearch, Layers, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { componentApi } from "@/lib/api/marketplace.api";
import { CategoryCard } from "@/components/categories/CategoryCard";
import Text3DFlip from "@/components/ui/text-3d-flip";
import type { CategoryCardProps } from "@/components/categories/CategoryCard";

export default function CategoriesPage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [expandedSidebar, setExpandedSidebar] = useState<string | null>(null);

  const { data: apiCategories, isLoading } = useQuery({
    queryKey: ["component-category-tree"],
    queryFn: componentApi.getCategoryTree,
    staleTime: 5 * 60 * 1000,
  });

  const allCategories: (CategoryCardProps & { productImages: string[] })[] = (
    apiCategories ?? []
  ).map((c, index) => {
    const productImages = c.subcategories
      .flatMap((s) => s.products)
      .filter((p) => p.imageUrl)
      .slice(0, 3)
      .map((p) => p.imageUrl!);

    return {
      index,
      name: c.category,
      href: `/components?category=${encodeURIComponent(c.category)}`,
      totalCount: c.count,
      productImages,
      subcategories: c.subcategories.map((sub) => ({
        name: sub.name,
        href: `/components?category=${encodeURIComponent(c.category)}&subcategory=${encodeURIComponent(sub.name)}`,
        count: sub.count,
      })),
    };
  });

  const filtered = activeCategory
    ? allCategories.filter((c) => c.name === activeCategory)
    : allCategories;

  const totalProducts = apiCategories?.reduce((a, c) => a + c.count, 0) ?? 0;

  return (
    <div className="min-h-screen bg-[#f2f2f0]" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>

      {/* ── Dark Hero ── */}
      <div className="bg-[#222222] rounded-b-[2.5rem] px-6 py-10 pb-14 mt-2">
        <div className="max-w-3xl mx-auto flex flex-col items-center text-center gap-4">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-[#1CA2D1]" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
              Electronics Catalog
            </span>
          </div>

          <Text3DFlip
            as="h1"
            className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight justify-center"
            textClassName="text-white"
            flipTextClassName="text-[#1CA2D1]"
            staggerDuration={0.025}
            rotateDirection="bottom"
          >
            All Categories
          </Text3DFlip>

          <p className="text-zinc-400 text-base max-w-xl">
            From microcontrollers to motors, sensors to satellites — browse the full RoboRoot
            catalog by category.
          </p>

          {!isLoading && (
            <div className="flex items-center gap-5 text-xs font-semibold text-zinc-500 mt-1">
              <span>{allCategories.length} categories</span>
              <span className="w-1 h-1 rounded-full bg-zinc-600" />
              <span>
                {allCategories.reduce((a, c) => a + c.subcategories.length, 0)} subcategories
              </span>
              <span className="w-1 h-1 rounded-full bg-zinc-600" />
              <span>{totalProducts.toLocaleString()} products</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-[1500px] mx-auto px-6 py-8 flex gap-8">

        {/* ── Sidebar with expandable dropdowns ── */}
        <aside className="hidden lg:flex flex-col w-56 xl:w-64 shrink-0">
          <div className="sticky top-24">
            <div className="flex items-center gap-2.5 px-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-[#222222] flex items-center justify-center shrink-0">
                <Layers className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-sm font-bold text-[#222222]">Categories</span>
            </div>

            <nav className="flex flex-col gap-0.5">
              {/* All categories */}
              <button
                onClick={() => { setActiveCategory(null); setExpandedSidebar(null); }}
                className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm transition-colors text-left ${
                  !activeCategory
                    ? "text-[#222222] font-semibold bg-white shadow-sm"
                    : "text-gray-500 hover:text-[#222222] hover:bg-white/60"
                }`}
              >
                <span>All Categories</span>
                <span className="text-xs tabular-nums text-gray-400">{allCategories.length}</span>
              </button>

              {/* Each category with expandable subcategory dropdown */}
              {(apiCategories ?? []).map((cat) => {
                const isActive = activeCategory === cat.category;
                const isExpanded = expandedSidebar === cat.category;

                return (
                  <div key={cat.category}>
                    <button
                      onClick={() => {
                        setActiveCategory(isActive ? null : cat.category);
                        setExpandedSidebar(isExpanded ? null : cat.category);
                      }}
                      className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm transition-colors text-left ${
                        isActive
                          ? "text-[#222222] font-semibold"
                          : "text-gray-500 hover:text-[#222222] hover:bg-white/60"
                      }`}
                    >
                      <span className="truncate">{cat.category}</span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[10px] tabular-nums text-gray-400">{cat.count}</span>
                        <motion.div
                          animate={{ rotate: isExpanded ? 90 : 0 }}
                          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                        >
                          <ChevronRight className={`w-3.5 h-3.5 ${isExpanded ? "text-[#1CA2D1]" : "text-gray-400"}`} />
                        </motion.div>
                      </div>
                    </button>

                    {/* Subcategory dropdown */}
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                          className="overflow-hidden"
                        >
                          <div className="ml-3 pl-3 border-l border-[#D2D2D0] mt-0.5 mb-1 space-y-0.5">
                            <Link
                              href={`/components?category=${encodeURIComponent(cat.category)}`}
                              className="block px-2 py-1.5 text-xs font-semibold text-[#1CA2D1] hover:bg-white/70 rounded-lg transition-colors"
                            >
                              All {cat.category}
                            </Link>
                            {cat.subcategories.map((sub, si) => (
                              <motion.div
                                key={sub.name}
                                initial={{ x: -6, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: si * 0.03, duration: 0.18 }}
                              >
                                <Link
                                  href={`/components?category=${encodeURIComponent(cat.category)}&subcategory=${encodeURIComponent(sub.name)}`}
                                  className="flex items-center justify-between px-2 py-1.5 text-xs text-gray-500 hover:text-[#222222] hover:bg-white/70 rounded-lg transition-colors"
                                >
                                  <span className="flex items-center gap-1.5">
                                    <span className="w-1 h-1 rounded-full bg-gray-300 shrink-0" />
                                    {sub.name}
                                  </span>
                                  <span className="text-[10px] tabular-nums text-gray-400">{sub.count}</span>
                                </Link>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* ── Main content ── */}
        <div className="flex-1 min-w-0">
          {activeCategory && (
            <div className="flex items-center gap-2 mb-5">
              <span className="text-sm font-semibold text-[#222222]">{activeCategory}</span>
              <button
                onClick={() => { setActiveCategory(null); setExpandedSidebar(null); }}
                className="text-xs text-gray-400 hover:text-gray-600 underline"
              >
                Clear
              </button>
              <span className="ml-auto text-sm text-gray-400 font-medium">
                {filtered.length} {filtered.length === 1 ? "category" : "categories"}
              </span>
            </div>
          )}

          {isLoading && (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-[#D2D2D0] overflow-hidden bg-white">
                  <Skeleton className="h-[200px] w-full rounded-none" />
                  <div className="p-5 space-y-3">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-9 w-32 rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoading && filtered.length === 0 && (
            <div className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-2xl border border-[#D2D2D0] bg-white p-10 text-center">
              <PackageSearch className="h-10 w-10 text-zinc-300" />
              <p className="font-bold text-zinc-600">No categories found.</p>
              <p className="text-sm text-zinc-400">
                Add components in the admin panel to create categories automatically.
              </p>
            </div>
          )}

          {filtered.length > 0 && (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((cat, i) => (
                <div key={cat.name} className="h-full">
                  <CategoryCard {...cat} index={i} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
