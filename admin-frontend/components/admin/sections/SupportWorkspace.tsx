"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Clock3,
  ExternalLink,
  FileEdit,
  Inbox,
  LifeBuoy,
  Loader2,
  MessageSquare,
  Plus,
  RefreshCw,
  Search,
  Send,
  Trash2,
  UserRoundCheck,
} from "lucide-react";
import {
  createKnowledgeArticle,
  deleteKnowledgeArticle,
  fetchKnowledgeArticles,
  fetchSupportAgents,
  fetchSupportTickets,
  replyToSupportTicket,
  updateKnowledgeArticle,
  updateSupportTicket,
} from "@/api/support";
import { STOREFRONT_URL } from "@/config/env";
import { useAdmin } from "@/core/context/AdminContext";
import type {
  AdminKnowledgeArticle,
  AdminSupportTicket,
  KnowledgeArticleInput,
  KnowledgeBaseCategory,
  SupportAgent,
  SupportTicketCategory,
  SupportTicketFilters,
  SupportTicketListData,
  SupportTicketPriority,
  SupportTicketStatus,
} from "@/types";

const emptyTickets: SupportTicketListData = {
  tickets: [],
  summary: { total: 0, open: 0, breached: 0, unassigned: 0 },
  pagination: { page: 1, limit: 30, total: 0, totalPages: 1 },
};
const initialFilters: SupportTicketFilters = { page: 1, limit: 30 };
const statuses: SupportTicketStatus[] = ["OPEN", "IN_PROGRESS", "WAITING_FOR_CUSTOMER", "RESOLVED", "CLOSED"];
const priorities: SupportTicketPriority[] = ["URGENT", "HIGH", "MEDIUM", "LOW"];
const ticketCategories: SupportTicketCategory[] = ["ORDER", "SHIPPING", "RETURNS_REFUNDS", "PRODUCT", "TECHNICAL", "OTHER"];
const articleCategories: KnowledgeBaseCategory[] = ["GENERAL", "SHIPPING", "RETURNS", "PRODUCT", "TROUBLESHOOTING"];

const emptyArticle: KnowledgeArticleInput = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  category: "GENERAL",
  status: "DRAFT",
  isFeatured: false,
  sortOrder: 0,
};

