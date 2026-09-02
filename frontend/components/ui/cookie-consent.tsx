"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  ChevronDown,
  Cookie,
  LoaderCircle,
  Lock,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  X,
} from "lucide-react";
import {
  legalApi,
  type CookieConsentSource,
  type CookiePreferences,
} from "@/features/legal/services/legal.service";
import { LEGAL_POLICY_LINKS, LEGAL_POLICY_VERSION } from "@/features/legal/constants";

interface StoredConsent {
  version: string;
  preferences: CookiePreferences;
  timestamp: string;
  source: CookieConsentSource;
  synced: boolean;
}

const STORAGE_KEY = "roboroot_cookie_consent";
export const OPEN_COOKIE_SETTINGS_EVENT = "roboroot:open-cookie-preferences";

const DEFAULT_PREFERENCES: CookiePreferences = {
  essential: true,
  preferences: false,
  analytics: false,
  marketing: false,
};

const COOKIE_CATEGORIES = [
  {
    id: "essential" as const,
    label: "Essential",
    icon: Lock,
    required: true,
    description: "Authentication, cart, payment security, CSRF protection, and consent records.",
    detail: "accessToken (1 hour), refreshToken (1 day), csrf_token (24 hours), roboroot_consent_id (1 year).",
  },
  {
    id: "preferences" as const,
    label: "Preferences",
    icon: SlidersHorizontal,
    required: false,
    description: "Remember optional storefront and interface choices on this device.",
    detail: "Browser local storage, retained until you remove it or change your choice.",
  },
  {
    id: "analytics" as const,
    label: "Analytics",
    icon: BarChart3,
    required: false,
    description: "Help us understand site use and improve product discovery.",
    detail: "Analytics identifiers may remain for up to 2 years when the service is enabled.",
  },
  {
    id: "marketing" as const,
    label: "Marketing",
    icon: Settings2,
    required: false,
    description: "Support relevant campaigns and product recommendations.",
    detail: "No marketing cookies are currently set by RoboRoot.",
  },
];

function getStoredConsent(): StoredConsent | null {
  if (typeof window === "undefined") return null;
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null") as StoredConsent | null;
    return parsed?.version === LEGAL_POLICY_VERSION ? parsed : null;
  } catch {
    return null;
  }
}

