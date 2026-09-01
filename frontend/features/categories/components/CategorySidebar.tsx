"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, LayoutGrid, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { componentApi } from "@/features/products/services/product.service";

interface CategorySidebarProps {
  activeCategory?: string;
}

export function CategorySidebar({ activeCategory }: CategorySidebarProps) {
  const { data: categoryTree = [], isLoading } = useQuery({
    queryKey: ["component-category-tree"],
    queryFn: componentApi.getCategoryTree,
    staleTime: 5 * 60 * 1000,
  });

  const [expanded, setExpanded] = useState<string | null>(
    activeCategory ?? null
  );
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <aside className="sticky top-20 h-[calc(100vh-6rem)] w-full overflow-y-auto scrollbar-hide">
      <div className="overflow-hidden rounded-2xl border border-[#D2D2D0] bg-[#F2F2F0]">

        <div className="flex items-center gap-3 border-b border-[#D2D2D0] bg-[#E8E8E6] px-4 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--brand-primary)]/10 ring-1 ring-[var(--brand-primary)]/20">
            <LayoutGrid className="h-4 w-4 text-[var(--brand-primary)]" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--brand-primary)]">Catalog</p>
            <p className="text-sm font-black text-zinc-950">All Categories</p>
          </div>
        </div>

        <nav className="p-2">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-[var(--brand-primary)]" />
            </div>
          )}

          {categoryTree.map((cat, i) => {
            const isExpanded = expanded === cat.category;
            const isHovered = hovered === cat.category;
            const categoryHref = `/components?category=${encodeURIComponent(cat.category)}`;

            return (
              <div key={cat.category}>
                <button
                  onClick={() => setExpanded(isExpanded ? null : cat.category)}
                  onMouseEnter={() => setHovered(cat.category)}
                  onMouseLeave={() => setHovered(null)}
                  className={`group relative w-full overflow-hidden rounded-xl px-3 py-2.5 text-left transition-colors ${
                    isExpanded ? "bg-[#E8E8E6]" : "hover:bg-[#E8E8E6]/60"
                  }`}
                >
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: isHovered && !isExpanded ? 1 : 0 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className="absolute left-0 top-0 h-full w-[3px] origin-left rounded-l-xl bg-[var(--brand-primary)]"
                  />

                  <div className="flex items-center gap-2.5">
                    <span
                      className={`min-w-[1.5rem] text-[10px] font-black tabular-nums transition-colors ${
                        isExpanded ? "text-[var(--brand-primary)]" : "text-zinc-400 group-hover:text-zinc-500"
                      }`}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>

                    <span
                      className={`flex-1 text-sm font-bold leading-snug transition-colors ${
                        isExpanded ? "text-zinc-950" : "text-zinc-700 group-hover:text-zinc-950"
                      }`}
                    >
                      {cat.category}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {cat.count > 0 && (
                        <span className="rounded-md bg-[#D2D2D0] px-1.5 py-0.5 text-[10px] font-black tabular-nums text-zinc-600">
                          {cat.count}
                        </span>
                      )}
                      <motion.div
                        animate={{ rotate: isExpanded ? 90 : 0 }}
                        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <ChevronRight
                          className={`h-3.5 w-3.5 transition-colors ${
                            isExpanded ? "text-[var(--brand-primary)]" : "text-zinc-400"
                          }`}
                        />
                      </motion.div>
                    </div>
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      key="subcat"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="mb-1 mt-0.5 space-y-0.5 ml-8 border-l border-[#D2D2D0] pl-3">
                        <motion.div
                          initial={{ x: -6, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                        >
                          <Link
                            href={categoryHref}
                            className="group/sub flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-bold text-[var(--brand-primary)] transition-colors hover:bg-[#E8E8E6]"
                          >
                            <span className="h-1 w-1 shrink-0 rounded-full bg-[var(--brand-primary)]" />
                            All {cat.category}
                          </Link>
                        </motion.div>
                        {cat.subcategories.map((sub, si) => (
                          <motion.div
                            key={sub.name}
                            initial={{ x: -6, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{
                              duration: 0.2,
                              ease: [0.22, 1, 0.36, 1],
                              delay: (si + 1) * 0.03,
                            }}
                          >
                            <Link
                              href={`/components?category=${encodeURIComponent(cat.category)}&subcategory=${encodeURIComponent(sub.name)}`}
                              className="group/sub flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-semibold text-zinc-500 transition-colors hover:bg-[#E8E8E6] hover:text-[var(--brand-primary)]"
                            >
                              <span className="h-1 w-1 shrink-0 rounded-full bg-[#D2D2D0] transition-colors group-hover/sub:bg-[var(--brand-primary)]" />
                              {sub.name}
                              {sub.count > 0 && (
                                <span className="ml-auto text-[10px] tabular-nums text-zinc-400">
                                  {sub.count}
                                </span>
                              )}
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

        <div className="border-t border-[#D2D2D0] p-3">
          <Link
            href="/components"
            className="block w-full rounded-xl bg-zinc-950 py-2.5 text-center text-sm font-black text-white transition hover:bg-[var(--brand-primary)]"
          >
            Browse All Products
          </Link>
        </div>
      </div>
    </aside>
  );
}
