"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  CircuitBoard,
  FileUp,
  Layers,
  PackageCheck,
  Ruler,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { MagicCard } from "@/components/ui/magic-card";
import { useAuthStore } from "@/store/user.store";
import { submitPcbQuote } from "@/features/pcb/services/pcb.service";

const SURFACE_FINISHES = ["HASL", "HASL (Lead-free)", "ENIG", "OSP", "Immersion Silver"];
const COPPER_WEIGHTS = ["1oz (35µm)", "2oz (70µm)", "3oz (105µm)"];

const FEATURES = [
  { icon: Layers, title: "Up to 12 Layers", desc: "Single-sided to complex multilayer boards" },
  { icon: Ruler, title: "Precision Sizing", desc: "Custom dimensions from 5×5mm to 400×400mm" },
  { icon: Zap, title: "Fast Turnaround", desc: "5–7 business day standard, 2-day express" },
  { icon: PackageCheck, title: "Quality Assured", desc: "IPC Class 2 compliance, 100% E-test" },
];

const initialForm = {
  boardLayers: 2,
  boardSizeX: 100,
  boardSizeY: 100,
  quantity: 10,
  surfaceFinish: "HASL",
  copperWeight: "1oz (35µm)",
  gerberFileUrl: "",
  notes: "",
};

