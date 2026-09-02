"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Check, Clock3, LifeBuoy, Loader2, LockKeyhole, MessageSquare, Send } from "lucide-react";
import { toast } from "sonner";
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

function duration(start: string, end: string) {
  const minutes = Math.max(1, Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000));
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.round(minutes / 60);
  return `${hours} hr`;
}

export function TicketDetailPage() {
  const params = useParams<{ ticketNumber: string }>();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();
  const ticketNumber = typeof params.ticketNumber === "string" ? decodeURIComponent(params.ticketNumber).toUpperCase() : "";
  const [email, setEmail] = useState("");
  const [accessEmail, setAccessEmail] = useState("");
  const [reply, setReply] = useState("");
  const [isReplying, setIsReplying] = useState(false);

  useEffect(() => {
    if (!ticketNumber || isAuthenticated) return;
    const saved = sessionStorage.getItem(ticketEmailStorageKey(ticketNumber));
    if (saved) setAccessEmail(saved);
  }, [isAuthenticated, ticketNumber]);

  const canLoad = Boolean(ticketNumber && (isAuthenticated || accessEmail));
  const ticketQuery = useQuery({
    queryKey: ["support-ticket", ticketNumber, accessEmail, isAuthenticated],
    queryFn: () => supportApi.trackTicket(ticketNumber, isAuthenticated ? undefined : accessEmail),
    enabled: canLoad,
    retry: false,
  });

  function unlock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = email.trim().toLowerCase();
    sessionStorage.setItem(ticketEmailStorageKey(ticketNumber), normalized);
    setAccessEmail(normalized);
  }

  async function sendReply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!reply.trim()) return;
    setIsReplying(true);
    try {
      const ticket = await supportApi.reply(ticketNumber, reply.trim(), isAuthenticated ? undefined : accessEmail);
      queryClient.setQueryData(["support-ticket", ticketNumber, accessEmail, isAuthenticated], ticket);
      void queryClient.invalidateQueries({ queryKey: ["my-support-tickets"] });
      setReply("");
      toast.success("Reply sent");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not send your reply");
    } finally {
      setIsReplying(false);
    }
  }

  if (!canLoad) {
    return (
      <div className="min-h-[70vh] bg-[#f7f8f8] px-4 py-14">
        <form onSubmit={unlock} className="mx-auto max-w-md rounded-lg border border-zinc-200 bg-white p-7">
          <LockKeyhole className="h-6 w-6 text-[var(--brand-primary)]" />
          <h1 className="mt-5 text-2xl font-black text-zinc-900">Open your ticket</h1>
          <p className="mt-2 text-sm leading-6 text-zinc-500">For privacy, enter the email used when creating <span className="font-mono font-bold text-zinc-700">{ticketNumber}</span>.</p>
          <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="mt-6 h-11 w-full rounded-lg border border-zinc-300 px-3 text-sm outline-none focus:border-[var(--brand-primary)]" />
          <button className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#222222] text-sm font-bold text-white hover:bg-[var(--brand-primary)]">View ticket</button>
          <Link href="/support/tickets" className="mt-5 block text-center text-xs font-bold text-zinc-500 hover:text-[var(--brand-primary)]">Back to ticket search</Link>
        </form>
      </div>
    );
  }

  if (ticketQuery.isLoading) {
    return <div className="flex min-h-[65vh] items-center justify-center bg-[#f7f8f8]"><Loader2 className="h-6 w-6 animate-spin text-[var(--brand-primary)]" /></div>;
  }

  if (!ticketQuery.data) {
    return (
      <div className="min-h-[65vh] bg-[#f7f8f8] px-4 py-14 text-center">
        <LifeBuoy className="mx-auto h-8 w-8 text-zinc-300" />
        <h1 className="mt-4 text-2xl font-black">Ticket could not be opened</h1>
        <p className="mt-2 text-sm text-zinc-500">{ticketQuery.error instanceof Error ? ticketQuery.error.message : "Check the ticket number and email address."}</p>
        {!isAuthenticated ? <button onClick={() => { setAccessEmail(""); setEmail(""); }} className="mt-5 text-sm font-bold text-[var(--brand-primary)] hover:underline">Try another email</button> : null}
      </div>
    );
  }

  const ticket = ticketQuery.data;
  const isClosed = ticket.status === "CLOSED";
  const responseBreached = !ticket.firstRespondedAt && new Date(ticket.firstResponseDueAt).getTime() < Date.now();
  const resolutionBreached = !ticket.resolvedAt && !["RESOLVED", "CLOSED"].includes(ticket.status) && new Date(ticket.resolutionDueAt).getTime() < Date.now();

  return (
    <div className="min-h-screen bg-[#f7f8f8] px-4 py-10 sm:px-6 sm:py-14">
      <div className="mx-auto max-w-5xl">
        <Link href="/support/tickets" className="inline-flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-[var(--brand-primary)]"><ArrowLeft className="h-4 w-4" /> Support tickets</Link>

        {searchParams.get("created") === "1" ? (
          <div className="mt-6 flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            <Check className="mt-0.5 h-4 w-4 shrink-0" /><div><p className="font-black">Ticket created successfully</p><p className="mt-0.5 text-xs">We sent the ticket number and tracking link to {ticket.requesterEmail}.</p></div>
          </div>
        ) : null}

        <header className="mt-7 border-b border-zinc-200 pb-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="font-mono text-xs font-bold text-[var(--brand-primary)]">{ticket.ticketNumber}</p>
              <h1 className="mt-2 text-2xl font-black leading-tight text-[#0f172a] sm:text-3xl">{ticket.subject}</h1>
              <p className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs font-medium text-zinc-500"><span>{labelEnum(ticket.category)}</span><span>{labelEnum(ticket.priority)} priority</span><span>Created {new Date(ticket.createdAt).toLocaleString("en-IN")}</span></p>
            </div>
            <span className={`w-fit rounded-full border px-3 py-1 text-xs font-black ${statusClass[ticket.status]}`}>{statusLabels[ticket.status]}</span>
          </div>
        </header>

        <section className="grid gap-px overflow-hidden rounded-lg border border-zinc-200 bg-zinc-200 sm:grid-cols-3 mt-7">
          <div className="bg-white p-4"><p className="text-[10px] font-bold uppercase text-zinc-400">First response</p><p className={`mt-1 text-sm font-black ${responseBreached ? "text-red-600" : "text-zinc-800"}`}>{ticket.firstRespondedAt ? `Met in ${duration(ticket.createdAt, ticket.firstRespondedAt)}` : responseBreached ? "Target passed" : `By ${new Date(ticket.firstResponseDueAt).toLocaleString("en-IN")}`}</p></div>
          <div className="bg-white p-4"><p className="text-[10px] font-bold uppercase text-zinc-400">Resolution target</p><p className={`mt-1 text-sm font-black ${resolutionBreached ? "text-red-600" : "text-zinc-800"}`}>{ticket.resolvedAt ? `Resolved ${new Date(ticket.resolvedAt).toLocaleDateString("en-IN")}` : resolutionBreached ? "Target passed" : new Date(ticket.resolutionDueAt).toLocaleString("en-IN")}</p></div>
          <div className="bg-white p-4"><p className="text-[10px] font-bold uppercase text-zinc-400">Assigned to</p><p className="mt-1 text-sm font-black text-zinc-800">{ticket.assignedTo?.name || "Support queue"}</p></div>
        </section>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_260px]">
          <section className="rounded-lg border border-zinc-200 bg-white">
            <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4"><div className="flex items-center gap-2"><MessageSquare className="h-4 w-4 text-[var(--brand-primary)]" /><h2 className="text-sm font-black">Conversation</h2></div><span className="text-xs text-zinc-400">{ticket.messages?.length || 0} updates</span></div>
            <div className="divide-y divide-zinc-100 px-5">
              {ticket.messages?.map((message) => (
                <article key={message.id} className="py-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-2"><span className={`grid h-7 w-7 place-items-center rounded-full text-[10px] font-black ${message.sender === "CUSTOMER" ? "bg-zinc-100 text-zinc-700" : message.sender === "SYSTEM" ? "bg-sky-50 text-sky-700" : "bg-emerald-50 text-emerald-700"}`}>{message.sender === "CUSTOMER" ? "YOU" : message.sender === "SYSTEM" ? "SYS" : "RR"}</span><div><p className="text-xs font-black text-zinc-800">{message.authorName || labelEnum(message.sender)}</p><p className="text-[10px] text-zinc-400">{labelEnum(message.sender)}</p></div></div>
                    <time className="shrink-0 text-[10px] text-zinc-400">{new Date(message.createdAt).toLocaleString("en-IN")}</time>
                  </div>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-zinc-600">{message.body}</p>
                </article>
              ))}
            </div>
            {!isClosed ? (
              <form onSubmit={sendReply} className="border-t border-zinc-200 bg-zinc-50 p-4">
                <textarea value={reply} onChange={(event) => setReply(event.target.value)} rows={4} maxLength={5000} placeholder="Add a reply or more information..." className="w-full resize-y rounded-lg border border-zinc-300 bg-white p-3 text-sm leading-6 outline-none focus:border-[var(--brand-primary)]" />
                <div className="mt-3 flex items-center justify-between gap-3"><span className="text-[10px] text-zinc-400">Replies are also shared with the support team.</span><button disabled={isReplying || reply.trim().length < 2} className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#222222] px-4 text-xs font-bold text-white hover:bg-[var(--brand-primary)] disabled:opacity-40">{isReplying ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}Send reply</button></div>
              </form>
            ) : <p className="border-t border-zinc-200 bg-zinc-50 p-4 text-center text-xs font-semibold text-zinc-500">This ticket is closed. Create a new ticket for further help.</p>}
          </section>

          <aside className="space-y-5">
            <div className="border-l-2 border-[var(--brand-primary)] pl-4"><p className="text-xs font-bold uppercase text-zinc-400">Requester</p><p className="mt-2 text-sm font-black text-zinc-800">{ticket.requesterName}</p><p className="mt-1 break-all text-xs text-zinc-500">{ticket.requesterEmail}</p></div>
            {ticket.order ? <div className="border-t border-zinc-200 pt-5"><p className="text-xs font-bold uppercase text-zinc-400">Related order</p><Link href={`/orders/${ticket.order.id}`} className="mt-2 inline-flex font-mono text-xs font-bold text-[var(--brand-primary)] hover:underline">#{ticket.order.id.slice(-12).toUpperCase()}</Link><p className="mt-1 text-xs text-zinc-500">{labelEnum(ticket.order.status)}</p></div> : null}
            <div className="border-t border-zinc-200 pt-5"><div className="flex items-center gap-2 text-xs font-bold text-zinc-700"><Clock3 className="h-4 w-4 text-zinc-400" />Last activity</div><p className="mt-2 text-xs text-zinc-500">{new Date(ticket.lastActivityAt).toLocaleString("en-IN")}</p></div>
            <Link href="/help" className="inline-flex text-xs font-bold text-[var(--brand-primary)] hover:underline">Browse Help Center</Link>
          </aside>
        </div>
      </div>
    </div>
  );
}
