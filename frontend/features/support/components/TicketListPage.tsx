"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Clock3, LifeBuoy, Plus, Search } from "lucide-react";
import { useAuthStore } from "@/store/user.store";
import { labelEnum, statusLabels, ticketEmailStorageKey } from "../support.constants";
import { supportApi } from "../support.service";
import type { TicketStatus } from "../types";

const statusClass: Record<TicketStatus, string> = {
  OPEN: "border-sky-200 bg-sky-50 text-sky-700",
  IN_PROGRESS: "border-indigo-200 bg-indigo-50 text-indigo-700",
  WAITING_FOR_CUSTOMER: "border-amber-200 bg-amber-50 text-amber-700",
  RESOLVED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  CLOSED: "border-zinc-200 bg-zinc-100 text-zinc-600",
};

export function TicketListPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [ticketNumber, setTicketNumber] = useState("");
  const [email, setEmail] = useState("");
  const ticketsQuery = useQuery({
    queryKey: ["my-support-tickets"],
    queryFn: supportApi.getMyTickets,
    enabled: isAuthenticated,
    staleTime: 30 * 1000,
  });

  function track(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = ticketNumber.trim().toUpperCase();
    if (!normalized) return;
    if (email.trim()) sessionStorage.setItem(ticketEmailStorageKey(normalized), email.trim().toLowerCase());
    router.push(`/support/tickets/${encodeURIComponent(normalized)}`);
  }

  return (
    <div className="min-h-screen bg-[#f7f8f8] px-4 py-10 sm:px-6 sm:py-14">
      <div className="mx-auto max-w-4xl">
        <header className="flex flex-col gap-5 border-b border-zinc-200 pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-[var(--brand-primary)]">Customer support</p>
            <h1 className="mt-2 text-3xl font-black text-[#0f172a] sm:text-4xl">Support tickets</h1>
            <p className="mt-2 text-sm text-zinc-500">Track responses and continue your conversations with the support team.</p>
          </div>
          <Link href="/support/new" className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#222222] px-4 text-xs font-bold text-white hover:bg-[var(--brand-primary)]">
            <Plus className="h-4 w-4" /> New ticket
          </Link>
        </header>

        <section className="mt-8 rounded-lg border border-zinc-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <Search className="h-5 w-5 text-[var(--brand-primary)]" />
            <div><h2 className="text-sm font-black">Find a ticket</h2><p className="text-xs text-zinc-500">Use the ticket number from your confirmation email.</p></div>
          </div>
          <form onSubmit={track} className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
            <input required value={ticketNumber} onChange={(event) => setTicketNumber(event.target.value)} placeholder="RR-202609-XXXXXXXX" className="h-11 rounded-lg border border-zinc-300 px-3 font-mono text-sm outline-none focus:border-[var(--brand-primary)]" />
            {!isAuthenticated ? <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email used for this ticket" className="h-11 rounded-lg border border-zinc-300 px-3 text-sm outline-none focus:border-[var(--brand-primary)]" /> : <div className="hidden sm:block" />}
            <button className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-zinc-900 bg-zinc-900 px-5 text-sm font-bold text-white hover:bg-[var(--brand-primary)]">Track <ArrowRight className="h-4 w-4" /></button>
          </form>
        </section>

        {isAuthenticated ? (
          <section className="mt-10">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-black text-zinc-900">Your tickets</h2>
              <span className="text-xs font-semibold text-zinc-400">{ticketsQuery.data?.length || 0} total</span>
            </div>
            {ticketsQuery.isLoading ? (
              <div className="space-y-3">{[1, 2, 3].map((item) => <div key={item} className="h-28 animate-pulse rounded-lg bg-white" />)}</div>
            ) : ticketsQuery.data?.length ? (
              <div className="space-y-3">
                {ticketsQuery.data.map((ticket) => (
                  <Link key={ticket.id} href={`/support/tickets/${ticket.ticketNumber}`} className="group grid gap-4 rounded-lg border border-zinc-200 bg-white p-5 transition hover:border-zinc-400 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[var(--brand-primary)]">{ticket.ticketNumber}</span>
                        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black ${statusClass[ticket.status]}`}>{statusLabels[ticket.status]}</span>
                      </div>
                      <h3 className="mt-2 truncate font-black text-zinc-900 group-hover:text-[var(--brand-primary)]">{ticket.subject}</h3>
                      <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500">
                        <span>{labelEnum(ticket.category)}</span>
                        <span>{labelEnum(ticket.priority)} priority</span>
                        <span>{ticket._count?.messages || 0} updates</span>
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-5 border-t border-zinc-100 pt-3 sm:border-0 sm:pt-0">
                      <span className="inline-flex items-center gap-1.5 text-xs text-zinc-400"><Clock3 className="h-3.5 w-3.5" />{new Date(ticket.lastActivityAt).toLocaleDateString("en-IN")}</span>
                      <ArrowRight className="h-4 w-4 text-zinc-300 transition group-hover:translate-x-0.5 group-hover:text-[var(--brand-primary)]" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-zinc-300 bg-white px-5 py-12 text-center">
                <LifeBuoy className="mx-auto h-7 w-7 text-zinc-300" />
                <h3 className="mt-3 font-bold">No support tickets yet</h3>
                <p className="mt-1 text-sm text-zinc-500">When you contact support, your requests will appear here.</p>
              </div>
            )}
          </section>
        ) : (
          <div className="mt-10 border-t border-zinc-200 pt-8 text-center">
            <p className="text-sm text-zinc-500"><Link href="/login?redirect=/support/tickets" className="font-bold text-[var(--brand-primary)] hover:underline">Sign in</Link> to see all tickets connected to your account automatically.</p>
          </div>
        )}
      </div>
    </div>
  );
}