export function PcbPage() {
  const { isAuthenticated } = useAuthStore();
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isAuthenticated) { toast.error("Please login to submit a quote request"); return; }

    setIsSubmitting(true);
    try {
      await submitPcbQuote({
        ...form,
        boardLayers: Number(form.boardLayers),
        boardSizeX: Number(form.boardSizeX),
        boardSizeY: Number(form.boardSizeY),
        quantity: Number(form.quantity),
      });
      setSubmitted(true);
      toast.success("Quote request submitted! We'll get back to you within 24 hours.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit quote");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f2f2f0]">
      {/* Hero */}
      <div className="bg-[#222222] rounded-b-[2.5rem] px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-2 mb-4">
            <CircuitBoard className="h-4 w-4 text-[var(--brand-primary)]" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
              PCB Services
            </span>
          </div>
          <h1 className="text-4xl font-bold text-white md:text-6xl tracking-tight max-w-3xl">
            Custom PCB Fabrication
          </h1>
          <p className="mt-4 text-zinc-400 text-base max-w-xl">
            From prototype to production — high-quality PCBs designed and manufactured to your exact specifications.
            Upload your Gerber files and get an instant quote.
          </p>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-6 py-12 space-y-12">
        {/* Feature cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.06 }}
            >
              <MagicCard
                className="rounded-2xl h-full [--color-background:#ffffff]"
                gradientFrom="var(--brand-primary)"
                gradientTo="#E8E8E6"
                gradientColor="var(--brand-primary)"
                gradientOpacity={0.06}
              >
                <div className="p-5 space-y-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E8E8E6]">
                    <Icon className="h-5 w-5 text-[#222222]" />
                  </div>
                  <h3 className="font-bold text-[#222222]">{title}</h3>
                  <p className="text-xs text-zinc-500 leading-5">{desc}</p>
                </div>
              </MagicCard>
            </motion.div>
          ))}
        </div>

        {/* Quote form */}
        <div className="grid lg:grid-cols-[minmax(0,1fr)_380px] gap-8 items-start">
          <div>
            <h2 className="text-2xl font-bold text-[#222222] mb-6">Request a Quote</h2>

            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <MagicCard
                  className="rounded-2xl [--color-background:#ffffff]"
                  gradientFrom="var(--brand-primary)"
                  gradientTo="#E8E8E6"
                  gradientColor="var(--brand-primary)"
                  gradientOpacity={0.07}
                >
                  <div className="flex flex-col items-center gap-5 p-14 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 border border-emerald-200">
                      <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-[#222222]">Quote Submitted!</h3>
                      <p className="mt-2 text-sm text-zinc-500 max-w-sm">
                        Our team will review your specifications and send you a detailed quote within 24 hours.
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <button
                        onClick={() => { setSubmitted(false); setForm(initialForm); }}
                        className="h-10 rounded-xl border border-[#D2D2D0] px-5 text-sm font-semibold text-zinc-600 hover:border-[#222222] hover:text-[#222222] transition-colors"
                      >
                        Submit Another
                      </button>
                      <Link
                        href="/profile"
                        className="h-10 rounded-xl bg-[#222222] px-5 text-sm font-bold text-white hover:bg-[var(--brand-primary)] transition-colors flex items-center justify-center gap-2"
                      >
                        View My Quotes <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </MagicCard>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit}>
                <MagicCard
                  className="rounded-2xl [--color-background:#ffffff]"
                  gradientFrom="var(--brand-primary)"
                  gradientTo="#E8E8E6"
                  gradientColor="var(--brand-primary)"
                  gradientOpacity={0.05}
                >
                  <div className="p-6 space-y-6">
                    {/* Board specs */}
                    <div>
                      <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-[0.15em] mb-4">
                        Board Specifications
                      </h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <label className="space-y-1.5">
                          <span className="text-xs font-semibold text-zinc-500">Layers</span>
                          <select
                            value={form.boardLayers}
                            onChange={(e) => set("boardLayers", Number(e.target.value))}
                            className="w-full h-11 rounded-xl border border-[#D2D2D0] bg-[#F2F2F0] px-3 text-sm font-medium text-[#222222] outline-none focus:border-[var(--brand-primary)] focus:bg-white"
                          >
                            {[1, 2, 4, 6, 8, 10, 12].map((n) => (
                              <option key={n} value={n}>{n} Layer{n > 1 ? "s" : ""}</option>
                            ))}
                          </select>
                        </label>
                        <label className="space-y-1.5">
                          <span className="text-xs font-semibold text-zinc-500">Quantity (pieces)</span>
                          <input
                            type="number"
                            min={1}
                            max={10000}
                            value={form.quantity}
                            onChange={(e) => set("quantity", Number(e.target.value))}
                            required
                            className="w-full h-11 rounded-xl border border-[#D2D2D0] bg-[#F2F2F0] px-3 text-sm font-medium text-[#222222] outline-none focus:border-[var(--brand-primary)] focus:bg-white"
                          />
                        </label>
                        <label className="space-y-1.5">
                          <span className="text-xs font-semibold text-zinc-500">Width (mm)</span>
                          <input
                            type="number"
                            min={5}
                            max={400}
                            value={form.boardSizeX}
                            onChange={(e) => set("boardSizeX", Number(e.target.value))}
                            required
                            className="w-full h-11 rounded-xl border border-[#D2D2D0] bg-[#F2F2F0] px-3 text-sm font-medium text-[#222222] outline-none focus:border-[var(--brand-primary)] focus:bg-white"
                          />
                        </label>
                        <label className="space-y-1.5">
                          <span className="text-xs font-semibold text-zinc-500">Height (mm)</span>
                          <input
                            type="number"
                            min={5}
                            max={400}
                            value={form.boardSizeY}
                            onChange={(e) => set("boardSizeY", Number(e.target.value))}
                            required
                            className="w-full h-11 rounded-xl border border-[#D2D2D0] bg-[#F2F2F0] px-3 text-sm font-medium text-[#222222] outline-none focus:border-[var(--brand-primary)] focus:bg-white"
                          />
                        </label>
                        <label className="space-y-1.5">
                          <span className="text-xs font-semibold text-zinc-500">Surface Finish</span>
                          <select
                            value={form.surfaceFinish}
                            onChange={(e) => set("surfaceFinish", e.target.value)}
                            className="w-full h-11 rounded-xl border border-[#D2D2D0] bg-[#F2F2F0] px-3 text-sm font-medium text-[#222222] outline-none focus:border-[var(--brand-primary)] focus:bg-white"
                          >
                            {SURFACE_FINISHES.map((f) => (
                              <option key={f} value={f}>{f}</option>
                            ))}
                          </select>
                        </label>
                        <label className="space-y-1.5">
                          <span className="text-xs font-semibold text-zinc-500">Copper Weight</span>
                          <select
                            value={form.copperWeight}
                            onChange={(e) => set("copperWeight", e.target.value)}
                            className="w-full h-11 rounded-xl border border-[#D2D2D0] bg-[#F2F2F0] px-3 text-sm font-medium text-[#222222] outline-none focus:border-[var(--brand-primary)] focus:bg-white"
                          >
                            {COPPER_WEIGHTS.map((w) => (
                              <option key={w} value={w}>{w}</option>
                            ))}
                          </select>
                        </label>
                      </div>
                    </div>

                    {/* Gerber file */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-500 flex items-center gap-1.5">
                        <FileUp className="h-3.5 w-3.5" />
                        Gerber File URL (optional)
                      </label>
                      <input
                        type="url"
                        value={form.gerberFileUrl}
                        onChange={(e) => set("gerberFileUrl", e.target.value)}
                        placeholder="https://drive.google.com/... or any public link"
                        className="w-full h-11 rounded-xl border border-[#D2D2D0] bg-[#F2F2F0] px-3 text-sm font-medium text-[#222222] outline-none focus:border-[var(--brand-primary)] focus:bg-white placeholder:text-zinc-400 placeholder:font-normal"
                      />
                      <p className="text-[11px] text-zinc-400">
                        Upload your Gerber ZIP to Google Drive, Dropbox, or WeTransfer and paste the link.
                      </p>
                    </div>

                    {/* Notes */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-500">Notes (optional)</label>
                      <textarea
                        value={form.notes}
                        onChange={(e) => set("notes", e.target.value)}
                        placeholder="Special requirements, stackup, impedance control, silkscreen color..."
                        className="w-full min-h-24 rounded-xl border border-[#D2D2D0] bg-[#F2F2F0] px-3 py-3 text-sm font-medium text-[#222222] outline-none focus:border-[var(--brand-primary)] focus:bg-white placeholder:text-zinc-400 placeholder:font-normal resize-none"
                      />
                    </div>

                    {!isAuthenticated && (
                      <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-xs font-medium text-amber-700">
                        You need to{" "}
                        <Link href="/login?redirect=/pcb" className="underline font-bold">
                          login
                        </Link>{" "}
                        to submit a quote request.
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting || !isAuthenticated}
                      className="w-full h-12 rounded-xl bg-[#222222] text-sm font-bold text-white hover:bg-[var(--brand-primary)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? "Submitting..." : (
                        <>Submit Quote Request <ArrowRight className="h-4 w-4" /></>
                      )}
                    </button>
                  </div>
                </MagicCard>
              </form>
            )}
          </div>

          {/* Info sidebar */}
          <div className="space-y-4 lg:sticky lg:top-24">
            <MagicCard
              className="rounded-2xl [--color-background:#ffffff]"
              gradientFrom="var(--brand-primary)"
              gradientTo="#E8E8E6"
              gradientColor="var(--brand-primary)"
              gradientOpacity={0.06}
            >
              <div className="p-5 space-y-4">
                <h3 className="font-bold text-[#222222]">How it works</h3>
                <ol className="space-y-3">
                  {[
                    "Fill in your board specs and submit the form",
                    "Our team reviews and sends you a detailed quote",
                    "Approve the quote and make payment",
                    "Production starts, boards shipped to your door",
                  ].map((step, i) => (
                    <li key={i} className="flex gap-3 text-sm text-zinc-600">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--brand-primary)] text-[10px] font-bold text-white mt-0.5">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            </MagicCard>

            <MagicCard
              className="rounded-2xl [--color-background:#ffffff]"
              gradientFrom="var(--brand-primary)"
              gradientTo="#E8E8E6"
              gradientColor="var(--brand-primary)"
              gradientOpacity={0.04}
            >
              <div className="p-5 space-y-3">
                <h3 className="font-bold text-[#222222]">Pricing guide</h3>
                <div className="space-y-2 text-xs text-zinc-500">
                  <div className="flex justify-between">
                    <span>2-layer, 100×100mm, 10 pcs</span>
                    <span className="font-semibold text-[#222222]">₹800–1,200</span>
                  </div>
                  <div className="flex justify-between">
                    <span>4-layer, 100×100mm, 10 pcs</span>
                    <span className="font-semibold text-[#222222]">₹2,000–3,500</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ENIG finish premium</span>
                    <span className="font-semibold text-[#222222]">+30–50%</span>
                  </div>
                </div>
                <p className="text-[11px] text-zinc-400">Exact pricing in your quote within 24 hrs.</p>
              </div>
            </MagicCard>

            <div className="rounded-2xl border border-[#D2D2D0] bg-white p-5 space-y-2">
              <p className="text-sm font-bold text-[#222222]">Need help?</p>
              <p className="text-xs text-zinc-500">
                Email us at{" "}
                <a href="mailto:pcb@roboroot.in" className="text-[var(--brand-primary)] font-semibold hover:underline">
                  pcb@roboroot.in
                </a>{" "}
                or reach out via the{" "}
                <Link href="/contact" className="text-[var(--brand-primary)] font-semibold hover:underline">
                  contact page
                </Link>.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
