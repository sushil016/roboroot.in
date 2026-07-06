"use client";

import { motion } from "framer-motion";
import { Cpu, ShieldCheck, HeartHandshake, Sparkles, Milestone } from "lucide-react";

const VALUES = [
  {
    icon: ShieldCheck,
    title: "100% Quality Checked",
    desc: "Every sensor, motherboard, and motor we ship is individually tested in-house by engineering teams to ensure it runs right out of the box."
  },
  {
    icon: Cpu,
    title: "STEM Focused",
    desc: "We build lego course kits, AI learning handbooks, and robotics hardware kits that empower schools, colleges, and makers to learn practically."
  },
  {
    icon: HeartHandshake,
    title: "Customer Support First",
    desc: "Stuck on code, pin connections, or datasheet mappings? Our technical engineers respond directly to help you compile and debug your builds."
  },
  {
    icon: Sparkles,
    title: "Integrated Platforms",
    desc: "From custom hardware PCB design to cloud-connected software web panels via BlockSquare, we build complete hardware-software systems."
  }
];

const TIMELINE = [
  { year: "2024", title: "RoboRoot Founded", desc: "Started as a hardware distributor focusing on verifying components for maker labs." },
  { year: "2025", title: "STEM Store Launch", desc: "Launched dedicated course kit bundles, STEM textbooks, and BlockSquare software integrations." },
  { year: "2026", title: "Autonomous Assemblies", desc: "Opened drone design, PCB fabrication, and full-stack custom robot manufacturing workflows." }
];

export function AboutContent() {
  return (
    <div className="min-h-screen bg-[#f2f2f0] text-[#222222] font-sans pb-16">

      {/* Hero Section */}
      <section className="bg-[#222222] rounded-b-[2.5rem] py-16 px-6 text-center text-white">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800 text-xs font-bold text-[#1CA2D1] tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Our Vision</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">
            Empowering the Next Generation of Makers
          </h1>
          <p className="text-zinc-400 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            RoboRoot is India’s premier destination for high-quality electronics components, course kits, custom drone/robot builds, and professional hardware engineering services.
          </p>
        </div>
      </section>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-16">

        {/* Core Values Section */}
        <section className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-[#222222]">Core Business Values</h2>
            <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest mt-1">What defines RoboRoot</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((val, idx) => {
              const Icon = val.icon;
              return (
                <motion.div
                  key={val.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05, duration: 0.4 }}
                  className="bg-white border border-[#D2D2D0] rounded-2xl p-6 shadow-xs hover:shadow-md transition duration-200"
                >
                  <div className="p-3 bg-[#1CA2D1]/10 rounded-xl text-[#1CA2D1] w-fit mb-4">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-extrabold text-lg text-[#222222]">{val.title}</h3>
                  <p className="text-xs leading-relaxed text-zinc-500 mt-2 font-medium">{val.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Milestone Timeline */}
        <section className="space-y-8 bg-white border border-[#D2D2D0] rounded-3xl p-8 shadow-xs">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-[#222222] flex items-center justify-center gap-2">
              <Milestone className="w-6 h-6 text-[#1CA2D1]" />
              Our Timeline
            </h2>
            <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest mt-1">Founding to Future</p>
          </div>

          <div className="relative border-l border-zinc-200 ml-4 md:ml-32 py-4 space-y-8">
            {TIMELINE.map((item) => (
              <div key={item.year} className="relative pl-8 md:pl-12 group">
                {/* Year tag for larger screens */}
                <div className="hidden md:block absolute -left-28 top-0.5 text-right w-20 font-black text-xl text-[#1CA2D1]">
                  {item.year}
                </div>

                {/* Bullet dot */}
                <span className="absolute -left-2 top-2 w-4 h-4 rounded-full border-4 border-[#F2F2F0] bg-[#1CA2D1] ring-4 ring-[#1CA2D1]/20 transition group-hover:scale-110" />

                {/* Content */}
                <div>
                  <span className="block md:hidden font-black text-lg text-[#1CA2D1] mb-0.5">{item.year}</span>
                  <h4 className="font-extrabold text-lg text-[#222222]">{item.title}</h4>
                  <p className="text-xs leading-relaxed text-zinc-500 mt-1 font-medium max-w-2xl">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
