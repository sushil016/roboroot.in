"use client";

import { motion } from "framer-motion";
import { services } from "@/features/dashboard/data/homepage";
import { homeIcons } from "@/features/dashboard/components/home-icons";

export function ServicesSection() {
  return (
    <section className="border-y border-[#D8D8C4] bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8"
        >
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#1CA2D1]">
            Our Services
          </p>
          <h2 className="mt-2 text-3xl font-black text-zinc-950">
            Projects for students, institutions, and companies
          </h2>
        </motion.div>

        <div className="overflow-x-auto pb-3 scrollbar-hide">
          <motion.div
            className="flex min-w-max gap-4"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            transition={{ staggerChildren: 0.07 }}
          >
            {services.map((service) => {
              const Icon = homeIcons[service.icon];
              return (
                <motion.div
                  key={service.title}
                  variants={{
                    hidden: { opacity: 0, x: 24 },
                    show: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
                  }}
                  className="card-hover-bar w-72 shrink-0 rounded-xl border border-[#D8D8C4] bg-[#F3F3E4] p-6"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-background text-[#1CA2D1] shadow-sm">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-xl font-black text-zinc-950">{service.title}</h3>
                  <p className="mt-2 text-sm font-medium leading-6 text-zinc-600">{service.copy}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