function storeConsent(
  preferences: CookiePreferences,
  source: CookieConsentSource,
  synced: boolean,
) {
  const consent: StoredConsent = {
    version: LEGAL_POLICY_VERSION,
    preferences,
    source,
    synced,
    timestamp: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
}

function Toggle({
  enabled,
  disabled,
  onChange,
}: {
  enabled: boolean;
  disabled?: boolean;
  onChange: (enabled: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      disabled={disabled}
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 ${
        enabled ? "bg-teal-600" : "bg-zinc-700"
      } ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
    >
      <span className={`h-4 w-4 rounded-full bg-white transition-transform ${enabled ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  );
}

function CategoryRow({
  category,
  enabled,
  onToggle,
}: {
  category: (typeof COOKIE_CATEGORIES)[number];
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const Icon = category.icon;

  return (
    <div className="border-t border-zinc-800 first:border-t-0">
      <div className="flex items-center gap-3 py-3">
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-zinc-800 text-zinc-300">
            <Icon className="h-4 w-4" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-2 text-sm font-bold text-white">
              {category.label}
              {category.required ? <span className="text-[10px] uppercase text-teal-400">Required</span> : null}
            </span>
            <span className="mt-0.5 block truncate text-xs text-zinc-500">{category.description}</span>
          </span>
          <ChevronDown className={`h-4 w-4 shrink-0 text-zinc-500 transition-transform ${expanded ? "rotate-180" : ""}`} />
        </button>
        <Toggle enabled={enabled} disabled={category.required} onChange={onToggle} />
      </div>
      <AnimatePresence initial={false}>
        {expanded ? (
          <motion.p
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden pb-3 pl-11 text-xs leading-5 text-zinc-400"
          >
            {category.detail}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(DEFAULT_PREFERENCES);

  useEffect(() => {
    const stored = getStoredConsent();
    if (!stored) {
      setVisible(true);
    } else {
      setPreferences(stored.preferences);
      if (!stored.synced) {
        void legalApi.recordCookiePreferences(stored.preferences, stored.source)
          .then(() => storeConsent(stored.preferences, stored.source, true))
          .catch(() => undefined);
      }
    }

    const openPreferences = () => {
      setShowPreferences(true);
      setVisible(true);
    };
    window.addEventListener(OPEN_COOKIE_SETTINGS_EVENT, openPreferences);
    return () => window.removeEventListener(OPEN_COOKIE_SETTINGS_EVENT, openPreferences);
  }, []);

  const saveAndLog = useCallback(async (
    nextPreferences: CookiePreferences,
    source: CookieConsentSource,
  ) => {
    storeConsent(nextPreferences, source, false);
    setPreferences(nextPreferences);
    setVisible(false);
    setShowPreferences(false);
    setIsSaving(true);
    try {
      await legalApi.recordCookiePreferences(nextPreferences, source);
      storeConsent(nextPreferences, source, true);
    } catch {
      // Respect the browser choice immediately; retry the audit sync next visit.
    } finally {
      setIsSaving(false);
    }
  }, []);

  const acceptAll = () => saveAndLog({
    essential: true,
    preferences: true,
    analytics: true,
    marketing: true,
  }, showPreferences ? "COOKIE_SETTINGS" : "COOKIE_BANNER");

  const essentialOnly = () => saveAndLog(DEFAULT_PREFERENCES, showPreferences ? "COOKIE_SETTINGS" : "COOKIE_BANNER");

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-4 left-1/2 z-[100] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2"
        >
          <section aria-label="Cookie preferences" className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 text-white shadow-2xl">
            <div className="relative p-5">
              <button
                type="button"
                onClick={() => void essentialOnly()}
                aria-label="Use essential cookies only and close"
                className="absolute right-3 top-3 rounded-md p-2 text-zinc-500 transition hover:bg-zinc-800 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-start gap-3 pr-8">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-teal-950 text-teal-400 ring-1 ring-teal-800">
                  <Cookie className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-base font-black">Your privacy choices</h2>
                  <p className="mt-1 text-xs leading-5 text-zinc-400">
                    Essential cookies keep checkout and accounts working. Optional cookies are used only with your choice. Read our{" "}
                    <Link href={LEGAL_POLICY_LINKS.cookiePolicy} className="font-bold text-teal-400 hover:underline">Cookie Policy</Link>{" "}
                    and{" "}
                    <Link href={LEGAL_POLICY_LINKS.privacyPolicy} className="font-bold text-teal-400 hover:underline">Privacy Policy</Link>.
                  </p>
                </div>
              </div>

              {showPreferences ? (
                <div className="mt-4 border-y border-zinc-800">
                  {COOKIE_CATEGORIES.map((category) => (
                    <CategoryRow
                      key={category.id}
                      category={category}
                      enabled={preferences[category.id]}
                      onToggle={(enabled) => setPreferences((current) => ({ ...current, [category.id]: enabled }))}
                    />
                  ))}
                </div>
              ) : null}

              <div className="mt-4 grid grid-cols-2 gap-2 sm:flex">
                <button
                  type="button"
                  onClick={() => setShowPreferences((value) => !value)}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-zinc-700 px-4 text-xs font-bold text-zinc-300 transition hover:border-zinc-500 hover:text-white"
                >
                  <Settings2 className="h-3.5 w-3.5" />
                  {showPreferences ? "Back" : "Customize"}
                </button>
                <button
                  type="button"
                  onClick={() => void essentialOnly()}
                  disabled={isSaving}
                  className="min-h-10 rounded-md border border-zinc-700 px-4 text-xs font-bold text-zinc-300 transition hover:border-zinc-500 hover:text-white disabled:opacity-50"
                >
                  Essential only
                </button>
                {showPreferences ? (
                  <button
                    type="button"
                    onClick={() => void saveAndLog(preferences, "COOKIE_SETTINGS")}
                    disabled={isSaving}
                    className="col-span-2 min-h-10 flex-1 rounded-md bg-teal-600 px-4 text-xs font-bold text-white transition hover:bg-teal-500 disabled:opacity-50"
                  >
                    {isSaving ? <LoaderCircle className="mx-auto h-4 w-4 animate-spin" /> : "Save choices"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => void acceptAll()}
                    disabled={isSaving}
                    className="col-span-2 inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-md bg-teal-600 px-4 text-xs font-bold text-white transition hover:bg-teal-500 disabled:opacity-50"
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Accept all
                  </button>
                )}
              </div>
            </div>
          </section>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
