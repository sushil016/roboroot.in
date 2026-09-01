"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Download,
  FileBox,
  IndianRupee,
  Layers3,
  LoaderCircle,
  PackageCheck,
  Plus,
  Printer,
  RefreshCw,
  Save,
  Search,
  Settings2,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { useAdmin } from "@/core/context/AdminContext";
import {
  downloadPrintModel,
  fetchPrintOrders,
  fetchPrintSettings,
  updatePrintOrder,
  updatePrintSettings,
  type AdminPrintOrder,
  type PrintOrderStatus,
  type PrintPricingSettings,
  type PrintPricingUpdate,
} from "@/api/three-d-printing";

const PRINT_STATUSES: PrintOrderStatus[] = [
  "PAYMENT_PENDING",
  "PAID",
  "UNDER_REVIEW",
  "APPROVED",
  "PRINTING",
  "POST_PROCESSING",
  "QUALITY_CHECK",
  "PACKED",
  "SHIPPED",
  "DELIVERED",
  "ON_HOLD",
  "CANCELLED",
  "REFUNDED",
];

const ACTIVE_PRODUCTION_STATUSES: PrintOrderStatus[] = [
  "UNDER_REVIEW",
  "APPROVED",
  "PRINTING",
  "POST_PROCESSING",
  "QUALITY_CHECK",
  "PACKED",
];

const STATUS_STYLE: Record<PrintOrderStatus, string> = {
  PAYMENT_PENDING: "bg-amber-50 text-amber-700 ring-amber-200",
  PAID: "bg-blue-50 text-blue-700 ring-blue-200",
  UNDER_REVIEW: "bg-violet-50 text-violet-700 ring-violet-200",
  APPROVED: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  PRINTING: "bg-cyan-50 text-cyan-700 ring-cyan-200",
  POST_PROCESSING: "bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-200",
  QUALITY_CHECK: "bg-sky-50 text-sky-700 ring-sky-200",
  PACKED: "bg-teal-50 text-teal-700 ring-teal-200",
  SHIPPED: "bg-orange-50 text-orange-700 ring-orange-200",
  DELIVERED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  ON_HOLD: "bg-zinc-100 text-zinc-700 ring-zinc-200",
  CANCELLED: "bg-red-50 text-red-700 ring-red-200",
  REFUNDED: "bg-rose-50 text-rose-700 ring-rose-200",
};

function money(cents: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: Number(cents) % 100 === 0 ? 0 : 2,
  }).format(Number(cents) / 100);
}

function numberValue(value: number) {
  return Number(value || 0);
}

function readable(value: string) {
  return value.replace(/_/g, " ").toLowerCase().replace(/(^|\s)\S/g, (letter) => letter.toUpperCase());
}

function StatusBadge({ status }: { status: PrintOrderStatus }) {
  return (
    <span className={`inline-flex min-h-6 items-center rounded-md px-2 text-[11px] font-extrabold ring-1 ring-inset ${STATUS_STYLE[status]}`}>
      {readable(status)}
    </span>
  );
}

function Metric({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: typeof Box;
}) {
  return (
    <div className="admin-card flex items-center gap-4 p-5">
      <span className="grid size-10 shrink-0 place-items-center rounded-md border border-zinc-200 bg-[#F2F2F0] text-zinc-700">
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="admin-eyebrow">{label}</p>
        <p className="mt-1 truncate text-2xl font-extrabold text-[#222222]">{value}</p>
      </div>
    </div>
  );
}