function label(value: string) {
  return value.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function priorityClass(priority: SupportTicketPriority) {
  if (priority === "URGENT") return "border-red-200 bg-red-50 text-red-700";
  if (priority === "HIGH") return "border-orange-200 bg-orange-50 text-orange-700";
  if (priority === "MEDIUM") return "border-sky-200 bg-sky-50 text-sky-700";
  return "border-zinc-200 bg-zinc-100 text-zinc-600";
}

function statusClass(status: SupportTicketStatus) {
  if (status === "RESOLVED") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (status === "WAITING_FOR_CUSTOMER") return "border-amber-200 bg-amber-50 text-amber-700";
  if (status === "CLOSED") return "border-zinc-200 bg-zinc-100 text-zinc-600";
  return "border-blue-200 bg-blue-50 text-blue-700";
}

function slaState(ticket: AdminSupportTicket) {
  const now = Date.now();
  const responseDue = new Date(ticket.firstResponseDueAt).getTime();
  const resolutionDue = new Date(ticket.resolutionDueAt).getTime();
  const active = !["RESOLVED", "CLOSED"].includes(ticket.status);
  if ((!ticket.firstRespondedAt && responseDue < now) || (!ticket.resolvedAt && active && resolutionDue < now)) return "BREACHED";
  const nextDue = !ticket.firstRespondedAt ? responseDue : active ? resolutionDue : Infinity;
  if (nextDue - now <= 4 * 60 * 60 * 1000) return "DUE_SOON";
  return "ON_TRACK";
}

export function SupportWorkspace() {
  const { token, setStatus, setIsLoading, isLoading } = useAdmin();
  const [tab, setTab] = useState<"TICKETS" | "ARTICLES">("TICKETS");
  const [filters, setFilters] = useState<SupportTicketFilters>(initialFilters);
  const [data, setData] = useState<SupportTicketListData>(emptyTickets);
  const [agents, setAgents] = useState<SupportAgent[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [articles, setArticles] = useState<AdminKnowledgeArticle[]>([]);
  const [editingArticle, setEditingArticle] = useState<AdminKnowledgeArticle | null>(null);
  const [draft, setDraft] = useState<KnowledgeArticleInput>(emptyArticle);

  const selected = useMemo(() => data.tickets.find((ticket) => ticket.id === selectedId) || null, [data.tickets, selectedId]);

  const loadTickets = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const [ticketData, supportAgents] = await Promise.all([
        fetchSupportTickets(filters, token),
        agents.length ? Promise.resolve(agents) : fetchSupportAgents(token),
      ]);
      setData(ticketData);
      setAgents(supportAgents);
      setStatus("Support queue loaded");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not load support tickets");
    } finally {
      setIsLoading(false);
    }
  }, [agents, filters, setIsLoading, setStatus, token]);

  const loadArticles = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      setArticles(await fetchKnowledgeArticles(token));
      setStatus("Knowledge base loaded");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not load Help Center articles");
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading, setStatus, token]);

  useEffect(() => {
    if (tab !== "TICKETS") return;
    const timer = window.setTimeout(() => void loadTickets(), filters.search ? 250 : 0);
    return () => window.clearTimeout(timer);
  }, [filters.search, loadTickets, tab]);

  useEffect(() => {
    if (tab === "ARTICLES") void loadArticles();
  }, [loadArticles, tab]);

  function changeFilters(patch: Partial<SupportTicketFilters>) {
    setFilters((current) => ({ ...current, ...patch, page: patch.page ?? 1 }));
  }

  function replaceTicket(ticket: AdminSupportTicket) {
    setData((current) => ({ ...current, tickets: current.tickets.map((item) => item.id === ticket.id ? ticket : item) }));
  }

  async function changeTicket(changes: Partial<Pick<AdminSupportTicket, "status" | "priority" | "assignedToId">>) {
    if (!token || !selected) return;
    setIsLoading(true);
    try {
      replaceTicket(await updateSupportTicket(selected.id, changes, token));
      setStatus(`Updated ${selected.ticketNumber}`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not update ticket");
    } finally {
      setIsLoading(false);
    }
  }

  async function sendReply() {
    if (!token || !selected || reply.trim().length < 2) return;
    setIsLoading(true);
    try {
      replaceTicket(await replyToSupportTicket(selected.id, reply.trim(), isInternal, token));
      setReply("");
      setIsInternal(false);
      setStatus(isInternal ? "Internal note added" : "Reply sent to customer");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not send reply");
    } finally {
      setIsLoading(false);
    }
  }

  function editArticle(article: AdminKnowledgeArticle | null) {
    setEditingArticle(article);
    setDraft(article ? {
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      content: article.content,
      category: article.category,
      status: article.status,
      isFeatured: article.isFeatured,
      sortOrder: article.sortOrder,
    } : emptyArticle);
  }

  async function saveArticle() {
    if (!token) return;
    setIsLoading(true);
    try {
      const saved = editingArticle
        ? await updateKnowledgeArticle(editingArticle.id, draft, token)
        : await createKnowledgeArticle(draft, token);
      setArticles((current) => editingArticle
        ? current.map((article) => article.id === saved.id ? saved : article)
        : [...current, saved]);
      setEditingArticle(saved);
      setDraft({ ...draft, slug: saved.slug });
      setStatus(`Saved ${saved.title}`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not save article");
    } finally {
      setIsLoading(false);
    }
  }

  async function removeArticle(article: AdminKnowledgeArticle) {
    if (!token || !window.confirm(`Delete "${article.title}"?`)) return;
    setIsLoading(true);
    try {
      await deleteKnowledgeArticle(article.id, token);
      setArticles((current) => current.filter((item) => item.id !== article.id));
      if (editingArticle?.id === article.id) editArticle(null);
      setStatus("Help article deleted");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not delete article");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 border-b border-zinc-300 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="admin-eyebrow">Customer experience</p>
          <h2 className="mt-1 text-2xl font-black text-[#222222]">Support workspace</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">Manage customer conversations, response targets, and the public Help Center.</p>
        </div>
        <div className="flex gap-2">
          <a href={`${STOREFRONT_URL}/help`} target="_blank" rel="noreferrer" className="admin-button admin-button-secondary"><ExternalLink className="h-4 w-4" />Open Help Center</a>
          <button type="button" onClick={() => void (tab === "TICKETS" ? loadTickets() : loadArticles())} className="admin-button admin-button-primary" disabled={isLoading}><RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />Refresh</button>
        </div>
      </section>

      <div className="inline-flex rounded-md border border-zinc-300 bg-white p-1">
        <button type="button" onClick={() => setTab("TICKETS")} className={`inline-flex h-9 items-center gap-2 rounded px-4 text-xs font-bold ${tab === "TICKETS" ? "bg-[#222222] text-white" : "text-zinc-600 hover:bg-zinc-100"}`}><LifeBuoy className="h-4 w-4" />Tickets</button>
        <button type="button" onClick={() => setTab("ARTICLES")} className={`inline-flex h-9 items-center gap-2 rounded px-4 text-xs font-bold ${tab === "ARTICLES" ? "bg-[#222222] text-white" : "text-zinc-600 hover:bg-zinc-100"}`}><BookOpen className="h-4 w-4" />Knowledge Base</button>
      </div>

      {tab === "TICKETS" ? (
        <>
          <section className="grid gap-px overflow-hidden rounded-lg border border-zinc-200 bg-zinc-200 sm:grid-cols-2 xl:grid-cols-4">
            <Stat icon={<Inbox className="h-5 w-5" />} label="Open tickets" value={data.summary.open} />
            <Stat icon={<AlertTriangle className="h-5 w-5" />} label="SLA breached" value={data.summary.breached} danger />
            <Stat icon={<UserRoundCheck className="h-5 w-5" />} label="Unassigned" value={data.summary.unassigned} />
            <Stat icon={<MessageSquare className="h-5 w-5" />} label="All tickets" value={data.summary.total} />
          </section>

          <section className="grid gap-3 rounded-lg border border-zinc-200 bg-white p-4 lg:grid-cols-[minmax(220px,1fr)_170px_150px_180px_140px]">
            <label className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" /><input value={filters.search || ""} onChange={(event) => changeFilters({ search: event.target.value || undefined })} placeholder="Ticket, customer, order..." className="admin-input w-full pl-9" /></label>
            <Filter value={filters.status || ""} label="All statuses" values={statuses} onChange={(value) => changeFilters({ status: (value || undefined) as SupportTicketStatus | undefined })} />
            <Filter value={filters.priority || ""} label="All priorities" values={priorities} onChange={(value) => changeFilters({ priority: (value || undefined) as SupportTicketPriority | undefined })} />
            <Filter value={filters.category || ""} label="All categories" values={ticketCategories} onChange={(value) => changeFilters({ category: (value || undefined) as SupportTicketCategory | undefined })} />
            <Filter value={filters.sla || ""} label="Any SLA" values={["BREACHED", "DUE_SOON"]} onChange={(value) => changeFilters({ sla: (value || undefined) as SupportTicketFilters["sla"] })} />
          </section>

          <section className="grid min-h-[620px] overflow-hidden rounded-lg border border-zinc-200 bg-white lg:grid-cols-[390px_minmax(0,1fr)]">
            <div className="border-b border-zinc-200 lg:border-b-0 lg:border-r">
              <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3"><p className="text-xs font-black uppercase text-zinc-500">Queue</p><span className="text-xs text-zinc-400">{data.pagination.total} tickets</span></div>
              <div className="max-h-[720px] overflow-y-auto divide-y divide-zinc-100">
                {data.tickets.map((ticket) => {
                  const sla = slaState(ticket);
                  return (
                    <button key={ticket.id} type="button" onClick={() => setSelectedId(ticket.id)} className={`w-full p-4 text-left transition hover:bg-zinc-50 ${selectedId === ticket.id ? "bg-zinc-50 shadow-[inset_3px_0_0_var(--color-zinc-900)]" : ""}`}>
                      <div className="flex items-start justify-between gap-3"><span className="font-mono text-[11px] font-bold text-zinc-500">{ticket.ticketNumber}</span><span className={`rounded-full border px-2 py-0.5 text-[9px] font-black ${priorityClass(ticket.priority)}`}>{label(ticket.priority)}</span></div>
                      <h3 className="mt-2 line-clamp-2 text-sm font-black leading-5 text-zinc-900">{ticket.subject}</h3>
                      <p className="mt-1 truncate text-xs text-zinc-500">{ticket.requesterName} · {ticket.requesterEmail}</p>
                      <div className="mt-3 flex items-center justify-between gap-2"><span className={`rounded-full border px-2 py-0.5 text-[9px] font-black ${statusClass(ticket.status)}`}>{label(ticket.status)}</span><span className={`inline-flex items-center gap-1 text-[10px] font-bold ${sla === "BREACHED" ? "text-red-600" : sla === "DUE_SOON" ? "text-amber-600" : "text-zinc-400"}`}><Clock3 className="h-3 w-3" />{label(sla)}</span></div>
                    </button>
                  );
                })}
                {!isLoading && !data.tickets.length ? <div className="p-10 text-center text-sm font-semibold text-zinc-500">No tickets match these filters.</div> : null}
              </div>
              <div className="flex items-center justify-between border-t border-zinc-200 p-3"><button className="admin-action" disabled={filters.page <= 1} onClick={() => changeFilters({ page: filters.page - 1 })}><ArrowLeft className="h-3.5 w-3.5" />Previous</button><span className="text-xs font-bold text-zinc-500">{data.pagination.page}/{data.pagination.totalPages}</span><button className="admin-action" disabled={filters.page >= data.pagination.totalPages} onClick={() => changeFilters({ page: filters.page + 1 })}>Next<ArrowRight className="h-3.5 w-3.5" /></button></div>
            </div>

            {selected ? (
              <div className="min-w-0">
                <div className="border-b border-zinc-200 p-5">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div><p className="font-mono text-xs font-bold text-zinc-500">{selected.ticketNumber}</p><h2 className="mt-1 text-xl font-black text-zinc-900">{selected.subject}</h2><p className="mt-2 text-xs text-zinc-500">{selected.requesterName} · {selected.requesterEmail}</p></div>
                    <div className="grid gap-2 sm:grid-cols-3 xl:w-[540px]">
                      <select value={selected.status} onChange={(event) => void changeTicket({ status: event.target.value as SupportTicketStatus })} className="admin-input"><option disabled>Status</option>{statuses.map((item) => <option key={item} value={item}>{label(item)}</option>)}</select>
                      <select value={selected.priority} onChange={(event) => void changeTicket({ priority: event.target.value as SupportTicketPriority })} className="admin-input"><option disabled>Priority</option>{priorities.map((item) => <option key={item} value={item}>{label(item)}</option>)}</select>
                      <select value={selected.assignedToId || ""} onChange={(event) => void changeTicket({ assignedToId: event.target.value || null })} className="admin-input"><option value="">Unassigned</option>{agents.map((agent) => <option key={agent.id} value={agent.id}>{agent.name || agent.email}</option>)}</select>
                    </div>
                  </div>
                  <div className="mt-5 grid gap-px overflow-hidden rounded-md border border-zinc-200 bg-zinc-200 sm:grid-cols-4">
                    <Meta label="Category" value={label(selected.category)} />
                    <Meta label="First response" value={selected.firstRespondedAt ? new Date(selected.firstRespondedAt).toLocaleString("en-IN") : new Date(selected.firstResponseDueAt).toLocaleString("en-IN")} danger={!selected.firstRespondedAt && new Date(selected.firstResponseDueAt).getTime() < Date.now()} />
                    <Meta label="Resolve by" value={selected.resolvedAt ? "Completed" : new Date(selected.resolutionDueAt).toLocaleString("en-IN")} danger={!selected.resolvedAt && new Date(selected.resolutionDueAt).getTime() < Date.now()} />
                    <Meta label="Order" value={selected.orderId ? `#${selected.orderId.slice(-10)}` : "Not linked"} />
                  </div>
                </div>

                <div className="max-h-[455px] overflow-y-auto divide-y divide-zinc-100 px-5">
                  {selected.messages.map((message) => (
                    <article key={message.id} className={`py-4 ${message.isInternal ? "bg-amber-50/60 -mx-5 px-5" : ""}`}>
                      <div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2"><span className={`grid h-7 w-7 place-items-center rounded-full text-[9px] font-black ${message.sender === "CUSTOMER" ? "bg-zinc-100" : "bg-emerald-50 text-emerald-700"}`}>{message.isInternal ? "NOTE" : message.sender === "CUSTOMER" ? "CUS" : message.sender === "SYSTEM" ? "SYS" : "RR"}</span><div><p className="text-xs font-black">{message.authorName || label(message.sender)}</p><p className="text-[10px] text-zinc-400">{message.isInternal ? "Internal note" : label(message.sender)}</p></div></div><time className="text-[10px] text-zinc-400">{new Date(message.createdAt).toLocaleString("en-IN")}</time></div>
                      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-zinc-600">{message.body}</p>
                    </article>
                  ))}
                </div>

                <div className="border-t border-zinc-200 bg-zinc-50 p-4">
                  <textarea value={reply} onChange={(event) => setReply(event.target.value)} placeholder={isInternal ? "Add a note visible only to administrators..." : "Write a reply to the customer..."} className="admin-textarea w-full" rows={4} />
                  <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><label className="inline-flex cursor-pointer items-center gap-2 text-xs font-bold text-zinc-600"><input type="checkbox" checked={isInternal} onChange={(event) => setIsInternal(event.target.checked)} className="h-4 w-4 accent-zinc-900" />Internal note</label><button type="button" onClick={() => void sendReply()} disabled={isLoading || reply.trim().length < 2} className="admin-button admin-button-primary">{isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}{isInternal ? "Add note" : "Send reply"}</button></div>
                </div>
              </div>
            ) : (
              <div className="grid min-h-[520px] place-items-center p-8 text-center"><div><MessageSquare className="mx-auto h-8 w-8 text-zinc-300" /><h2 className="mt-4 font-black">Select a ticket</h2><p className="mt-1 text-sm text-zinc-500">Open a customer request to view the conversation and respond.</p></div></div>
            )}
          </section>
        </>
      ) : (
        <section className="grid min-h-[680px] overflow-hidden rounded-lg border border-zinc-200 bg-white lg:grid-cols-[360px_minmax(0,1fr)]">
          <div className="border-b border-zinc-200 lg:border-b-0 lg:border-r">
            <div className="flex items-center justify-between border-b border-zinc-200 p-4"><div><p className="text-xs font-black uppercase text-zinc-500">Articles</p><p className="mt-1 text-xs text-zinc-400">{articles.length} entries</p></div><button type="button" onClick={() => editArticle(null)} className="admin-action"><Plus className="h-4 w-4" />New</button></div>
            <div className="max-h-[720px] overflow-y-auto divide-y divide-zinc-100">
              {articles.map((article) => (
                <button key={article.id} type="button" onClick={() => editArticle(article)} className={`w-full p-4 text-left hover:bg-zinc-50 ${editingArticle?.id === article.id ? "bg-zinc-50 shadow-[inset_3px_0_0_var(--color-zinc-900)]" : ""}`}>
                  <div className="flex items-start justify-between gap-3"><span className="text-[10px] font-black uppercase text-zinc-400">{label(article.category)}</span><span className={`rounded-full px-2 py-0.5 text-[9px] font-black ${article.status === "PUBLISHED" ? "bg-emerald-50 text-emerald-700" : "bg-zinc-100 text-zinc-600"}`}>{label(article.status)}</span></div>
                  <h3 className="mt-2 line-clamp-2 text-sm font-black text-zinc-900">{article.title}</h3>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-zinc-500">{article.excerpt}</p>
                  <p className="mt-2 text-[10px] text-zinc-400">{article.viewCount} views · /help/{article.slug}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="p-5 sm:p-7">
            <div className="flex items-start justify-between gap-4 border-b border-zinc-200 pb-5"><div><p className="admin-eyebrow">{editingArticle ? "Edit article" : "New article"}</p><h2 className="mt-1 text-xl font-black">{editingArticle?.title || "Add a Help Center answer"}</h2></div>{editingArticle ? <button type="button" onClick={() => void removeArticle(editingArticle)} className="admin-action text-red-600"><Trash2 className="h-4 w-4" />Delete</button> : null}</div>
            <div className="mt-6 grid gap-5">
              <label className="grid gap-2 text-xs font-bold text-zinc-600">Title<input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} className="admin-input" placeholder="How do I..." /></label>
              <div className="grid gap-5 sm:grid-cols-2"><label className="grid gap-2 text-xs font-bold text-zinc-600">Category<select value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value as KnowledgeBaseCategory })} className="admin-input">{articleCategories.map((item) => <option key={item}>{item}</option>)}</select></label><label className="grid gap-2 text-xs font-bold text-zinc-600">Status<select value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value as "DRAFT" | "PUBLISHED" })} className="admin-input"><option value="DRAFT">Draft</option><option value="PUBLISHED">Published</option></select></label></div>
              <label className="grid gap-2 text-xs font-bold text-zinc-600">URL slug<input value={draft.slug} onChange={(event) => setDraft({ ...draft, slug: event.target.value })} className="admin-input font-mono" placeholder="generated-from-title" /></label>
              <label className="grid gap-2 text-xs font-bold text-zinc-600">Short answer<input value={draft.excerpt} onChange={(event) => setDraft({ ...draft, excerpt: event.target.value })} className="admin-input" placeholder="One sentence shown in search results" /></label>
              <label className="grid gap-2 text-xs font-bold text-zinc-600">Full answer<textarea value={draft.content} onChange={(event) => setDraft({ ...draft, content: event.target.value })} className="admin-textarea min-h-52" placeholder="Write the complete customer-facing answer..." /></label>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex flex-wrap gap-4"><label className="inline-flex items-center gap-2 text-xs font-bold text-zinc-600"><input type="checkbox" checked={draft.isFeatured} onChange={(event) => setDraft({ ...draft, isFeatured: event.target.checked })} className="h-4 w-4 accent-zinc-900" />Featured answer</label><label className="inline-flex items-center gap-2 text-xs font-bold text-zinc-600">Order<input type="number" min={0} max={10000} value={draft.sortOrder} onChange={(event) => setDraft({ ...draft, sortOrder: Number(event.target.value) })} className="admin-input w-24" /></label></div><button type="button" onClick={() => void saveArticle()} disabled={isLoading || draft.title.length < 5 || draft.excerpt.length < 10 || draft.content.length < 20} className="admin-button admin-button-primary">{isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : editingArticle ? <FileEdit className="h-4 w-4" /> : <Plus className="h-4 w-4" />}{editingArticle ? "Save changes" : "Create article"}</button></div>
              {editingArticle?.status === "PUBLISHED" ? <a href={`${STOREFRONT_URL}/help/${editingArticle.slug}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:underline"><ExternalLink className="h-3.5 w-3.5" />View published article</a> : null}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function Stat({ icon, label: title, value, danger = false }: { icon: React.ReactNode; label: string; value: number; danger?: boolean }) {
  return <div className="flex items-center gap-4 bg-white p-5"><span className={`grid h-10 w-10 place-items-center rounded-md ${danger ? "bg-red-50 text-red-600" : "bg-zinc-100 text-zinc-700"}`}>{icon}</span><div><p className="text-2xl font-black text-zinc-900">{value}</p><p className="text-xs font-bold text-zinc-500">{title}</p></div></div>;
}

function Meta({ label: title, value, danger = false }: { label: string; value: string; danger?: boolean }) {
  return <div className="min-w-0 bg-zinc-50 p-3"><p className="text-[9px] font-black uppercase text-zinc-400">{title}</p><p className={`mt-1 break-words text-xs font-bold ${danger ? "text-red-600" : "text-zinc-700"}`}>{value}</p></div>;
}

function Filter({ value, label: title, values, onChange }: { value: string; label: string; values: string[]; onChange: (value: string) => void }) {
  return <select value={value} onChange={(event) => onChange(event.target.value)} className="admin-input"><option value="">{title}</option>{values.map((item) => <option key={item} value={item}>{label(item)}</option>)}</select>;
}
