"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, CheckCircle2, LifeBuoy, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { orderApi } from "@/features/products/services/product.service";
import { useAuthStore } from "@/store/user.store";
import { priorityOptions, ticketCategories, ticketEmailStorageKey } from "../support.constants";
import { supportApi } from "../support.service";
import type { TicketCategory, TicketPriority } from "../types";

export function CreateTicketPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState<TicketCategory>("ORDER");
  const [priority, setPriority] = useState<TicketPriority>("MEDIUM");
  const [orderId, setOrderId] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email);
    }
  }, [user]);

  const ordersQuery = useQuery({
    queryKey: ["support-order-options"],
    queryFn: () => orderApi.getMyOrders(),
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000,
  });

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (description.trim().length < 20) {
      toast.error("Please add a little more detail so we can help");
      return;
    }
    setIsSubmitting(true);
    try {
      const ticket = await supportApi.createTicket({
        name: name.trim(),
        email: email.trim(),
        category,
        priority,
        subject: subject.trim(),
        description: description.trim(),
        ...(orderId ? { orderId } : {}),
      });
      sessionStorage.setItem(ticketEmailStorageKey(ticket.ticketNumber), email.trim().toLowerCase());
      toast.success(`Ticket ${ticket.ticketNumber} created`);
      router.push(`/support/tickets/${ticket.ticketNumber}?created=1`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create your ticket");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f8f8] px-4 py-10 sm:px-6 sm:py-14">
      <div className="mx-auto max-w-5xl">
        <Link href="/help" className="inline-flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-[var(--brand-primary)]">
          <ArrowLeft className="h-4 w-4" /> Help Center
        </Link>

        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px]">
          <section>
            <p className="text-xs font-bold uppercase text-[var(--brand-primary)]">Contact support</p>
            <h1 className="mt-2 text-3xl font-black text-[#0f172a] sm:text-4xl">Create a support ticket</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">Tell us what happened once. We&apos;ll keep replies, status, and response targets together under one ticket number.</p>

            <form onSubmit={submit} className="mt-8 space-y-6 rounded-lg border border-zinc-200 bg-white p-5 sm:p-7">
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-bold text-zinc-800">
                  Name
                  <input required minLength={2} maxLength={100} value={name} onChange={(event) => setName(event.target.value)} disabled={Boolean(user)} className="h-11 rounded-lg border border-zinc-300 px-3 text-sm font-medium outline-none focus:border-[var(--brand-primary)] disabled:bg-zinc-50 disabled:text-zinc-500" />
                </label>
                <label className="grid gap-2 text-sm font-bold text-zinc-800">
                  Email
                  <input required type="email" maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} disabled={Boolean(user)} className="h-11 rounded-lg border border-zinc-300 px-3 text-sm font-medium outline-none focus:border-[var(--brand-primary)] disabled:bg-zinc-50 disabled:text-zinc-500" />
                </label>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-bold text-zinc-800">
                  What do you need help with?
                  <select value={category} onChange={(event) => setCategory(event.target.value as TicketCategory)} className="h-11 rounded-lg border border-zinc-300 bg-white px-3 text-sm font-medium outline-none focus:border-[var(--brand-primary)]">
                    {ticketCategories.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                  </select>
                </label>
                <label className="grid gap-2 text-sm font-bold text-zinc-800">
                  Priority
                  <select value={priority} onChange={(event) => setPriority(event.target.value as TicketPriority)} className="h-11 rounded-lg border border-zinc-300 bg-white px-3 text-sm font-medium outline-none focus:border-[var(--brand-primary)]">
                    {priorityOptions.map((item) => <option key={item.value} value={item.value}>{item.label} - {item.response}</option>)}
                  </select>
                </label>
              </div>

              {isAuthenticated ? (
                <label className="grid gap-2 text-sm font-bold text-zinc-800">
                  Related order <span className="font-medium text-zinc-400">(optional)</span>
                  <select value={orderId} onChange={(event) => setOrderId(event.target.value)} className="h-11 rounded-lg border border-zinc-300 bg-white px-3 text-sm font-medium outline-none focus:border-[var(--brand-primary)]">
                    <option value="">No related order</option>
                    {ordersQuery.data?.map((order) => (
                      <option key={order.id} value={order.id}>#{order.id.slice(-12).toUpperCase()} - {new Date(order.createdAt).toLocaleDateString("en-IN")}</option>
                    ))}
                  </select>
                </label>
              ) : (
                <p className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-xs leading-5 text-zinc-600">
                  <Link href="/login?redirect=/support/new" className="font-bold text-[var(--brand-primary)] hover:underline">Sign in</Link> to select a related order automatically. Guest tickets are still fully trackable by email.
                </p>
              )}

              <label className="grid gap-2 text-sm font-bold text-zinc-800">
                Subject
                <input required minLength={5} maxLength={160} value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="A short summary of the issue" className="h-11 rounded-lg border border-zinc-300 px-3 text-sm font-medium outline-none placeholder:font-normal placeholder:text-zinc-400 focus:border-[var(--brand-primary)]" />
              </label>

              <label className="grid gap-2 text-sm font-bold text-zinc-800">
                Details
                <textarea required minLength={20} maxLength={5000} rows={7} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Include product names, what you expected, what happened, and anything you already tried." className="resize-y rounded-lg border border-zinc-300 px-3 py-3 text-sm font-medium leading-6 outline-none placeholder:font-normal placeholder:text-zinc-400 focus:border-[var(--brand-primary)]" />
                <span className="text-right text-[11px] font-medium text-zinc-400">{description.length}/5000</span>
              </label>

              <div className="flex flex-col-reverse gap-3 border-t border-zinc-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="max-w-md text-[11px] leading-5 text-zinc-500">We use these details only to handle your request, as described in our <Link href="/privacy-policy" target="_blank" className="font-bold text-[var(--brand-primary)] hover:underline">Privacy Policy</Link>.</p>
                <button disabled={isSubmitting} className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#222222] px-5 text-sm font-bold text-white transition-colors hover:bg-[var(--brand-primary)] disabled:cursor-not-allowed disabled:opacity-50">
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <LifeBuoy className="h-4 w-4" />}
                  {isSubmitting ? "Creating ticket..." : "Create ticket"}
                </button>
              </div>
            </form>
          </section>

          <aside className="space-y-6 lg:pt-24">
            <div className="border-l-2 border-[var(--brand-primary)] pl-5">
              <h2 className="font-black text-zinc-900">What happens next</h2>
              <div className="mt-5 space-y-5">
                {["A unique ticket number appears immediately", "An email confirms your request", "Status changes and replies stay in one thread"].map((item) => (
                  <div key={item} className="flex gap-3 text-sm leading-6 text-zinc-600"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-600" /><span>{item}</span></div>
                ))}
              </div>
            </div>
            <div className="border-t border-zinc-200 pt-5">
              <p className="text-xs font-bold uppercase text-zinc-400">Response target</p>
              <p className="mt-2 text-sm font-bold text-zinc-800">{priorityOptions.find((item) => item.value === priority)?.response}</p>
              <p className="mt-1 text-xs leading-5 text-zinc-500">Targets are tracked automatically and may vary during holidays or unusually high demand.</p>
            </div>
            <Link href="/support/tickets" className="inline-flex items-center gap-2 text-sm font-bold text-[var(--brand-primary)] hover:underline">Track an existing ticket <ArrowRight className="h-4 w-4" /></Link>
          </aside>
        </div>
      </div>
    </div>
  );
}
