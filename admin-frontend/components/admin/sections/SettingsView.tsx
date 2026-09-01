"use client";

import { type FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, LoaderCircle, Plus, Save, Trash2, Truck } from "lucide-react";
import {
  getDeliverySettings,
  updateDeliverySettings,
  type DeliveryFeeRule,
  type DeliverySettings,
} from "@/api/settings";

type EditableRule = {
  key: string;
  minOrderRupees: string;
  maxOrderRupees: string;
  feeRupees: string;
};

function formatRupees(cents: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}

function toEditableRule(rule: DeliveryFeeRule): EditableRule {
  return {
    key: rule.id,
    minOrderRupees: String(rule.minOrderCents / 100),
    maxOrderRupees: String(rule.maxOrderCents / 100),
    feeRupees: String(rule.feeCents / 100),
  };
}

function createRuleKey() {
  return `delivery-rule-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function SettingsView({
  apiBaseUrl,
  token,
  userLabel,
}: {
  apiBaseUrl: string;
  token: string;
  userLabel: string;
}) {
  const [deliveryFeeEnabled, setDeliveryFeeEnabled] = useState(true);
  const [deliveryFeeRupees, setDeliveryFeeRupees] = useState("50");
  const [freeDeliveryThresholdRupees, setFreeDeliveryThresholdRupees] = useState("500");
  const [deliveryFeeRules, setDeliveryFeeRules] = useState<EditableRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const applySettings = useCallback((data: DeliverySettings) => {
    setDeliveryFeeEnabled(data.deliveryFeeEnabled);
    setDeliveryFeeRupees(String(data.deliveryFeeCents / 100));
    setFreeDeliveryThresholdRupees(String(data.freeDeliveryThresholdCents / 100));
    setDeliveryFeeRules(
      data.deliveryFeeRules
        .filter((rule) => rule.id !== "default-delivery-rule")
        .map(toEditableRule),
    );
  }, []);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    void getDeliverySettings(token)
      .then((data) => {
        if (cancelled) return;
        applySettings(data);
        setError(null);
      })
      .catch((loadError) => {
        if (cancelled) return;
        setError(loadError instanceof Error ? loadError.message : "Failed to load delivery settings");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [applySettings, token]);

  const previewRules = useMemo(
    () =>
      deliveryFeeRules
        .map((rule) => ({
          min: Number(rule.minOrderRupees),
          max: Number(rule.maxOrderRupees),
          fee: Number(rule.feeRupees),
        }))
        .filter(
          (rule) =>
            Number.isFinite(rule.min) &&
            Number.isFinite(rule.max) &&
            Number.isFinite(rule.fee),
        )
        .sort((a, b) => a.min - b.min),
    [deliveryFeeRules],
  );

  function updateRule(key: string, field: keyof Omit<EditableRule, "key">, value: string) {
    setDeliveryFeeRules((rules) =>
      rules.map((rule) => (rule.key === key ? { ...rule, [field]: value } : rule)),
    );
    setSaved(false);
  }

  function addRule() {
    const threshold = Math.max(0, Number(freeDeliveryThresholdRupees) || 0);
    const previousMaximum = deliveryFeeRules.reduce(
      (highest, rule) => Math.max(highest, Number(rule.maxOrderRupees) || 0),
      0,
    );
    const minimum = previousMaximum < threshold ? previousMaximum : 0;
    const maximum = Math.min(threshold || minimum + 100, minimum + 100);

    setDeliveryFeeRules((rules) => [
      ...rules,
      {
        key: createRuleKey(),
        minOrderRupees: String(minimum),
        maxOrderRupees: String(maximum),
        feeRupees: deliveryFeeRupees,
      },
    ]);
    setSaved(false);
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const defaultFee = Number(deliveryFeeRupees);
    const freeDeliveryThreshold = Number(freeDeliveryThresholdRupees);

    if (!Number.isFinite(defaultFee) || defaultFee < 0) {
      setError("Enter a valid default delivery fee");
      return;
    }
    if (!Number.isFinite(freeDeliveryThreshold) || freeDeliveryThreshold <= 0) {
      setError("Enter a free-delivery minimum greater than zero");
      return;
    }

    const parsedRules = deliveryFeeRules
      .map((rule) => ({
        minOrderCents: Math.round(Number(rule.minOrderRupees) * 100),
        maxOrderCents: Math.round(Number(rule.maxOrderRupees) * 100),
        feeCents: Math.round(Number(rule.feeRupees) * 100),
      }))
      .sort((a, b) => a.minOrderCents - b.minOrderCents);

    const hasInvalidRule = parsedRules.some(
      (rule) =>
        !Number.isFinite(rule.minOrderCents) ||
        !Number.isFinite(rule.maxOrderCents) ||
        !Number.isFinite(rule.feeCents) ||
        rule.minOrderCents < 0 ||
        rule.feeCents < 0 ||
        rule.maxOrderCents <= rule.minOrderCents,
    );
    if (hasInvalidRule) {
      setError("Each range needs a valid minimum, maximum, and non-negative fee");
      return;
    }

    const thresholdCents = Math.round(freeDeliveryThreshold * 100);
    if (parsedRules.some((rule) => rule.maxOrderCents > thresholdCents)) {
      setError("Delivery ranges cannot extend beyond the free-delivery minimum");
      return;
    }
    if (
      parsedRules.some(
        (rule, index) => index > 0 && rule.minOrderCents < parsedRules[index - 1].maxOrderCents,
      )
    ) {
      setError("Delivery fee ranges cannot overlap");
      return;
    }

    setIsSaving(true);
    setSaved(false);
    setError(null);
    try {
      const updated = await updateDeliverySettings(
        {
          deliveryFeeEnabled,
          deliveryFeeCents: Math.round(defaultFee * 100),
          freeDeliveryThresholdCents: thresholdCents,
          deliveryFeeRules: parsedRules,
        },
        token,
      );
      applySettings(updated);
      setSaved(true);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to save delivery settings");
    } finally {
      setIsSaving(false);
    }
  }

  const thresholdCents = Math.max(
    0,
    Math.round((Number(freeDeliveryThresholdRupees) || 0) * 100),
  );
  const defaultFeeCents = Math.max(0, Math.round((Number(deliveryFeeRupees) || 0) * 100));
  const highestRangeMaximum = deliveryFeeRules.reduce(
    (highest, rule) => Math.max(highest, Number(rule.maxOrderRupees) || 0),
    0,
  );
  const canAddRange =
    deliveryFeeRules.length < 20 &&
    Number(freeDeliveryThresholdRupees) > 0 &&
    highestRangeMaximum < Number(freeDeliveryThresholdRupees);

  return (
    <div className="flex flex-col gap-6">
      <section className="admin-card overflow-hidden">
        <div className="admin-card-header sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="admin-eyebrow">Checkout</p>
            <h2 className="admin-card-title">Delivery fees</h2>
          </div>
          <div
            className={`inline-flex w-fit items-center gap-2 rounded-md px-3 py-1.5 text-xs font-bold ${
              deliveryFeeEnabled ? "bg-emerald-50 text-emerald-700" : "bg-zinc-100 text-zinc-500"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                deliveryFeeEnabled ? "bg-emerald-500" : "bg-zinc-400"
              }`}
            />
            {deliveryFeeEnabled ? "Enabled" : "Free delivery"}
          </div>
        </div>

        <form onSubmit={(event) => void handleSave(event)} className="admin-card-content">
          {error && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </div>
          )}
          {saved && (
            <div className="mb-4 flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
              Delivery settings saved
            </div>
          )}

          {isLoading ? (
            <div className="flex min-h-40 items-center justify-center text-zinc-400">
              <LoaderCircle className="h-5 w-5 animate-spin" />
            </div>
          ) : (
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
              <div className="space-y-6">
                <div className="flex items-center justify-between gap-4 rounded-lg border border-zinc-200 p-4">
                  <div>
                    <p className="text-sm font-bold text-[#222222]">Charge delivery fees</p>
                    <p className="mt-1 text-xs font-semibold text-zinc-500">
                      Turn this off to make delivery free for every order.
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={deliveryFeeEnabled}
                    aria-label="Charge delivery fees"
                    onClick={() => {
                      setDeliveryFeeEnabled((enabled) => !enabled);
                      setSaved(false);
                    }}
                    className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
                      deliveryFeeEnabled ? "bg-[#222222]" : "bg-zinc-300"
                    }`}
                  >
                    <span
                      className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                        deliveryFeeEnabled ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-2 text-xs font-bold text-zinc-600">
                    Free delivery from
                    <div className="relative">
                      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm font-bold text-zinc-500">Rs</span>
                      <input
                        type="number"
                        min="0.01"
                        max="1000000"
                        step="0.01"
                        value={freeDeliveryThresholdRupees}
                        onChange={(event) => {
                          setFreeDeliveryThresholdRupees(event.target.value);
                          setSaved(false);
                        }}
                        className="admin-input w-full pl-10"
                      />
                    </div>
                  </label>

                  <label className="grid gap-2 text-xs font-bold text-zinc-600">
                    Default fee for uncovered amounts
                    <div className="relative">
                      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm font-bold text-zinc-500">Rs</span>
                      <input
                        type="number"
                        min="0"
                        max="100000"
                        step="0.01"
                        value={deliveryFeeRupees}
                        onChange={(event) => {
                          setDeliveryFeeRupees(event.target.value);
                          setSaved(false);
                        }}
                        className="admin-input w-full pl-10"
                      />
                    </div>
                  </label>
                </div>

                <div>
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-[#222222]">Order value ranges</p>
                      <p className="mt-1 text-xs font-semibold text-zinc-500">
                        The lower value is included; the upper value starts the next range.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={addRule}
                      disabled={!canAddRange}
                      className="admin-button admin-button-secondary"
                    >
                      <Plus className="h-4 w-4" />
                      Add range
                    </button>
                  </div>

                  <div className="overflow-hidden rounded-lg border border-zinc-200">
                    <div className="hidden grid-cols-[1fr_1fr_1fr_40px] gap-3 bg-zinc-50 px-4 py-2.5 text-[11px] font-black uppercase text-zinc-500 sm:grid">
                      <span>From</span>
                      <span>Up to</span>
                      <span>Delivery fee</span>
                      <span />
                    </div>
                    {deliveryFeeRules.length === 0 ? (
                      <div className="px-4 py-8 text-center text-sm font-semibold text-zinc-500">
                        No custom ranges. The default fee applies below the free-delivery minimum.
                      </div>
                    ) : (
                      <div className="divide-y divide-zinc-200">
                        {deliveryFeeRules.map((rule) => (
                          <div
                            key={rule.key}
                            className="grid gap-3 px-4 py-4 sm:grid-cols-[1fr_1fr_1fr_40px] sm:items-end"
                          >
                            <label className="grid gap-1 text-[11px] font-bold text-zinc-500">
                              <span className="sm:hidden">From</span>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={rule.minOrderRupees}
                                onChange={(event) => updateRule(rule.key, "minOrderRupees", event.target.value)}
                                className="admin-input w-full"
                                aria-label="Minimum order value"
                              />
                            </label>
                            <label className="grid gap-1 text-[11px] font-bold text-zinc-500">
                              <span className="sm:hidden">Up to</span>
                              <input
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={rule.maxOrderRupees}
                                onChange={(event) => updateRule(rule.key, "maxOrderRupees", event.target.value)}
                                className="admin-input w-full"
                                aria-label="Maximum order value"
                              />
                            </label>
                            <label className="grid gap-1 text-[11px] font-bold text-zinc-500">
                              <span className="sm:hidden">Delivery fee</span>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={rule.feeRupees}
                                onChange={(event) => updateRule(rule.key, "feeRupees", event.target.value)}
                                className="admin-input w-full"
                                aria-label="Delivery fee"
                              />
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                setDeliveryFeeRules((rules) => rules.filter((item) => item.key !== rule.key));
                                setSaved(false);
                              }}
                              className="flex h-10 w-10 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600"
                              aria-label="Remove delivery fee range"
                              title="Remove range"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSaving || !token}
                  className="admin-button admin-button-primary w-fit"
                >
                  {isSaving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {isSaving ? "Saving..." : "Save delivery settings"}
                </button>
              </div>

              <aside className="admin-soft-surface h-fit p-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-white text-[#222222] ring-1 ring-zinc-200">
                  <Truck className="h-4 w-4" />
                </div>
                <p className="admin-eyebrow mt-6">Delivery summary</p>
                <p className="mt-1 text-2xl font-extrabold text-[#222222]">
                  {deliveryFeeEnabled ? `${previewRules.length} custom ranges` : "Free for all"}
                </p>
                <p className="mt-2 text-xs font-semibold leading-5 text-zinc-500">
                  {deliveryFeeEnabled
                    ? `Orders from ${formatRupees(thresholdCents)} receive free delivery.`
                    : "No delivery charge will be added at checkout."}
                </p>

                {deliveryFeeEnabled && (
                  <div className="mt-5 divide-y divide-zinc-200 border-y border-zinc-200">
                    {previewRules.slice(0, 6).map((rule, index) => (
                      <div key={`${rule.min}-${rule.max}-${index}`} className="flex justify-between gap-3 py-3 text-xs font-bold">
                        <span className="text-zinc-500">
                          {formatRupees(Math.round(rule.min * 100))} - {formatRupees(Math.round(rule.max * 100))}
                        </span>
                        <span>{formatRupees(Math.round(rule.fee * 100))}</span>
                      </div>
                    ))}
                    <div className="flex justify-between gap-3 py-3 text-xs font-bold">
                      <span className="text-zinc-500">Default fee</span>
                      <span>{formatRupees(defaultFeeCents)}</span>
                    </div>
                  </div>
                )}
              </aside>
            </div>
          )}
        </form>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="admin-card p-5">
          <p className="admin-eyebrow">Environment</p>
          <h2 className="admin-card-title">API and session</h2>
          <div className="mt-5 flex flex-col gap-4 text-sm font-semibold">
            <div className="admin-soft-surface p-4">
              <p className="text-zinc-500">API base URL</p>
              <p className="mt-1 break-all font-black">{apiBaseUrl}</p>
            </div>
            <div className="admin-soft-surface p-4">
              <p className="text-zinc-500">Admin user</p>
              <p className="mt-1 font-black">{userLabel || "Not logged in"}</p>
            </div>
            <div className="admin-soft-surface p-4">
              <p className="text-zinc-500">Token</p>
              <p className="mt-1 font-black">{token ? "Stored in this browser" : "No active admin token"}</p>
            </div>
          </div>
        </div>
        <div className="admin-card p-5">
          <p className="admin-eyebrow">Operating model</p>
          <h2 className="admin-card-title">Catalog source of truth</h2>
          <p className="admin-muted mt-4">
            Categories and subcategories are derived from product records. Rename and archive
            operations update matching products and the storefront category tree.
          </p>
        </div>
      </section>
    </div>
  );
}
