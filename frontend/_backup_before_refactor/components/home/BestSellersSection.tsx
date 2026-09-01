"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { componentApi } from "@/lib/api/marketplace.api";
import { ProductCard } from "@/features/marketplace/components/ProductCard";
import { ProductRevealCardSkeleton } from "@/components/ui/product-reveal-card";

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

export function BestSellersSection() {
  const { data, isLoading } = useQuery({
    queryKey: ["best-sellers"],
    queryFn: () => componentApi.getComponents({ isBestSeller: true, limit: 6, sortBy: "name" }),
    staleTime: 5 * 60 * 1000,
  });

  const components = data?.components ?? [];

  if (!isLoading && components.length === 0) return null;

  return (
    <section className="border-y border-[#D2D2D0] bg-[#F2F2F0]">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 lg:grid-cols-[360px_minmax(0,1fr)]">
        {/* Left — section header */}
        <motion.div
          initial={{ opacity: 0, x: -28 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[var(--brand-primary)]">
            Best Selling Products
          </p>
          <h2 className="mt-2 text-3xl font-black text-zinc-950">Fast-moving catalog picks</h2>
          <p className="mt-4 text-sm font-medium leading-6 text-zinc-600">
            Components, modules, tools, and Robomaniac learning products that fit common build
            workflows.
          </p>
          <Link
            href="/components?isBestSeller=true"
            className="mt-6 inline-flex h-11 items-center rounded-xl bg-[var(--brand-primary)] px-6 text-sm font-black text-white transition hover:opacity-90"
          >
            View Best Sellers
          </Link>
        </motion.div>

        {/* Right — product grid */}
        <motion.div
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          transition={{ staggerChildren: 0.09 }}
        >
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <motion.div key={i} variants={cardVariants}>
                  <ProductRevealCardSkeleton />
                </motion.div>
              ))
            : components.map((component) => (
                <motion.div key={component.id} variants={cardVariants}>
                  <ProductCard component={component} />
                </motion.div>
              ))}
        </motion.div>
      </div>
    </section>
  );
}