function OrderDrawer({
  order,
  token,
  onClose,
  onSaved,
}: {
  order: AdminPrintOrder;
  token: string;
  onClose: () => void;
  onSaved: (order: AdminPrintOrder) => void;
}) {
  const [status, setStatus] = useState(order.status);
  const [statusNote, setStatusNote] = useState("");
  const [adminNotes, setAdminNotes] = useState(order.adminNotes ?? "");
  const [estimatedDays, setEstimatedDays] = useState(String(order.estimatedDays));
  const [trackingAwb, setTrackingAwb] = useState(order.commerceOrder.trackingAwb ?? "");
  const [trackingUrl, setTrackingUrl] = useState(order.commerceOrder.trackingUrl ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState("");
  const address = order.commerceOrder.address;

  async function save() {
    setIsSaving(true);
    setError("");
    try {
      const updated = await updatePrintOrder(
        order.id,
        {
          status,
          statusNote: statusNote.trim() || undefined,
          adminNotes: adminNotes.trim() || null,
          estimatedDays: Math.max(1, Number(estimatedDays) || 1),
          trackingAwb: trackingAwb.trim() || null,
          trackingUrl: trackingUrl.trim() || null,
        },
        token,
      );
      onSaved(updated);
      setStatusNote("");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not update print order");
    } finally {
      setIsSaving(false);
    }
  }

  async function download() {
    setIsDownloading(true);
    setError("");
    try {
      await downloadPrintModel(order.modelFile.id, order.modelFile.originalName, token);
    } catch (downloadError) {
      setError(downloadError instanceof Error ? downloadError.message : "Could not download model");
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/45 backdrop-blur-sm" role="dialog" aria-modal="true">
      <button type="button" className="absolute inset-0 cursor-default" aria-label="Close order" onClick={onClose} />
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-3xl flex-col bg-[#F2F2F0] shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-zinc-200 bg-white p-5 sm:p-6">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="admin-eyebrow">Print job {order.reference}</p>
              <StatusBadge status={order.status} />
            </div>
            <h2 className="mt-2 text-xl font-extrabold text-[#222222] sm:text-2xl">
              {order.modelFile.originalName}
            </h2>
            <p className="mt-1 text-xs font-semibold text-zinc-500">
              Received {new Date(order.createdAt).toLocaleString("en-IN")}
            </p>
          </div>
          <button type="button" onClick={onClose} className="admin-action size-10 px-0" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex-1 space-y-5 overflow-y-auto p-4 sm:p-6">
          {error ? (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</div>
          ) : null}

          <section className="grid gap-4 sm:grid-cols-2">
            <div className="admin-card p-4">
              <div className="flex items-center gap-2 text-zinc-500">
                <UserRound className="h-4 w-4" />
                <p className="admin-eyebrow">Customer</p>
              </div>
              <p className="mt-3 font-extrabold text-[#222222]">{order.user.name || "Customer"}</p>
              <p className="mt-1 text-sm font-semibold text-zinc-500">{order.user.email}</p>
              <p className="mt-3 text-sm font-semibold leading-6 text-zinc-600">
                {address.name}, {address.line1}{address.line2 ? `, ${address.line2}` : ""}<br />
                {address.city}, {address.state} {address.pincode}<br />
                {address.phone}
              </p>
            </div>

            <div className="admin-card p-4">
              <div className="flex items-center gap-2 text-zinc-500">
                <FileBox className="h-4 w-4" />
                <p className="admin-eyebrow">Source model</p>
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 text-xs font-semibold">
                <div><dt className="text-zinc-500">Format</dt><dd className="mt-1 font-extrabold">{order.modelFile.format}</dd></div>
                <div><dt className="text-zinc-500">File size</dt><dd className="mt-1 font-extrabold">{(numberValue(order.modelFile.sizeBytes) / 1048576).toFixed(2)} MB</dd></div>
                <div><dt className="text-zinc-500">Dimensions</dt><dd className="mt-1 font-extrabold">{numberValue(order.modelFile.widthMm).toFixed(1)} x {numberValue(order.modelFile.heightMm).toFixed(1)} x {numberValue(order.modelFile.depthMm).toFixed(1)} mm</dd></div>
                <div><dt className="text-zinc-500">Triangles</dt><dd className="mt-1 font-extrabold">{numberValue(order.modelFile.triangleCount).toLocaleString("en-IN")}</dd></div>
              </dl>
              <button type="button" onClick={() => void download()} disabled={isDownloading} className="admin-button admin-button-primary mt-4 w-full">
                {isDownloading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                {isDownloading ? "Preparing file" : "Download model"}
              </button>
            </div>
          </section>

          <section className="admin-card overflow-hidden">
            <div className="admin-card-header">
              <p className="admin-eyebrow">Production specification</p>
              <h3 className="admin-card-title">Print configuration</h3>
            </div>
            <dl className="grid grid-cols-2 gap-px bg-zinc-200 sm:grid-cols-4">
              {[
                ["Material", `${order.material.name} (${order.material.code})`],
                ["Color", order.color],
                ["Quality", readable(order.quality)],
                ["Finish", readable(order.finish)],
                ["Infill", `${order.infillPercent}%`],
                ["Quantity", order.quantity],
                ["Unit weight", `${numberValue(order.unitWeightGrams).toFixed(2)} g`],
                ["Total weight", `${numberValue(order.totalWeightGrams).toFixed(2)} g`],
              ].map(([label, value]) => (
                <div key={String(label)} className="bg-white p-4">
                  <dt className="text-[11px] font-bold uppercase text-zinc-500">{label}</dt>
                  <dd className="mt-1 text-sm font-extrabold text-[#222222]">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            <div className="admin-card p-4">
              <p className="admin-eyebrow">Price breakdown</p>
              <div className="mt-3 divide-y divide-zinc-100 text-sm font-semibold">
                {[
                  ["Setup", order.baseFeeCents],
                  ["Material", order.materialCostCents],
                  ["Quality", order.qualityMarkupCents],
                  ["Finish", order.finishFeeCents],
                  ["Delivery", order.shippingCents],
                ].map(([label, value]) => (
                  <div key={String(label)} className="flex justify-between gap-4 py-2">
                    <span className="text-zinc-500">{label}</span>
                    <span>{money(Number(value))}</span>
                  </div>
                ))}
                <div className="flex justify-between gap-4 pt-3 text-base font-extrabold">
                  <span>Total</span><span>{money(order.totalAmountCents)}</span>
                </div>
              </div>
            </div>

            <div className="admin-card p-4">
              <p className="admin-eyebrow">Payment</p>
              {order.commerceOrder.payments.length ? (
                <div className="mt-3 space-y-3">
                  {order.commerceOrder.payments.slice(0, 2).map((payment) => (
                    <div key={payment.id} className="rounded-md border border-zinc-200 p-3 text-sm font-semibold">
                      <div className="flex justify-between gap-4"><span>{payment.gateway}</span><span>{money(payment.amountCents)}</span></div>
                      <p className="mt-1 text-xs font-bold text-zinc-500">{readable(payment.status)}</p>
                      {payment.gatewayTransactionId ? <p className="mt-1 break-all font-mono text-[10px] text-zinc-400">{payment.gatewayTransactionId}</p> : null}
                    </div>
                  ))}
                </div>
              ) : <p className="mt-4 text-sm font-semibold text-zinc-500">No payment attempt recorded.</p>}
            </div>
          </section>

          <section className="admin-card p-4">
            <p className="admin-eyebrow">Customer notes</p>
            <p className="mt-2 text-sm font-semibold leading-6 text-zinc-600">{order.customerNotes || "No customer notes."}</p>
          </section>

          <section className="admin-card p-4">
            <div className="flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-zinc-500" />
              <p className="admin-eyebrow">Status history</p>
            </div>
            <div className="mt-4 space-y-0">
              {order.statusHistory.map((event, index) => (
                <div key={event.id} className="grid grid-cols-[18px_1fr] gap-3">
                  <div className="flex flex-col items-center">
                    <span className="mt-1.5 size-2.5 rounded-full bg-[#222222]" />
                    {index < order.statusHistory.length - 1 ? <span className="min-h-10 w-px flex-1 bg-zinc-200" /> : null}
                  </div>
                  <div className="pb-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-extrabold">{readable(event.status)}</p>
                      <p className="text-[11px] font-semibold text-zinc-400">{new Date(event.createdAt).toLocaleString("en-IN")}</p>
                    </div>
                    {event.note ? <p className="mt-1 text-xs font-semibold text-zinc-500">{event.note}</p> : null}
                    {event.actorLabel ? <p className="mt-1 text-[10px] font-bold uppercase text-zinc-400">By {event.actorLabel}</p> : null}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="admin-card p-4">
            <p className="admin-eyebrow">Production update</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1.5 text-xs font-bold text-zinc-600">
                Status
                <select className="admin-input w-full" value={status} onChange={(event) => setStatus(event.target.value as PrintOrderStatus)}>
                  {PRINT_STATUSES.map((item) => <option key={item} value={item}>{readable(item)}</option>)}
                </select>
              </label>
              <label className="grid gap-1.5 text-xs font-bold text-zinc-600">
                Estimated production days
                <input className="admin-input w-full" type="number" min="1" max="90" value={estimatedDays} onChange={(event) => setEstimatedDays(event.target.value)} />
              </label>
              <label className="grid gap-1.5 text-xs font-bold text-zinc-600">
                Tracking / AWB
                <input className="admin-input w-full" value={trackingAwb} onChange={(event) => setTrackingAwb(event.target.value)} placeholder="Add after dispatch" />
              </label>
              <label className="grid gap-1.5 text-xs font-bold text-zinc-600">
                Tracking URL
                <input className="admin-input w-full" type="url" value={trackingUrl} onChange={(event) => setTrackingUrl(event.target.value)} placeholder="https://..." />
              </label>
              <label className="grid gap-1.5 text-xs font-bold text-zinc-600 sm:col-span-2">
                Timeline note
                <input className="admin-input w-full" value={statusNote} onChange={(event) => setStatusNote(event.target.value)} placeholder="Visible in the order timeline when status changes" />
              </label>
              <label className="grid gap-1.5 text-xs font-bold text-zinc-600 sm:col-span-2">
                Internal production notes
                <textarea className="admin-textarea w-full" value={adminNotes} onChange={(event) => setAdminNotes(event.target.value)} placeholder="Orientation, supports, tolerances, printer assignment..." />
              </label>
            </div>
          </section>
        </div>

        <footer className="flex justify-end gap-3 border-t border-zinc-200 bg-white p-4 sm:px-6">
          <button type="button" onClick={onClose} className="admin-button admin-button-secondary">Close</button>
          <button type="button" onClick={() => void save()} disabled={isSaving} className="admin-button admin-button-primary">
            {isSaving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isSaving ? "Saving" : "Save job"}
          </button>
        </footer>
      </aside>
    </div>
  );
}

function CurrencyField({ label, cents, onChange }: { label: string; cents: number; onChange: (cents: number) => void }) {
  return (
    <label className="grid gap-1.5 text-xs font-bold text-zinc-600">
      {label}
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-xs font-extrabold text-zinc-400">Rs</span>
        <input className="admin-input w-full pl-10" type="number" min="0" step="0.01" value={numberValue(cents) / 100} onChange={(event) => onChange(Math.round((Number(event.target.value) || 0) * 100))} />
      </div>
    </label>
  );
}

function PricingEditor({
  settings,
  isSaving,
  onSave,
}: {
  settings: PrintPricingSettings;
  isSaving: boolean;
  onSave: (settings: PrintPricingUpdate) => Promise<void>;
}) {
  const [draft, setDraft] = useState<PrintPricingUpdate>(() => settings);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function setNumber(key: keyof Omit<PrintPricingUpdate, "materials" | "isEnabled">, value: number) {
    setDraft((current) => ({ ...current, [key]: value }));
    setSaved(false);
  }

  function updateMaterial(index: number, update: Partial<PrintPricingUpdate["materials"][number]>) {
    setDraft((current) => ({
      ...current,
      materials: current.materials.map((material, materialIndex) => materialIndex === index ? { ...material, ...update } : material),
    }));
    setSaved(false);
  }

  function addMaterial() {
    setDraft((current) => ({
      ...current,
      materials: [
        ...current.materials,
        {
          code: `MAT${current.materials.length + 1}`,
          name: "New material",
          densityGramsPerCm3: 1.24,
          pricePerGramCents: 10,
          colors: ["Black", "White"],
          isActive: true,
          sortOrder: current.materials.length,
        },
      ],
    }));
    setSaved(false);
  }

  async function save() {
    if (draft.materials.some((material) => !material.code.trim() || !material.name.trim() || material.colors.length === 0)) {
      setError("Every material needs a code, name, and at least one color.");
      return;
    }
    setError("");
    try {
      await onSave({
        ...draft,
        materials: draft.materials.map((material, index) => ({ ...material, code: material.code.trim().toUpperCase(), name: material.name.trim(), colors: material.colors.map((color) => color.trim()).filter(Boolean), sortOrder: index })),
      });
      setSaved(true);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save pricing");
    }
  }

  return (
    <div className="space-y-6">
      {error ? <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</div> : null}
      {saved ? <div className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700"><CheckCircle2 className="h-4 w-4" />Pricing saved and live.</div> : null}

      <section className="admin-card overflow-hidden">
        <div className="admin-card-header flex-row items-center justify-between">
          <div><p className="admin-eyebrow">Availability</p><h2 className="admin-card-title">3D printing checkout</h2></div>
          <button type="button" role="switch" aria-checked={draft.isEnabled} onClick={() => { setDraft((current) => ({ ...current, isEnabled: !current.isEnabled })); setSaved(false); }} className={`relative h-7 w-12 rounded-full transition ${draft.isEnabled ? "bg-emerald-600" : "bg-zinc-300"}`}>
            <span className={`absolute top-1 size-5 rounded-full bg-white shadow transition-transform ${draft.isEnabled ? "translate-x-6" : "translate-x-1"}`} />
          </button>
        </div>
        <div className="admin-card-content grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <CurrencyField label="Setup fee" cents={draft.baseFeeCents} onChange={(value) => setNumber("baseFeeCents", value)} />
          <CurrencyField label="Minimum print order" cents={draft.minimumOrderCents} onChange={(value) => setNumber("minimumOrderCents", value)} />
          <label className="grid gap-1.5 text-xs font-bold text-zinc-600">Shell material allowance (%)<input className="admin-input" type="number" min="0" max="100" value={draft.shellMaterialPercent} onChange={(event) => setNumber("shellMaterialPercent", Number(event.target.value))} /></label>
          <label className="grid gap-1.5 text-xs font-bold text-zinc-600">Maximum model file (MB)<input className="admin-input" type="number" min="1" max="100" value={draft.maxFileSizeMb} onChange={(event) => setNumber("maxFileSizeMb", Number(event.target.value))} /></label>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="admin-card overflow-hidden">
          <div className="admin-card-header"><p className="admin-eyebrow">Layer quality</p><h2 className="admin-card-title">Price multipliers and lead time</h2></div>
          <div className="admin-card-content space-y-3">
            {([
              ["Draft", "draftMultiplierPercent", "draftLeadDays"],
              ["Standard", "standardMultiplierPercent", "standardLeadDays"],
              ["Fine", "fineMultiplierPercent", "fineLeadDays"],
            ] as const).map(([label, multiplierKey, daysKey]) => (
              <div key={label} className="grid grid-cols-[1fr_110px_110px] items-end gap-3 rounded-md border border-zinc-200 p-3">
                <p className="pb-3 text-sm font-extrabold">{label}</p>
                <label className="grid gap-1 text-[10px] font-bold uppercase text-zinc-500">Multiplier %<input className="admin-input w-full" type="number" min="25" max="500" value={draft[multiplierKey]} onChange={(event) => setNumber(multiplierKey, Number(event.target.value))} /></label>
                <label className="grid gap-1 text-[10px] font-bold uppercase text-zinc-500">Lead days<input className="admin-input w-full" type="number" min="1" max="90" value={draft[daysKey]} onChange={(event) => setNumber(daysKey, Number(event.target.value))} /></label>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-card overflow-hidden">
          <div className="admin-card-header"><p className="admin-eyebrow">Post processing</p><h2 className="admin-card-title">Finishing fees per item</h2></div>
          <div className="admin-card-content grid gap-4 sm:grid-cols-2">
            <CurrencyField label="Raw print" cents={draft.rawFinishFeeCents} onChange={(value) => setNumber("rawFinishFeeCents", value)} />
            <CurrencyField label="Support removal" cents={draft.supportRemovalFeeCents} onChange={(value) => setNumber("supportRemovalFeeCents", value)} />
            <CurrencyField label="Sanding" cents={draft.sandingFeeCents} onChange={(value) => setNumber("sandingFeeCents", value)} />
            <CurrencyField label="Primer" cents={draft.primerFeeCents} onChange={(value) => setNumber("primerFeeCents", value)} />
            <CurrencyField label="Painting" cents={draft.paintingFeeCents} onChange={(value) => setNumber("paintingFeeCents", value)} />
          </div>
        </div>
      </section>

      <section className="admin-card overflow-hidden">
        <div className="admin-card-header flex-row items-center justify-between gap-4">
          <div><p className="admin-eyebrow">Filaments</p><h2 className="admin-card-title">Materials and per-gram pricing</h2></div>
          <button type="button" onClick={addMaterial} className="admin-button admin-button-secondary"><Plus className="h-4 w-4" />Add material</button>
        </div>
        <div className="divide-y divide-zinc-100">
          {draft.materials.map((material, index) => (
            <div key={material.id ?? `new-${index}`} className="grid gap-4 p-5 xl:grid-cols-[90px_1fr_120px_140px_1.3fr_90px_40px] xl:items-end">
              <label className="grid gap-1 text-[10px] font-bold uppercase text-zinc-500">Code<input className="admin-input w-full" value={material.code} onChange={(event) => updateMaterial(index, { code: event.target.value.toUpperCase() })} /></label>
              <label className="grid gap-1 text-[10px] font-bold uppercase text-zinc-500">Material name<input className="admin-input w-full" value={material.name} onChange={(event) => updateMaterial(index, { name: event.target.value })} /></label>
              <label className="grid gap-1 text-[10px] font-bold uppercase text-zinc-500">Density g/cm3<input className="admin-input w-full" type="number" min="0.01" max="25" step="0.01" value={numberValue(material.densityGramsPerCm3)} onChange={(event) => updateMaterial(index, { densityGramsPerCm3: Number(event.target.value) })} /></label>
              <CurrencyField label="Price per gram" cents={material.pricePerGramCents} onChange={(value) => updateMaterial(index, { pricePerGramCents: Math.max(1, value) })} />
              <label className="grid gap-1 text-[10px] font-bold uppercase text-zinc-500">Colors (comma separated)<input className="admin-input w-full" value={material.colors.join(", ")} onChange={(event) => updateMaterial(index, { colors: event.target.value.split(",").map((color) => color.trim()).filter(Boolean) })} /></label>
              <button type="button" onClick={() => updateMaterial(index, { isActive: !material.isActive })} className={`h-10 rounded-md border px-3 text-xs font-extrabold transition ${material.isActive ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-zinc-200 bg-zinc-100 text-zinc-500"}`}>{material.isActive ? "Active" : "Hidden"}</button>
              <button type="button" disabled={draft.materials.length <= 1} onClick={() => { setDraft((current) => ({ ...current, materials: current.materials.filter((_, materialIndex) => materialIndex !== index) })); setSaved(false); }} className="grid size-10 place-items-center rounded-md text-zinc-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-30" aria-label={`Remove ${material.name}`}><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
      </section>

      <div className="flex justify-end">
        <button type="button" onClick={() => void save()} disabled={isSaving} className="admin-button admin-button-primary min-w-44">
          {isSaving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {isSaving ? "Saving pricing" : "Save pricing"}
        </button>
      </div>
    </div>
  );
}

export function ThreeDPrintingView() {
  const { token, setStatus: setAdminStatus } = useAdmin();
  const [tab, setTab] = useState<"orders" | "pricing">("orders");
  const [orders, setOrders] = useState<AdminPrintOrder[]>([]);
  const [settings, setSettings] = useState<PrintPricingSettings | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<AdminPrintOrder | null>(null);
  const [filterStatus, setFilterStatus] = useState<PrintOrderStatus | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [error, setError] = useState("");

  const loadOrders = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError("");
    try {
      const data = await fetchPrintOrders(token, { page, status: filterStatus, search });
      setOrders(data.orders);
      setTotal(data.total);
      setTotalPages(Math.max(1, data.totalPages));
      setAdminStatus(`${data.total} print jobs loaded`);
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : "Could not load print jobs";
      setError(message);
      setAdminStatus(message);
    } finally {
      setIsLoading(false);
    }
  }, [filterStatus, page, search, setAdminStatus, token]);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    void fetchPrintSettings(token)
      .then((data) => { if (!cancelled) setSettings(data); })
      .catch((loadError) => { if (!cancelled) setError(loadError instanceof Error ? loadError.message : "Could not load print pricing"); });
    return () => { cancelled = true; };
  }, [token]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadOrders(), 300);
    return () => window.clearTimeout(timer);
  }, [loadOrders]);

  const metrics = useMemo(() => ({
    paid: orders.filter((order) => !["PAYMENT_PENDING", "CANCELLED", "REFUNDED"].includes(order.status)).length,
    production: orders.filter((order) => ACTIVE_PRODUCTION_STATUSES.includes(order.status)).length,
    value: orders.filter((order) => !["CANCELLED", "REFUNDED"].includes(order.status)).reduce((sum, order) => sum + Number(order.totalAmountCents), 0),
  }), [orders]);

  async function saveSettings(update: PrintPricingUpdate) {
    if (!token) return;
    setIsSavingSettings(true);
    try {
      const saved = await updatePrintSettings(update, token);
      setSettings(saved);
      setAdminStatus("3D printing pricing updated");
    } finally {
      setIsSavingSettings(false);
    }
  }

  function replaceOrder(updated: AdminPrintOrder) {
    setOrders((current) => current.map((order) => order.id === updated.id ? updated : order));
    setSelectedOrder(updated);
    setAdminStatus(`${updated.reference} updated`);
  }

  return (
    <section className="space-y-6">
      {selectedOrder && token ? <OrderDrawer order={selectedOrder} token={token} onClose={() => setSelectedOrder(null)} onSaved={replaceOrder} /> : null}

      <div className="flex flex-col gap-4 border-b border-zinc-300 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="admin-eyebrow">Manufacturing service</p>
          <h2 className="mt-1 text-2xl font-extrabold text-[#222222]">3D printing operations</h2>
          <p className="admin-muted mt-2">Review uploaded models, run production, and control live quote pricing.</p>
        </div>
        <div className="inline-flex w-fit rounded-md border border-zinc-300 bg-white p-1">
          <button type="button" onClick={() => setTab("orders")} className={`inline-flex min-h-9 items-center gap-2 rounded px-4 text-sm font-bold transition ${tab === "orders" ? "bg-[#222222] text-white" : "text-zinc-500 hover:text-[#222222]"}`}><Printer className="h-4 w-4" />Print jobs</button>
          <button type="button" onClick={() => setTab("pricing")} className={`inline-flex min-h-9 items-center gap-2 rounded px-4 text-sm font-bold transition ${tab === "pricing" ? "bg-[#222222] text-white" : "text-zinc-500 hover:text-[#222222]"}`}><Settings2 className="h-4 w-4" />Pricing</button>
        </div>
      </div>

      {error ? <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</div> : null}

      {tab === "orders" ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Metric label="Matching jobs" value={total} icon={Layers3} />
            <Metric label="Paid on this page" value={metrics.paid} icon={PackageCheck} />
            <Metric label="In production" value={metrics.production} icon={Printer} />
            <Metric label="Page order value" value={money(metrics.value)} icon={IndianRupee} />
          </div>

          <div className="admin-card overflow-hidden">
            <div className="admin-card-header gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div><p className="admin-eyebrow">Queue</p><h2 className="admin-card-title">Customer print jobs</h2></div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <label className="relative min-w-72"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" /><input className="admin-input w-full pl-9" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Reference, file, customer or email" /></label>
                <select className="admin-input min-w-44" value={filterStatus} onChange={(event) => { setFilterStatus(event.target.value as PrintOrderStatus | "ALL"); setPage(1); }}>
                  <option value="ALL">All statuses</option>
                  {PRINT_STATUSES.map((status) => <option key={status} value={status}>{readable(status)}</option>)}
                </select>
                <button type="button" onClick={() => void loadOrders()} disabled={isLoading} className="admin-action size-10 px-0" aria-label="Refresh jobs"><RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} /></button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="admin-table min-w-[980px]">
                <thead><tr><th>Job</th><th>Customer</th><th>Specification</th><th>Weight</th><th>Total</th><th>Progress</th><th>Received</th><th /></tr></thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="transition hover:bg-[#F7F7F5]">
                      <td><p className="font-mono text-xs font-extrabold text-[#222222]">{order.reference}</p><p className="mt-1 max-w-48 truncate text-xs font-semibold text-zinc-500">{order.modelFile.originalName}</p></td>
                      <td><p className="font-bold text-[#222222]">{order.user.name || "Customer"}</p><p className="mt-1 text-xs font-semibold text-zinc-500">{order.user.email}</p></td>
                      <td><p className="text-xs font-extrabold text-[#222222]">{order.material.code} / {order.color}</p><p className="mt-1 text-xs font-semibold text-zinc-500">{readable(order.quality)} / {order.infillPercent}% / Qty {order.quantity}</p></td>
                      <td><p className="font-bold">{numberValue(order.totalWeightGrams).toFixed(2)} g</p><p className="mt-1 text-xs font-semibold text-zinc-500">{numberValue(order.modelFile.volumeMm3 / 1000).toFixed(2)} cm3 mesh</p></td>
                      <td className="font-extrabold text-[#222222]">{money(order.totalAmountCents)}</td>
                      <td><StatusBadge status={order.status} /></td>
                      <td><p className="text-xs font-bold">{new Date(order.createdAt).toLocaleDateString("en-IN")}</p><p className="mt-1 text-[11px] font-semibold text-zinc-400">{new Date(order.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</p></td>
                      <td><button type="button" onClick={() => setSelectedOrder(order)} className="admin-action">Manage</button></td>
                    </tr>
                  ))}
                  {!orders.length && !isLoading ? <tr><td colSpan={8} className="py-14 text-center text-sm font-bold text-zinc-400">No 3D print jobs match this view.</td></tr> : null}
                  {isLoading ? <tr><td colSpan={8} className="py-14"><div className="flex items-center justify-center gap-2 text-sm font-bold text-zinc-400"><LoaderCircle className="h-4 w-4 animate-spin" />Loading print jobs</div></td></tr> : null}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between border-t border-zinc-100 px-5 py-4">
              <p className="text-xs font-bold text-zinc-500">Page {page} of {totalPages}</p>
              <div className="flex gap-2">
                <button type="button" disabled={page <= 1 || isLoading} onClick={() => setPage((current) => Math.max(1, current - 1))} className="admin-action size-9 px-0" aria-label="Previous page"><ChevronLeft className="h-4 w-4" /></button>
                <button type="button" disabled={page >= totalPages || isLoading} onClick={() => setPage((current) => Math.min(totalPages, current + 1))} className="admin-action size-9 px-0" aria-label="Next page"><ChevronRight className="h-4 w-4" /></button>
              </div>
            </div>
          </div>
        </>
      ) : settings ? (
        <PricingEditor key={settings.updatedAt} settings={settings} isSaving={isSavingSettings} onSave={saveSettings} />
      ) : (
        <div className="admin-card flex min-h-60 items-center justify-center text-zinc-400"><LoaderCircle className="h-5 w-5 animate-spin" /></div>
      )}
    </section>
  );
}
