"use client";

import Link from "next/link";
import { Boxes, PackageCheck } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { projectApi } from "@/lib/api/projects.api";
import {
  getCategoryLabel,
  getDifficultyLabel,
  formatProjectPrice,
  formatBuildTime,
} from "@/lib/utils/project-utils";

export function FeaturedBuildsSection() {
  const { data } = useQuery({
    queryKey: ["featured-projects-home"],
    queryFn: () => projectApi.getProjects({ isFeatured: true, limit: 3, isPublic: true }),
    staleTime: 5 * 60 * 1000,
  });

  const projects = data?.projects ?? [];

  return (
    <section className="mx-auto grid max-w-7xl gap-7 px-4 py-12 lg:grid-cols-[minmax(0,1fr)_360px]">
      <motion.div
        initial={{ opacity: 0, x: -32 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-2xl bg-zinc-950 p-6 text-[#F2F2F0] sm:p-8"
      >
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#1CA2D1]">
              Featured Builds
            </p>
            <h2 className="mt-2 text-3xl font-black">Start with a proven project path</h2>
          </div>
          <Link
            href="/projects"
            className="btn-underline-white inline-flex h-11 w-fit items-center rounded-xl bg-[#1CA2D1] px-6 text-sm font-black text-white transition hover:opacity-90"
          >
            All Projects
          </Link>
        </div>

        <motion.div
          className="mt-7 grid gap-4 md:grid-cols-3"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          transition={{ staggerChildren: 0.09 }}
        >
          {projects.length === 0 ? (
            <div className="col-span-3 flex flex-col items-center justify-center py-10 text-zinc-500 gap-2">
              <Boxes className="h-10 w-10 text-zinc-700" />
              <p className="text-sm">No featured projects yet. Add some in the admin panel.</p>
            </div>
          ) : (
            projects.map((project) => {
              const parts = [
                getCategoryLabel(project.category),
                getDifficultyLabel(project.difficulty),
                project.estimatedCostCents ? formatProjectPrice(project.estimatedCostCents) : null,
                project.estimatedBuildTimeMinutes
                  ? formatBuildTime(project.estimatedBuildTimeMinutes)
                  : null,
              ].filter(Boolean);

              return (
                <motion.div
                  key={project.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    show: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
                    },
                  }}
                >
                  <Link
                    href={`/projects/${project.id}`}
                    className="card-hover-bar block rounded-xl border border-white/10 bg-[#F2F2F0]/5 p-5 transition"
                  >
                    <Boxes className="h-8 w-8 text-[#1CA2D1]" />
                    <h3 className="mt-5 min-h-14 text-lg font-black leading-7">{project.title}</h3>
                    <p className="mt-3 text-sm font-semibold text-zinc-400">{parts.join(" • ")}</p>
                  </Link>
                </motion.div>
              );
            })
          )}
        </motion.div>
      </motion.div>

      <motion.aside
        initial={{ opacity: 0, x: 32 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="card-hover-bar rounded-2xl border border-[#D2D2D0] bg-[#F2F2F0] p-6 shadow-sm"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F2F2F0] text-[#1CA2D1]">
          <PackageCheck className="h-6 w-6" />
        </div>
        <h2 className="mt-5 text-2xl font-black text-zinc-950">Build your BOM faster</h2>
        <p className="mt-3 text-sm font-medium leading-6 text-zinc-600">
          Project pages connect parts to the build plan, so students can understand what to buy
          and why each component matters.
        </p>
        <div className="mt-6 space-y-3 text-sm font-bold text-zinc-700">
          <div className="flex items-center justify-between border-b border-[#D2D2D0] pb-3">
            <span>Catalog categories</span>
            <span className="text-[#1CA2D1]">8+</span>
          </div>
          <div className="flex items-center justify-between border-b border-[#D2D2D0] pb-3">
            <span>Project verticals</span>
            <span className="text-[#1CA2D1]">IoT, AI, UAV</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Robomaniac products</span>
            <span className="text-[#1CA2D1]">Kits + software</span>
          </div>
        </div>
      </motion.aside>
    </section>
  );
}
