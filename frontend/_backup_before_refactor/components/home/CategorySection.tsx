"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { componentApi } from "@/lib/api/marketplace.api";
import { CategoryCard } from "@/components/categories/CategoryCard";
import { Skeleton } from "@/components/ui/skeleton";

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

function CategoryCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden border border-[#D2D2D0] bg-white">
      <Skeleton className="h-[200px] w-full rounded-none" />
      <div className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-12" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-9 w-32 rounded-xl" />
      </div>
    </div>
  );
}

export function CategorySection() {
  const { data: categoryTree, isLoading } = useQuery({
    queryKey: ["component-category-tree"],
    queryFn: componentApi.getCategoryTree,
    staleTime: 5 * 60 * 1000,
  });

  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--brand-primary)]">
            Shop By Category
          </p>
          <h2 className="mt-2 text-3xl font-bold text-[#222222]">All electronics categories</h2>
        </div>
        <Link
          href="/categories"
          className="inline-flex h-10 w-fit items-center justify-center rounded-xl bg-[#222222] px-5 text-sm font-semibold text-white transition hover:bg-[var(--brand-primary)]"
        >
          Browse All →
        </Link>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
      >
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => (
              <motion.div key={i} variants={cardVariants}>
                <CategoryCardSkeleton />
              </motion.div>
            ))
          : (categoryTree ?? []).slice(0, 8).map((node, i) => {
              const productImages = node.subcategories
                .flatMap((s) => s.products)
                .filter((p) => p.imageUrl)
                .slice(0, 3)
                .map((p) => p.imageUrl!);

              return (
                <motion.div key={node.category} variants={cardVariants} className="h-full">
                  <CategoryCard
                    index={i}
                    name={node.category}
                    href={`/components?category=${encodeURIComponent(node.category)}`}
                    totalCount={node.count}
                    productImages={productImages}
                    subcategories={node.subcategories.map((s) => ({
                      name: s.name,
                      href: `/components?category=${encodeURIComponent(node.category)}&subcategory=${encodeURIComponent(s.name)}`,
                      count: s.count,
                    }))}
                  />
                </motion.div>
              );
            })}
      </motion.div>

      {/* Browse All button */}
      {!isLoading && (categoryTree ?? []).length > 0 && (
        <div className="mt-8 flex justify-center">
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 rounded-2xl border-2 border-[#222222] px-8 py-3 text-sm font-semibold text-[#222222] transition-colors hover:bg-[#222222] hover:text-white"
          >
            Browse All Categories →
          </Link>
        </div>
      )}
    </section>
  );
}
