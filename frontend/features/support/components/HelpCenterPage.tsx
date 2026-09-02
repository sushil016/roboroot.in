"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BookOpen,
  Box,
  ChevronDown,
  CircleHelp,
  LifeBuoy,
  PackageCheck,
  RotateCcw,
  Search,
  Settings2,
  Truck,
} from "lucide-react";
import { knowledgeCategories } from "../support.constants";
import { supportApi } from "../support.service";
import type { KnowledgeCategory } from "../types";

const categoryIcons: Record<KnowledgeCategory, typeof CircleHelp> = {
  GENERAL: CircleHelp,
  SHIPPING: Truck,
  RETURNS: RotateCcw,
  PRODUCT: Box,
  TROUBLESHOOTING: Settings2,
};

export function HelpCenterPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<KnowledgeCategory | "ALL">("ALL");
  const articlesQuery = useQuery({
    queryKey: ["support-knowledge-base"],
    queryFn: () => supportApi.getArticles(),
    staleTime: 10 * 60 * 1000,
  });

  const articles = useMemo(() => {
    const search = query.trim().toLowerCase();
    return (articlesQuery.data || []).filter((article) => {
      const categoryMatches = category === "ALL" || article.category === category;
      const searchMatches = !search || `${article.title} ${article.excerpt}`.toLowerCase().includes(search);
      return categoryMatches && searchMatches;
    });
  }, [articlesQuery.data, category, query]);

  return (
    <div className="min-h-screen bg-white text-[#0f172a]">
      <section className="border-b border-zinc-200 bg-[#f7f8f8] px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-5xl text-center">
          <div className="mx-auto grid h-11 w-11 place-items-center rounded-lg border border-zinc-200 bg-white text-[var(--brand-primary)]">
            <LifeBuoy className="h-5 w-5" />
          </div>
          <p className="mt-5 text-xs font-bold uppercase text-[var(--brand-primary)]">RoboRoot Support</p>
          <h1 className="mt-2 text-3xl font-black sm:text-5xl">How can we help?</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-zinc-600 sm:text-base">
            Find a quick answer or create a ticket when you need help from the team.
          </p>

          <label className="mx-auto mt-8 flex h-14 max-w-2xl items-center gap-3 rounded-lg border border-zinc-300 bg-white px-4 shadow-sm focus-within:border-[var(--brand-primary)]">
            <Search className="h-5 w-5 shrink-0 text-zinc-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search shipping, returns, products, troubleshooting..."
              className="min-w-0 flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-zinc-400"
            />
          </label>

          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Link href="/support/new" className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#222222] px-4 text-xs font-bold text-white transition-colors hover:bg-[var(--brand-primary)]">
              Create a ticket <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link href="/support/tickets" className="inline-flex h-10 items-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 text-xs font-bold text-zinc-800 transition-colors hover:border-zinc-500">
              Track a ticket
            </Link>
          </div>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {knowledgeCategories.map((item) => {
              const Icon = categoryIcons[item.value];
              const active = category === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setCategory(active ? "ALL" : item.value)}
                  className={`min-h-32 rounded-lg border p-4 text-left transition-all ${
                    active
                      ? "border-[var(--brand-primary)] bg-[var(--brand-primary)]/[0.04]"
                      : "border-zinc-200 bg-white hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-sm"
                  }`}
                >
                  <Icon className={`h-5 w-5 ${active ? "text-[var(--brand-primary)]" : "text-zinc-500"}`} />
                  <h2 className="mt-4 text-sm font-black">{item.label}</h2>
                  <p className="mt-1 text-xs leading-5 text-zinc-500">{item.description}</p>
                </button>
              );
            })}
          </div>

          <div className="mt-14 grid gap-10 lg:grid-cols-[minmax(0,1fr)_260px]">
            <div>
              <div className="flex items-end justify-between gap-4 border-b border-zinc-200 pb-4">
                <div>
                  <p className="text-xs font-bold uppercase text-[var(--brand-primary)]">Knowledge base</p>
                  <h2 className="mt-1 text-2xl font-black">
                    {query ? "Search results" : category === "ALL" ? "Popular answers" : knowledgeCategories.find((item) => item.value === category)?.label}
                  </h2>
                </div>
                <span className="text-xs font-semibold text-zinc-400">{articles.length} articles</span>
              </div>

              {articlesQuery.isLoading ? (
                <div className="space-y-3 py-5">
                  {[1, 2, 3, 4].map((item) => <div key={item} className="h-20 animate-pulse rounded-lg bg-zinc-100" />)}
                </div>
              ) : articlesQuery.isError ? (
                <div className="py-12 text-center text-sm font-semibold text-red-600">The Help Center could not be loaded. Please try again.</div>
              ) : articles.length === 0 ? (
                <div className="py-14 text-center">
                  <BookOpen className="mx-auto h-7 w-7 text-zinc-300" />
                  <h3 className="mt-3 font-bold">No matching answers</h3>
                  <p className="mt-1 text-sm text-zinc-500">Try a shorter search or ask the support team.</p>
                  <Link href="/support/new" className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-[var(--brand-primary)] hover:underline">Create a ticket <ArrowRight className="h-4 w-4" /></Link>
                </div>
              ) : (
                <div className="divide-y divide-zinc-200">
                  {articles.map((article) => (
                    <Link key={article.id} href={`/help/${article.slug}`} className="group flex items-center justify-between gap-5 py-5">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-zinc-900 transition-colors group-hover:text-[var(--brand-primary)]">{article.title}</h3>
                          {article.isFeatured ? <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-black uppercase text-emerald-700">Popular</span> : null}
                        </div>
                        <p className="mt-1 line-clamp-2 text-sm leading-6 text-zinc-500">{article.excerpt}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 shrink-0 text-zinc-300 transition group-hover:translate-x-0.5 group-hover:text-[var(--brand-primary)]" />
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <aside className="border-l border-zinc-200 pl-6 lg:sticky lg:top-28 lg:self-start">
              <PackageCheck className="h-5 w-5 text-[var(--brand-primary)]" />
              <h2 className="mt-4 text-lg font-black">Still need help?</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-500">Create one ticket and keep every update in a single conversation.</p>
              <Link href="/support/new" className="mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#222222] px-4 text-xs font-bold text-white hover:bg-[var(--brand-primary)]">
                Contact support <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <div className="mt-6 border-t border-zinc-200 pt-5">
                <p className="text-xs font-bold text-zinc-700">Already contacted us?</p>
                <Link href="/support/tickets" className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-[var(--brand-primary)] hover:underline">
                  View ticket updates <ChevronDown className="h-3.5 w-3.5 -rotate-90" />
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}
