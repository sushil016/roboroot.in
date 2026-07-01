'use client';

import { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { motion, useInView } from 'framer-motion';
import {
  CircuitBoard, Layers, BookOpen, Code2, Microscope, GraduationCap,
  ArrowRight, Youtube, Users, FileText, MessageSquare, BookMarked,
  Plus, CornerDownRight, Cpu, Terminal, Truck, ShieldCheck, Wrench,
  ShoppingCart, Star,
} from 'lucide-react';
import { componentApi } from '@/features/products/services/product.service';
import { formatPrice } from '@/store/cart.store';
import { useCartStore } from '@/store/cart.store';
import { toast } from 'sonner';

// ─── Design tokens ───────────────────────────────────────────────────
const BG     = '#EDE8D8';   // warm cream (reference match)
const DARK   = '#0F0D09';   // warm near-black
const AMBER  = '#C8780A';   // amber accent (reference highlight)
const BORDER = '#D8D3C2';   // card borders on light bg
const DKBDR  = '#2A2420';   // item borders inside dark panels

// ─── Static data ─────────────────────────────────────────────────────
const CATEGORIES = [
  { label: 'Custom Boards',    icon: CircuitBoard,  desc: 'ESP32, STM32 & custom PCBs',           href: '/components?category=Development+Boards', count: '24+' },
  { label: 'DIY STEM Kits',    icon: Layers,        desc: 'Complete robotics starter kits',        href: '/stem-store', count: '12' },
  { label: 'Engineering Books',icon: BookOpen,      desc: 'Robotics, AI & embedded systems',        href: '/stem-store', count: '8 titles' },
  { label: 'Blocksquare',      icon: Code2,         desc: 'Visual STEM programming software',       href: '/stem-store', count: 'Pro & Edu' },
  { label: 'Sensor Modules',   icon: Microscope,    desc: 'Distance, motion & environment',         href: '/components?category=Sensors', count: '40+' },
  { label: 'Learning Bundles', icon: GraduationCap, desc: 'Curated kits for every level',           href: '/stem-store', count: '6 bundles' },
];

const WHY = [
  { n: '01', title: 'Open-source Focused',  desc: 'Every board is built on open hardware standards.' },
  { n: '02', title: 'Beginner Friendly',    desc: 'From zero to working prototype in one weekend.' },
  { n: '03', title: 'Real Engineering',     desc: 'Projects used in labs and competitions.' },
  { n: '04', title: 'Fast Shipping',        desc: 'Pan-India — orders dispatched same day.' },
  { n: '05', title: 'Student Designed',     desc: 'Built by engineers who were students like you.' },
];

const BS_ROWS = [
  { label: 'Drag-and-drop visual programming',  highlight: false },
  { label: 'Arduino & MicroPython export',       highlight: true,  note: 'One-click → real hardware' },
  { label: 'AI-powered code suggestions',        highlight: false },
  { label: 'Classroom management tools',         highlight: false },
  { label: 'Offline mode + local save',          highlight: false },
  { label: 'Works on any browser, any OS',       highlight: false },
];

const COMMUNITY = [
  { icon: Youtube,       label: 'Tutorials',  desc: '50+ build walkthroughs', href: '#' },
  { icon: GraduationCap, label: 'Courses',    desc: 'Structured learning paths', href: '#' },
  { icon: Users,         label: 'Workshops',  desc: 'Monthly live sessions', href: '#' },
  { icon: FileText,      label: 'Docs',       desc: 'Full hardware reference', href: '#' },
  { icon: MessageSquare, label: 'Discord',    desc: '2,000+ member community', href: '#' },
  { icon: BookMarked,    label: 'Projects',   desc: 'Open project showcase', href: '#' },
];

// Hero floating panel rows
const HERO_ROWS = [
  { label: 'ESP32 AI Board',            tag: 'Custom Board',  highlight: false },
  { label: 'Robotics Starter Kit',      tag: 'DIY Kit',       highlight: true,  note: 'Most popular this month' },
  { label: 'IoT Sensor Bundle',         tag: '12-Pack',       highlight: false },
  { label: 'Blocksquare Pro License',   tag: 'Software',      highlight: false },
  { label: 'Embedded Systems Handbook', tag: 'Book',          highlight: false },
];

// ─── Fade-in wrapper ─────────────────────────────────────────────────
function FadeUp({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── DarkRow ─────────────────────────────────────────────────────────
function DarkRow({ label, note, highlight, tag }: { label: string; note?: string; highlight?: boolean; tag?: string }) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl border px-4 py-2.5 text-sm transition-colors ${
        highlight
          ? 'border-[#C8780A]/40 bg-[#C8780A]/15'
          : 'border-[#2A2420] bg-transparent hover:border-[#3A342E]'
      }`}
    >
      {highlight && <CornerDownRight className="h-3.5 w-3.5 shrink-0 text-[#C8780A]" />}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className={`font-medium leading-none ${highlight ? 'text-[#E8960E]' : 'text-[#C8C2B4]'}`}>
          {label}
        </span>
        {note && <span className="text-[11px] leading-none text-[#C8780A]/80">{note}</span>}
      </div>
      {tag && (
        <span className="shrink-0 rounded-md border border-[#2A2420] px-2 py-0.5 text-[10px] font-medium tracking-wide text-[#6A6058]">
          {tag}
        </span>
      )}
    </div>
  );
}

// ─── Product card ─────────────────────────────────────────────────────
function ProductCard({ product }: { product: { id: string; slug: string; name: string; unitPriceCents: number; imageUrl?: string | null; subcategory?: string | null; category: string } }) {
  const addItem = useCartStore((s) => s.addItem);
  return (
    <Link href={`/components/${product.slug}`} className="group block">
      <div className="overflow-hidden rounded-2xl border-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)]"
        style={{ borderColor: DARK, backgroundColor: BG }}>
        <div className="relative aspect-[4/3] overflow-hidden bg-[#E0DACA]">
          {product.imageUrl ? (
            <Image src={product.imageUrl} alt={product.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
          ) : (
            <div className="flex h-full items-center justify-center">
              <CircuitBoard className="h-12 w-12 text-[#8A8478]" strokeWidth={1.2} />
            </div>
          )}
        </div>
        <div className="p-5">
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#8A8478]">
            {product.subcategory ?? product.category}
          </span>
          <h3 className="mt-1.5 text-base font-semibold leading-snug text-[#0F0D09] line-clamp-2">{product.name}</h3>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-xl font-bold text-[#0F0D09]">{formatPrice(product.unitPriceCents)}</span>
            <button
              onClick={(e) => { e.preventDefault(); addItem(product as never, 1); toast.success('Added to cart'); }}
              className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-[#0F0D09] text-[#0F0D09] transition-colors hover:bg-[#0F0D09] hover:text-[#EDE8D8]"
            >
              <ShoppingCart className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── Section label ─────────────────────────────────────────────────────
function SectionLabel({ children }: { children: string }) {
  return (
    <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-[#8A8478]">{children}</p>
  );
}

// ─── Bordered button ─────────────────────────────────────────────────
function BorderBtn({ href, children, dark = false }: { href: string; children: React.ReactNode; dark?: boolean }) {
  return (
    <Link
      href={href}
      className={`inline-flex h-11 items-center gap-2 rounded-xl border-2 px-5 text-sm font-semibold transition-all duration-200 ${
        dark
          ? 'border-[#EDE8D8] text-[#EDE8D8] hover:bg-[#EDE8D8] hover:text-[#0F0D09]'
          : 'border-[#0F0D09] text-[#0F0D09] hover:bg-[#0F0D09] hover:text-[#EDE8D8]'
      }`}
    >
      {children}
    </Link>
  );
}

// ═══════════════════════════════════════════════════════════════════════
export function RobomaniacStorePage() {
  const { data, isLoading } = useQuery({
    queryKey: ['robomaniac-products'],
    queryFn: () => componentApi.getComponents({ isRobomaniacItem: true, limit: 8, sortBy: 'name', sortOrder: 'asc' }),
  });

  return (
    <div style={{ backgroundColor: BG }} className="min-h-screen text-[#0F0D09]">

      {/* ── 1. HERO ─────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1200px] px-6 pb-20 pt-24 lg:pt-32">
        <div className="grid items-center gap-16 lg:grid-cols-[1fr_420px]">

          {/* Left copy */}
          <FadeUp>
            <SectionLabel>STEM Store</SectionLabel>

            <h1 className="font-serif text-[3.8rem] font-normal leading-[1.08] tracking-tight sm:text-[5rem] lg:text-[5.5rem]">
              Build.<br />
              Learn.<br />
              <span className="text-[#8A8478]">Experiment.</span>
            </h1>

            <p className="mt-6 max-w-md text-base leading-7 text-[#5A5448]">
              Premium STEM hardware, curated learning kits, engineering books, and visual programming
              software — built for students, makers, and educators.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <BorderBtn href="/stem-store#kits">
                Explore Kits <ArrowRight className="h-4 w-4" />
              </BorderBtn>
              <BorderBtn href="/components?category=Development+Boards">
                Browse Boards
              </BorderBtn>
            </div>

            {/* Mini trust bar */}
            <div className="mt-10 flex flex-wrap items-center gap-6 border-t border-[#D8D3C2] pt-6">
              {[
                [Truck, 'Free shipping ₹499+'],
                [ShieldCheck, 'Warranty on all boards'],
                [Star, '4.9 / 5 from 300+ students'],
              ].map(([Icon, text]) => (
                <div key={String(text)} className="flex items-center gap-2 text-xs font-medium text-[#6A6458]">
                  <Icon className="h-3.5 w-3.5" />
                  {text as string}
                </div>
              ))}
            </div>
          </FadeUp>

          {/* Right — floating dark panel (reference match) */}
          <FadeUp delay={0.1}>
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="rounded-3xl p-5"
              style={{ backgroundColor: DARK }}
            >
              {/* Panel header */}
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-semibold text-white">STEM Catalog</span>
                <button className="flex h-7 w-7 items-center justify-center rounded-full border border-[#3A342E] text-[#6A6458] hover:border-[#5A544E] hover:text-[#8A8478] transition-colors">
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Stacked rows — exact reference spacing */}
              <div className="flex flex-col gap-1.5">
                {HERO_ROWS.map((row) => (
                  <DarkRow key={row.label} {...row} />
                ))}
              </div>

              {/* Annotation */}
              <div className="mt-4 flex items-center gap-2 border-t border-[#1A1612] pt-4">
                <Terminal className="h-3.5 w-3.5 shrink-0 text-[#4A4438]" />
                <span className="text-[11px] font-mono text-[#4A4438]">
                  roboroot.in/stem-store
                </span>
              </div>
            </motion.div>
          </FadeUp>
        </div>
      </section>

      {/* ── 2. CATEGORY GRID ────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1200px] px-6 pb-24">
        <FadeUp>
          <SectionLabel>What we sell</SectionLabel>
          <h2 className="font-serif text-4xl font-normal">Browse by category</h2>
        </FadeUp>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <FadeUp key={cat.label} delay={i * 0.05}>
                <Link href={cat.href} className="group block">
                  <div
                    className="rounded-2xl border-2 p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_6px_24px_rgba(0,0,0,0.07)]"
                    style={{ borderColor: DARK, backgroundColor: BG }}
                  >
                    {/* Icon */}
                    <div className="flex items-start justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#D8D3C2]">
                        <Icon className="h-5 w-5" strokeWidth={1.5} />
                      </div>
                      <span className="rounded-lg border border-[#D8D3C2] px-2 py-1 text-[10px] font-semibold text-[#8A8478]">
                        {cat.count}
                      </span>
                    </div>

                    <h3 className="mt-4 text-lg font-semibold">{cat.label}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-[#6A6458]">{cat.desc}</p>

                    {/* Arrow slides in */}
                    <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-[#8A8478] transition-all duration-200 group-hover:gap-2 group-hover:text-[#0F0D09]">
                      Explore <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </Link>
              </FadeUp>
            );
          })}
        </div>
      </section>

      {/* ── 3. FEATURED PRODUCTS (dark section) ─────────────────────── */}
      <section style={{ backgroundColor: DARK }} className="py-24">
        <div className="mx-auto max-w-[1200px] px-6">

          <FadeUp>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-[#6A6458]">
                  Store Products
                </p>
                <h2 className="font-serif text-4xl font-normal text-white">Featured catalog</h2>
              </div>
              <Link
                href="/components?isRobomaniacItem=true"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#8A8478] transition-colors hover:text-white"
              >
                View all products <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </FadeUp>

          {/* Product list rows inside dark panel */}
          <div className="mt-10 rounded-3xl p-5" style={{ backgroundColor: '#17140F' }}>
            {isLoading ? (
              <div className="py-16 text-center">
                <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[#C8780A] border-t-transparent" />
              </div>
            ) : data?.components && data.components.length > 0 ? (
              <div className="flex flex-col gap-1.5">
                {data.components.slice(0, 6).map((product, i) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Link href={`/components/${product.slug}`} className="group">
                      <div className={`flex items-center gap-4 rounded-xl border px-4 py-3 transition-colors ${i === 1 ? 'border-[#C8780A]/40 bg-[#C8780A]/12' : 'border-[#2A2420] hover:border-[#3A342E]'}`}>
                        {/* Image thumb */}
                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-[#2A2420]">
                          {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-[#1A1612]">
                              <CircuitBoard className="h-4 w-4 text-[#4A4438]" strokeWidth={1.5} />
                            </div>
                          )}
                        </div>

                        <div className="flex min-w-0 flex-1 flex-col">
                          <span className={`text-sm font-medium leading-snug line-clamp-1 ${i === 1 ? 'text-[#E8960E]' : 'text-[#C8C2B4] group-hover:text-white'} transition-colors`}>
                            {product.name}
                          </span>
                          <span className="text-[11px] text-[#5A5448]">{product.subcategory ?? product.category}</span>
                        </div>

                        <span className={`shrink-0 font-semibold ${i === 1 ? 'text-[#C8780A]' : 'text-[#8A8478]'}`}>
                          {formatPrice(product.unitPriceCents)}
                        </span>

                        <ChevronRight className="h-4 w-4 shrink-0 text-[#3A342E] transition-all group-hover:translate-x-0.5 group-hover:text-[#6A6458]" />
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            ) : (
              /* Fallback static rows when API has no data */
              <div className="flex flex-col gap-1.5">
                {[
                  { name: 'ESP32 AI Development Board',    cat: 'Custom Board',  price: '₹1,499', featured: false },
                  { name: 'Robotics Starter Kit — Level 1',cat: 'DIY Kit',       price: '₹3,299', featured: true  },
                  { name: 'IoT Sensor Bundle (12-Pack)',    cat: 'Sensor Module', price: '₹2,199', featured: false },
                  { name: 'Blocksquare Pro License',       cat: 'Software',      price: '₹1,999', featured: false },
                  { name: 'Embedded Systems Handbook',     cat: 'Book',          price: '₹699',   featured: false },
                ].map((p, i) => (
                  <motion.div
                    key={p.name}
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div className={`flex items-center gap-4 rounded-xl border px-4 py-3 ${p.featured ? 'border-[#C8780A]/40 bg-[#C8780A]/12' : 'border-[#2A2420]'}`}>
                      <div className="h-10 w-10 shrink-0 flex items-center justify-center rounded-lg border border-[#2A2420] bg-[#1A1612]">
                        <CircuitBoard className="h-4 w-4 text-[#4A4438]" strokeWidth={1.5} />
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span className={`text-sm font-medium leading-snug ${p.featured ? 'text-[#E8960E]' : 'text-[#C8C2B4]'}`}>{p.name}</span>
                        <span className="text-[11px] text-[#5A5448]">{p.cat}</span>
                      </div>
                      {p.featured && <span className="shrink-0 text-[10px] font-semibold text-[#C8780A]/80 uppercase tracking-wider">Most popular</span>}
                      <span className={`shrink-0 font-semibold ${p.featured ? 'text-[#C8780A]' : 'text-[#8A8478]'}`}>{p.price}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* View all CTA inside dark panel */}
            <div className="mt-4 border-t border-[#1A1612] pt-4">
              <Link
                href="/components?isRobomaniacItem=true"
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#2A2420] py-2.5 text-sm font-semibold text-[#6A6458] transition-colors hover:border-[#C8780A] hover:text-[#C8780A]"
              >
                View full catalog <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Product image cards grid below */}
          {data?.components && data.components.length > 0 && (
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {data.components.slice(0, 4).map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── 4. WHY CHOOSE US ─────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1200px] px-6 py-24">
        <FadeUp>
          <SectionLabel>Why STEM Store</SectionLabel>
          <h2 className="font-serif text-4xl font-normal">Engineering, simplified.</h2>
        </FadeUp>

        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {WHY.map((w, i) => (
            <FadeUp key={w.n} delay={i * 0.06}>
              <div className="rounded-2xl border-2 p-5 transition-all duration-300 hover:-translate-y-0.5" style={{ borderColor: DARK }}>
                <span className="text-3xl font-light text-[#D8D3C2]">{w.n}</span>
                <h3 className="mt-3 text-sm font-semibold leading-snug">{w.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-[#6A6458]">{w.desc}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ── 5. BLOCKSQUARE SECTION (dark) ───────────────────────────── */}
      <section style={{ backgroundColor: DARK }} className="py-24">
        <div className="mx-auto max-w-[1200px] px-6">
          <div className="grid gap-16 lg:grid-cols-2">

            {/* Left — copy */}
            <FadeUp>
              <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-[#6A6458]">
                Blocksquare Software
              </p>
              <h2 className="font-serif text-4xl font-normal leading-tight text-white">
                Code your robot.<br />
                <span className="text-[#6A6458]">No syntax errors.</span>
              </h2>
              <p className="mt-5 text-sm leading-7 text-[#8A8478]">
                Blocksquare is a visual programming environment built specifically for STEM education.
                Drag, drop, and deploy — directly to your Arduino, ESP32, or MicroPython board.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <BorderBtn href="/stem-store" dark>
                  Get Blocksquare <ArrowRight className="h-4 w-4" />
                </BorderBtn>
                <Link href="#" className="inline-flex h-11 items-center gap-2 px-5 text-sm font-semibold text-[#6A6458] transition-colors hover:text-[#8A8478]">
                  See demo →
                </Link>
              </div>
            </FadeUp>

            {/* Right — dark panel with feature rows */}
            <FadeUp delay={0.1}>
              <div className="rounded-3xl p-5" style={{ backgroundColor: '#17140F' }}>
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">Blocksquare Features</span>
                  <span className="rounded-lg border border-[#2A2420] px-2.5 py-1 text-[10px] font-semibold text-[#6A6458]">
                    v4.2
                  </span>
                </div>

                <div className="flex flex-col gap-1.5">
                  {BS_ROWS.map((row) => (
                    <DarkRow key={row.label} label={row.label} note={row.note} highlight={row.highlight} />
                  ))}
                </div>

                <div className="mt-4 flex items-center gap-2 border-t border-[#1A1612] pt-4">
                  <Terminal className="h-3.5 w-3.5 shrink-0 text-[#4A4438]" />
                  <span className="text-[11px] font-mono text-[#4A4438]">
                    blocksquare.io — ships with every STEM kit
                  </span>
                </div>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ── 6. COMMUNITY & LEARNING ──────────────────────────────────── */}
      <section className="mx-auto max-w-[1200px] px-6 py-24">
        <FadeUp>
          <SectionLabel>Community</SectionLabel>
          <h2 className="font-serif text-4xl font-normal">
            Learning never stops.
          </h2>
          <p className="mt-3 max-w-lg text-sm leading-7 text-[#6A6458]">
            From first circuit to final-year project — STEM Store has the tutorials, documentation,
            and community to take you further.
          </p>
        </FadeUp>

        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {COMMUNITY.map((c, i) => {
            const Icon = c.icon;
            return (
              <FadeUp key={c.label} delay={i * 0.05}>
                <Link href={c.href} className="group block">
                  <div className="rounded-2xl border border-[#D8D3C2] p-5 transition-all duration-300 hover:border-[#0F0D09] hover:-translate-y-0.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#D8D3C2]">
                      <Icon className="h-4 w-4" strokeWidth={1.5} />
                    </div>
                    <h3 className="mt-4 text-base font-semibold">{c.label}</h3>
                    <p className="mt-1 text-sm text-[#6A6458]">{c.desc}</p>
                    <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-[#8A8478] transition-all duration-200 group-hover:gap-2 group-hover:text-[#0F0D09]">
                      Join <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </Link>
              </FadeUp>
            );
          })}
        </div>
      </section>

      {/* ── 7. BOTTOM CTA STRIP ──────────────────────────────────────── */}
      <section className="border-t border-[#D8D3C2]">
        <div className="mx-auto max-w-[1200px] px-6 py-16 text-center">
          <FadeUp>
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-[#8A8478]">
              Ready to build?
            </p>
            <h2 className="font-serif text-4xl font-normal">Start your STEM journey.</h2>
            <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-[#6A6458]">
              Browse the full STEM catalog — boards, kits, books, and software — all in one place.
            </p>
            <div className="mt-8 flex justify-center gap-3">
              <BorderBtn href="/components?isRobomaniacItem=true">
                Shop all products <ArrowRight className="h-4 w-4" />
              </BorderBtn>
              <BorderBtn href="/categories">
                Browse categories
              </BorderBtn>
            </div>
          </FadeUp>
        </div>
      </section>

    </div>
  );
}

// Re-export ChevronRight so it doesn't get tree-shaken (used inline)
function ChevronRight({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
