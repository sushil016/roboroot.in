"use client";

import Link from "next/link";
import { Film } from "lucide-react";
import { motion } from "framer-motion";
import { projectVideoSlots } from "@/data/homepage";

export function ProjectVideosSection() {
  return (
    <section className="border-b border-[#D2D2D0] bg-[#F2F2F0]">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#1CA2D1]">
              Project Videos
            </p>
            <h2 className="mt-2 text-3xl font-black text-zinc-950">Watch real build work in motion</h2>
          </div>
          <Link
            href="/projects"
            className="btn-underline-white inline-flex h-11 w-fit items-center rounded-xl bg-[#1CA2D1] px-6 text-sm font-black text-white transition hover:opacity-90"
          >
            Open Projects
          </Link>
        </motion.div>

        <motion.div
          className="grid gap-4 md:grid-cols-3"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          transition={{ staggerChildren: 0.1 }}
        >
          {projectVideoSlots.map((slot) => (
            <motion.div
              key={slot}
              variants={{
                hidden: { opacity: 0, y: 28 },
                show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
              }}
              className="card-hover-bar rounded-xl border border-[#D2D2D0] bg-[#F2F2F0] p-4 shadow-sm"
            >
              <div className="flex aspect-video items-center justify-center rounded-xl bg-zinc-950 text-white">
                <Film className="h-10 w-10 text-[#1CA2D1]" />
              </div>
              <h3 className="mt-4 font-black text-zinc-950">{slot}</h3>
              <p className="mt-2 text-sm font-medium leading-6 text-zinc-600">
                See electronics, software, testing, and final demo flow across project builds.
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
