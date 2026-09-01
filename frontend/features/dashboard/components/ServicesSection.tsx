"use client";

import { useEffect, useRef } from "react";
import { ArrowRight, Bot, BrainCircuit, Cpu } from "lucide-react";
import { motion } from "framer-motion";

const ROBOMANIAC_URL = "https://robomaniac.in";
const ROBOMANIAC_PROGRAMS_URL = "https://robomaniac.in/#programs";
const SERVICE_VIDEO_SRC = "/homepage/school-lab.mp4";

const services = [
  {
    title: "Robotics",
    copy: "Build robots that move, sense, and solve real-world challenges.",
    Icon: Bot,
  },
  {
    title: "Coding & Electronics",
    copy: "Create smart systems using Arduino, sensors, and programming.",
    Icon: Cpu,
  },
  {
    title: "AI & Future Tech",
    copy: "Explore machine learning, computer vision, and intelligent systems.",
    Icon: BrainCircuit,
  },
];

const outcomes = [
  "Line Follower",
  "Obstacle Avoider",
  "Bluetooth Car",
  "Robotic Arm",
  "Smart Home",
  "AI Projects",
];

export function ServicesSection() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPlayback = (isVisible: boolean) => {
      if (!isVisible || reduceMotion.matches) {
        video.pause();
        return;
      }

      void video.play().catch(() => undefined);
    };

    const observer = new IntersectionObserver(
      ([entry]) => syncPlayback(entry.isIntersecting),
      { threshold: 0.35 }
    );

    observer.observe(video);

    return () => observer.disconnect();
  }, []);

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <motion.div
            initial={{ opacity: 0, x: -18 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="lg:sticky lg:top-28"
          >
            <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-slate-50 shadow-[0_28px_90px_rgba(15,23,42,0.08)]">
              <video
                ref={videoRef}
                className="aspect-[4/5] w-full bg-slate-100 object-cover sm:aspect-[16/11] lg:aspect-[9/14]"
                src={SERVICE_VIDEO_SRC}
                muted
                loop
                playsInline
                preload="metadata"
                aria-label="Robomaniac students building robotics projects"
              />
            </div>
          </motion.div>

          <div>
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-[660px]"
            >
              <div className="mx-auto mb-12 max-w-2xl sm:mb-14">
            <div>
              <span className="inline-flex rounded-full bg-brand-primary px-8 py-3 text-sm font-light uppercase tracking-[0.22em] text-brand-secondary-3 ">
                Our Services
              </span>
              <h2 className="mt-3 text-2xl font-bold sm:text-3xl">Learn Robotics, Coding & AI Through Real Projects</h2> 
              <p className="mt-3 max-w-[600px] text-base leading-8 text-slate-500 sm:text-base">
                    Hands-on programs by Robomaniac for students aged 6-18.
              </p>

        </div>
      </div>
              
              
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-80px" }}
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.08 } },
              }}
              className="mt-1 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3"
            >
              {services.map((service) => (
                <motion.a
                  key={service.title}
                  href={ROBOMANIAC_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  variants={{
                    hidden: { opacity: 0, y: 18 },
                    show: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
                    },
                  }}
                  className="group rounded-[24px] border border-slate-200 bg-white p-3 transition duration-300 hover:-translate-y-1 hover:border-[var(--brand-primary)]/35 hover:shadow-[0_20px_50px_rgba(15,23,42,0.08)]"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-50 text-[var(--brand-primary)] transition group-hover:bg-[var(--brand-primary)] group-hover:text-white">
                    <service.Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-6 text-base font-semibold text-[#0F172A] xl:text-lg">
                    {service.title}
                  </h3>
                  <p className="mt-3 line-clamp-2 text-xs font-medium leading-6 text-slate-500 sm:text-sm">
                    {service.copy}
                  </p>
                </motion.a>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="mt-8 flex flex-wrap gap-2.5"
            >
              {outcomes.map((outcome) => (
                <span
                  key={outcome}
                  className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-600"
                >
                  {outcome}
                </span>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="mt-10 rounded-[24px] border border-slate-200 bg-brand-secondary p-6 sm:p-8"
            >
              <h3 className="text-2xl font-semibold tracking-normal text-brand-secondary-3 sm:text-3xl">
                Explore our robotics lab programs for <span className="text-secondary-2">Schools</span>
              </h3>
              <p className="mt-4 max-w-2xl text-base font-light leading-7 text-white">
                End to end robotics programs for schools, designed to teach students the fundamentals of robotics, coding, and electronics through hands-on projects.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <a
                  href={ROBOMANIAC_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-brand-primary px-6 text-sm font-semibold text-white transition hover:bg-[#0F172A]"
                >
                  Visit Robomaniac
                  <ArrowRight className="h-4 w-4" />
                </a>
                <a
                  href={ROBOMANIAC_PROGRAMS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-12 items-center justify-center rounded-full border border-slate-300 bg-white px-6 text-sm font-semibold text-[#0F172A] transition hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]"
                >
                  View Programs
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
