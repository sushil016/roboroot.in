"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, BookOpen } from "lucide-react";
import { labelEnum } from "../support.constants";
import { supportApi } from "../support.service";

export function KnowledgeArticlePage() {
  const params = useParams<{ slug: string }>();
  const slug = typeof params.slug === "string" ? params.slug : "";
  const articleQuery = useQuery({
    queryKey: ["support-article", slug],
    queryFn: () => supportApi.getArticle(slug),
    enabled: Boolean(slug),
    staleTime: 10 * 60 * 1000,
  });

  if (articleQuery.isLoading) {
    return <div className="mx-auto min-h-[60vh] max-w-3xl px-4 py-16"><div className="h-7 w-2/3 animate-pulse rounded bg-zinc-100" /><div className="mt-8 h-56 animate-pulse rounded-lg bg-zinc-100" /></div>;
  }

  if (!articleQuery.data) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 text-center">
        <BookOpen className="h-8 w-8 text-zinc-300" />
        <h1 className="mt-4 text-2xl font-black">Article not found</h1>
        <Link href="/help" className="mt-5 text-sm font-bold text-[var(--brand-primary)] hover:underline">Back to Help Center</Link>
      </div>
    );
  }

  const article = articleQuery.data;
  return (
    <div className="min-h-screen bg-white px-4 py-12 sm:px-6 sm:py-16">
      <article className="mx-auto max-w-3xl">
        <Link href="/help" className="inline-flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-[var(--brand-primary)]">
          <ArrowLeft className="h-4 w-4" /> Help Center
        </Link>
        <p className="mt-10 text-xs font-bold uppercase text-[var(--brand-primary)]">{labelEnum(article.category)}</p>
        <h1 className="mt-3 text-3xl font-black leading-tight text-[#0f172a] sm:text-4xl">{article.title}</h1>
        <p className="mt-4 text-base leading-7 text-zinc-500">{article.excerpt}</p>
        <div className="my-8 h-px bg-zinc-200" />
        <div className="space-y-5 text-[15px] leading-8 text-zinc-700">
          {article.content.split(/\n{2,}/).map((paragraph, index) => <p key={index} className="whitespace-pre-line">{paragraph}</p>)}
        </div>
        <div className="mt-12 border-t border-zinc-200 pt-8">
          <h2 className="text-lg font-black">Didn&apos;t solve the issue?</h2>
          <p className="mt-2 text-sm text-zinc-500">Send the details to RoboRoot Support and track the response online.</p>
          <Link href="/support/new" className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-[#222222] px-4 text-xs font-bold text-white hover:bg-[var(--brand-primary)]">
            Create a ticket <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </article>
    </div>
  );
}
