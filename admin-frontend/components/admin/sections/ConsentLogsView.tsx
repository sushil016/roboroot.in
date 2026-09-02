"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Cookie,
  Download,
  FileCheck2,
  RefreshCw,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import type {
  ConsentAction,
  ConsentFilters,
  ConsentListData,
  ConsentRecord,
  ConsentSource,
  ConsentType,
} from "@/types";

const consentTypes: Array<{ value: ConsentType; label: string }> = [
  { value: "TERMS_AND_PRIVACY", label: "Terms & Privacy" },
  { value: "CHECKOUT_POLICIES", label: "Checkout Policies" },
  { value: "COOKIE_PREFERENCES", label: "Cookie Preferences" },
];

const consentSources: ConsentSource[] = [
  "REGISTRATION",
  "LOGIN",
  "OAUTH",
  "CHECKOUT",
  "THREE_D_PRINTING_CHECKOUT",
  "COOKIE_BANNER",
  "COOKIE_SETTINGS",
];

const consentActions: ConsentAction[] = ["GRANTED", "UPDATED", "WITHDRAWN"];

function label(value: string) {
  return value.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function actionClass(action: ConsentAction) {
  if (action === "WITHDRAWN") return "bg-rose-50 text-rose-700 ring-rose-200";
  if (action === "UPDATED") return "bg-amber-50 text-amber-700 ring-amber-200";
  return "bg-emerald-50 text-emerald-700 ring-emerald-200";
}

function RecordDetail({ record, onClose }: { record: ConsentRecord; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-zinc-950/35 backdrop-blur-sm">
      <button type="button" aria-label="Close consent details" className="absolute inset-0" onClick={onClose} />
      <aside className="relative h-full w-full max-w-xl overflow-y-auto bg-white shadow-2xl">
        <header className="sticky top-0 flex items-start justify-between border-b border-zinc-200 bg-white/95 p-6 backdrop-blur">
          <div>
            <p className="admin-eyebrow">Consent record</p>
            <h2 className="mt-1 text-xl font-black text-[#222222]">{label(record.type)}</h2>
            <p className="mt-1 font-mono text-xs text-zinc-500">{record.id}</p>
          </div>
          <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-md border border-zinc-200 text-zinc-500 hover:bg-zinc-100" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="space-y-8 p-6">
          <section>
            <h3 className="text-sm font-black text-[#222222]">Event</h3>
            <dl className="mt-3 grid grid-cols-2 gap-x-5 gap-y-4 text-sm">
              <Detail label="Action" value={label(record.action)} />
              <Detail label="Source" value={label(record.source)} />
              <Detail label="Recorded" value={new Date(record.createdAt).toLocaleString("en-IN")} />
              <Detail label="Policy version" value={record.policyVersion} mono />
            </dl>
          </section>

          <section className="border-t border-zinc-200 pt-6">
            <h3 className="text-sm font-black text-[#222222]">Identity and context</h3>
            <dl className="mt-3 grid gap-4 text-sm sm:grid-cols-2">
              <Detail label="User" value={record.user?.name || "Anonymous visitor"} />
              <Detail label="Email" value={record.user?.email || "Not linked"} />
              <Detail label="Anonymous ID" value={record.anonymousId || "Not provided"} mono />
              <Detail label="Order ID" value={record.orderId || "Not linked"} mono />
              <Detail label="IP address" value={record.ipAddress || "Not captured"} mono />
              <Detail label="Order status" value={record.order?.status ? label(record.order.status) : "Not linked"} />
            </dl>
          </section>

          {record.preferences ? (
            <section className="border-t border-zinc-200 pt-6">
              <h3 className="text-sm font-black text-[#222222]">Cookie choices</h3>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {Object.entries(record.preferences).map(([name, enabled]) => (
                  <div key={name} className="flex items-center justify-between border border-zinc-200 px-3 py-2 text-sm">
                    <span className="font-semibold text-zinc-600">{label(name)}</span>
                    <span className={enabled ? "font-bold text-emerald-700" : "font-bold text-zinc-400"}>{enabled ? "Allowed" : "Declined"}</span>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <section className="border-t border-zinc-200 pt-6">
            <h3 className="text-sm font-black text-[#222222]">Policy versions</h3>
            <dl className="mt-3 grid gap-2">
              {Object.entries(record.policyVersions).map(([name, version]) => (
                <div key={name} className="flex items-center justify-between gap-4 text-sm">
                  <dt className="text-zinc-500">{label(name)}</dt>
                  <dd className="font-mono font-bold text-zinc-800">{version}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="border-t border-zinc-200 pt-6">
            <h3 className="text-sm font-black text-[#222222]">Browser user agent</h3>
            <p className="mt-3 break-words bg-zinc-50 p-3 font-mono text-xs leading-5 text-zinc-600">{record.userAgent || "Not captured"}</p>
          </section>
        </div>
      </aside>
    </div>
  );
}

function Detail({ label: title, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-bold uppercase text-zinc-400">{title}</dt>
      <dd className={`mt-1 break-words font-semibold text-zinc-800 ${mono ? "font-mono text-xs" : ""}`}>{value}</dd>
    </div>
  );
}

export function ConsentLogsView({
  data,
  filters,
  isLoading,
  onFiltersChange,
  onRefresh,
  onExport,
}: {
  data: ConsentListData;
  filters: ConsentFilters;
  isLoading: boolean;
  onFiltersChange: (filters: ConsentFilters) => void;
  onRefresh: () => void;
  onExport: () => void;
}) {
  const [selected, setSelected] = useState<ConsentRecord | null>(null);
  const change = (patch: Partial<ConsentFilters>) => onFiltersChange({ ...filters, ...patch, page: patch.page ?? 1 });

  return (
    <div className="space-y-6">
      {selected ? <RecordDetail record={selected} onClose={() => setSelected(null)} /> : null}

      <section className="flex flex-col gap-4 border-b border-zinc-300 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="admin-eyebrow">Legal and privacy</p>
          <h2 className="mt-1 text-2xl font-black text-[#222222]">Consent audit log</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">Review policy acceptance, checkout acknowledgements, and cookie preference changes. Records are append-only audit events.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={onRefresh} className="admin-button admin-button-secondary" disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />Refresh
          </button>
          <button type="button" onClick={onExport} className="admin-button admin-button-primary">
            <Download className="h-4 w-4" />Export CSV
          </button>
        </div>
      </section>

      <section className="grid gap-px overflow-hidden border border-zinc-200 bg-zinc-200 sm:grid-cols-3">
        <Stat icon={<ShieldCheck className="h-5 w-5" />} label="All records" value={data.summary.total} />
        <Stat icon={<FileCheck2 className="h-5 w-5" />} label="Terms & checkout" value={(data.summary.byType.TERMS_AND_PRIVACY || 0) + (data.summary.byType.CHECKOUT_POLICIES || 0)} />
        <Stat icon={<Cookie className="h-5 w-5" />} label="Cookie events" value={data.summary.byType.COOKIE_PREFERENCES || 0} />
      </section>

      <section className="admin-card overflow-hidden">
        <div className="grid gap-3 border-b border-zinc-200 p-4 lg:grid-cols-[minmax(220px,1fr)_180px_180px_150px_140px_140px]">
          <label className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input value={filters.search || ""} onChange={(event) => change({ search: event.target.value || undefined })} placeholder="User, email, order, IP..." className="admin-input w-full pl-9" />
          </label>
          <FilterSelect value={filters.type || ""} onChange={(value) => change({ type: (value || undefined) as ConsentType | undefined })} label="All event types" options={consentTypes.map((type) => ({ value: type.value, label: type.label }))} />
          <FilterSelect value={filters.source || ""} onChange={(value) => change({ source: (value || undefined) as ConsentSource | undefined })} label="All sources" options={consentSources.map((source) => ({ value: source, label: label(source) }))} />
          <FilterSelect value={filters.action || ""} onChange={(value) => change({ action: (value || undefined) as ConsentAction | undefined })} label="All actions" options={consentActions.map((action) => ({ value: action, label: label(action) }))} />
          <input type="date" value={filters.from || ""} onChange={(event) => change({ from: event.target.value || undefined })} className="admin-input" aria-label="From date" />
          <input type="date" value={filters.to || ""} onChange={(event) => change({ to: event.target.value || undefined })} className="admin-input" aria-label="To date" />
        </div>

        <div className="overflow-x-auto">
          <table className="admin-table min-w-[980px]">
            <thead><tr><th>Recorded</th><th>User</th><th>Event</th><th>Source</th><th>Policy</th><th>Context</th><th className="text-right">Details</th></tr></thead>
            <tbody>
              {data.records.map((record) => (
                <tr key={record.id}>
                  <td><p className="font-semibold text-zinc-800">{new Date(record.createdAt).toLocaleDateString("en-IN")}</p><p className="text-xs text-zinc-400">{new Date(record.createdAt).toLocaleTimeString("en-IN")}</p></td>
                  <td><p className="max-w-48 truncate font-bold text-[#222222]">{record.user?.name || "Anonymous visitor"}</p><p className="max-w-48 truncate text-xs text-zinc-500">{record.user?.email || record.anonymousId || "No identity"}</p></td>
                  <td><p className="font-bold text-zinc-800">{label(record.type)}</p><span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-black ring-1 ${actionClass(record.action)}`}>{label(record.action)}</span></td>
                  <td className="text-sm font-semibold text-zinc-600">{label(record.source)}</td>
                  <td className="font-mono text-xs font-bold">{record.policyVersion}</td>
                  <td><p className="max-w-44 truncate font-mono text-xs text-zinc-600">{record.orderId ? `Order ${record.orderId}` : record.ipAddress || "No order"}</p></td>
                  <td className="text-right"><button type="button" onClick={() => setSelected(record)} className="admin-action">View</button></td>
                </tr>
              ))}
              {!isLoading && data.records.length === 0 ? <tr><td colSpan={7} className="py-12 text-center text-sm font-semibold text-zinc-500">No consent records match these filters.</td></tr> : null}
            </tbody>
          </table>
        </div>

        <footer className="flex flex-col gap-3 border-t border-zinc-200 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-zinc-500">Showing {data.records.length} of {data.pagination.total} records</p>
          <div className="flex items-center gap-2">
            <button type="button" className="admin-action" disabled={filters.page <= 1} onClick={() => change({ page: filters.page - 1 })}><ChevronLeft className="h-4 w-4" />Previous</button>
            <span className="min-w-24 text-center font-bold text-zinc-700">Page {data.pagination.page} of {data.pagination.totalPages}</span>
            <button type="button" className="admin-action" disabled={filters.page >= data.pagination.totalPages} onClick={() => change({ page: filters.page + 1 })}>Next<ChevronRight className="h-4 w-4" /></button>
          </div>
        </footer>
      </section>
    </div>
  );
}

function FilterSelect({ value, onChange, label: emptyLabel, options }: { value: string; onChange: (value: string) => void; label: string; options: Array<{ value: string; label: string }> }) {
  return <select value={value} onChange={(event) => onChange(event.target.value)} className="admin-input"><option value="">{emptyLabel}</option>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>;
}

function Stat({ icon, label: title, value }: { icon: React.ReactNode; label: string; value: number }) {
  return <div className="flex items-center gap-4 bg-white p-5"><span className="grid h-10 w-10 place-items-center rounded-md bg-zinc-100 text-zinc-700">{icon}</span><div><p className="text-2xl font-black text-[#222222]">{value.toLocaleString("en-IN")}</p><p className="text-xs font-bold text-zinc-500">{title}</p></div></div>;
}
