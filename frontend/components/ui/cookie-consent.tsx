"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, X, ShieldCheck, Settings2, Lock, BarChart3, ChevronDown } from "lucide-react";
import Link from "next/link";

/* ---------- Types ---------- */
interface CookiePreferences {
  essential: boolean;     // Always true — auth, CSRF, cart
  analytics: boolean;     // Google Analytics, Mixpanel, etc.
  marketing: boolean;     // Future ad tracking
}

interface StoredConsent {
  version: number;
  preferences: CookiePreferences;
  timestamp: string;
}

/* ---------- Constants ---------- */
const STORAGE_KEY = "roboroot_cookie_consent";
const CONSENT_VERSION = 1;

const DEFAULT_PREFERENCES: CookiePreferences = {
  essential: true,
  analytics: false,
  marketing: false,
};

/* ---------- Cookie Categories ---------- */
const COOKIE_CATEGORIES = [
  {
    id: "essential" as const,
    label: "Essential",
    icon: Lock,
    required: true,
    description: "Required for authentication, security (CSRF), shopping cart, and basic site functionality. These cannot be disabled.",
    cookies: [
      { name: "accessToken", purpose: "Login session (httpOnly)", duration: "15 min" },
      { name: "refreshToken", purpose: "Session renewal (httpOnly)", duration: "7 days" },
      { name: "csrf_token", purpose: "CSRF protection", duration: "24 hours" },
      { name: "sidebar_state", purpose: "Sidebar preference", duration: "7 days" },
    ],
  },
  {
    id: "analytics" as const,
    label: "Analytics",
    icon: BarChart3,
    required: false,
    description: "Help us understand how visitors interact with our website so we can improve user experience and product discovery.",
    cookies: [
      { name: "_ga / _gid", purpose: "Google Analytics visitor tracking", duration: "2 years / 24h" },
    ],
  },
  {
    id: "marketing" as const,
    label: "Marketing",
    icon: Settings2,
    required: false,
    description: "Used to deliver relevant product recommendations and advertisements based on your browsing behavior.",
    cookies: [
      { name: "—", purpose: "Not currently in use", duration: "—" },
    ],
  },
];

/* ---------- Helpers ---------- */
function getStoredConsent(): StoredConsent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredConsent;
    if (parsed.version !== CONSENT_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

function storeConsent(preferences: CookiePreferences) {
  const consent: StoredConsent = {
    version: CONSENT_VERSION,
    preferences,
    timestamp: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
}

/* ---------- Toggle Component ---------- */
function Toggle({
  enabled,
  onChange,
  disabled,
}: {
  enabled: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      disabled={disabled}
      onClick={() => !disabled && onChange(!enabled)}
      className={`
        relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full
        border-2 border-transparent transition-colors duration-200 ease-in-out
        focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950
        ${disabled ? "cursor-not-allowed opacity-60" : ""}
        ${enabled ? "bg-[var(--brand-primary)]" : "bg-zinc-700"}
      `}
    >
      <span
        className={`
          pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-lg
          transform transition-transform duration-200 ease-in-out
          ${enabled ? "translate-x-5" : "translate-x-0.5"}
        `}
      />
    </button>
  );
}

/* ---------- Expandable Category Row ---------- */
function CategoryRow({
  category,
  enabled,
  onToggle,
}: {
  category: typeof COOKIE_CATEGORIES[number];
  enabled: boolean;
  onToggle: (v: boolean) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const Icon = category.icon;

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/60 transition-colors hover:border-zinc-700">
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-800 ring-1 ring-zinc-700">
          <Icon className="h-4 w-4 text-zinc-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white">{category.label}</span>
            {category.required && (
              <span className="rounded-md bg-[var(--brand-primary)]/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--brand-primary)]">
                Required
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-zinc-500 line-clamp-1">{category.description}</p>
        </div>
        <div className="flex items-center gap-3">
          <div onClick={(e) => e.stopPropagation()}>
            <Toggle
              enabled={enabled}
              onChange={onToggle}
              disabled={category.required}
            />
          </div>
          <ChevronDown
            className={`h-4 w-4 text-zinc-500 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {/* Details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            <div className="border-t border-zinc-800 px-4 py-3">
              <table className="w-full">
                <thead>
                  <tr className="text-left">
                    <th className="pb-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-500">Cookie</th>
                    <th className="pb-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-500">Purpose</th>
                    <th className="pb-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-500 text-right">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {category.cookies.map((c) => (
                    <tr key={c.name} className="border-t border-zinc-800/50">
                      <td className="py-1.5 text-xs font-mono text-zinc-300">{c.name}</td>
                      <td className="py-1.5 text-xs text-zinc-400">{c.purpose}</td>
                      <td className="py-1.5 text-xs text-zinc-500 text-right">{c.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------- Main Component ---------- */
export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(DEFAULT_PREFERENCES);

  useEffect(() => {
    const stored = getStoredConsent();
    if (!stored) {
      setVisible(true);
    } else {
      setPreferences(stored.preferences);
    }
  }, []);

  const handleAcceptAll = useCallback(() => {
    const allAccepted: CookiePreferences = {
      essential: true,
      analytics: true,
      marketing: true,
    };
    storeConsent(allAccepted);
    setPreferences(allAccepted);
    setVisible(false);
  }, []);

  const handleDeclineOptional = useCallback(() => {
    const essentialOnly: CookiePreferences = {
      essential: true,
      analytics: false,
      marketing: false,
    };
    storeConsent(essentialOnly);
    setPreferences(essentialOnly);
    setVisible(false);
  }, []);

  const handleSavePreferences = useCallback(() => {
    storeConsent(preferences);
    setVisible(false);
    setShowPreferences(false);
  }, [preferences]);

  const updatePreference = useCallback(
    (key: keyof CookiePreferences, value: boolean) => {
      setPreferences((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 140, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 140, opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-4 left-1/2 z-[100] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2"
        >
          <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/95 shadow-2xl shadow-black/40 backdrop-blur-xl">
            {/* Gradient border glow */}
            <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/5" />

            {/* Close button */}
            <button
              onClick={handleDeclineOptional}
              aria-label="Close"
              className="absolute right-3 top-3 z-10 rounded-lg p-1.5 text-zinc-600 transition-colors hover:bg-zinc-800 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Main content */}
            <div className="p-5">
              {/* Header */}
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--brand-primary)]/20 to-[var(--brand-primary)]/5 ring-1 ring-[var(--brand-primary)]/30">
                  <Cookie className="h-5 w-5 text-[var(--brand-primary)]" />
                </div>
                <div className="flex-1 pr-6">
                  <h3 className="text-sm font-black text-white">Cookie Preferences</h3>
                  <p className="mt-1 text-xs leading-relaxed text-zinc-400">
                    We use cookies to keep you logged in, protect your account with CSRF tokens, and
                    improve your shopping experience.{" "}
                    <Link
                      href="/privacy"
                      className="text-[var(--brand-primary)] underline-offset-2 hover:underline"
                    >
                      Privacy Policy
                    </Link>
                  </p>
                </div>
              </div>

              {/* Preferences panel */}
              <AnimatePresence>
                {showPreferences && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="mt-4 space-y-2">
                      {COOKIE_CATEGORIES.map((cat) => (
                        <CategoryRow
                          key={cat.id}
                          category={cat}
                          enabled={preferences[cat.id]}
                          onToggle={(v) => updatePreference(cat.id, v)}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Actions */}
              <div className="mt-4 flex items-center gap-2">
                {showPreferences ? (
                  <>
                    <button
                      onClick={() => setShowPreferences(false)}
                      className="rounded-xl border border-zinc-700 px-4 py-2.5 text-xs font-bold text-zinc-400 transition-all hover:border-zinc-500 hover:text-white"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleSavePreferences}
                      className="flex-1 rounded-xl bg-[var(--brand-primary)] px-4 py-2.5 text-xs font-bold text-white transition-all hover:bg-[var(--brand-primary)]/90 hover:shadow-lg hover:shadow-[var(--brand-primary)]/20"
                    >
                      Save Preferences
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setShowPreferences(true)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-700 px-4 py-2.5 text-xs font-bold text-zinc-400 transition-all hover:border-zinc-500 hover:text-white"
                    >
                      <Settings2 className="h-3.5 w-3.5" />
                      Customize
                    </button>
                    <button
                      onClick={handleDeclineOptional}
                      className="rounded-xl border border-zinc-700 px-4 py-2.5 text-xs font-bold text-zinc-400 transition-all hover:border-zinc-500 hover:text-white"
                    >
                      Essential Only
                    </button>
                    <button
                      onClick={handleAcceptAll}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[var(--brand-primary)] px-4 py-2.5 text-xs font-bold text-white transition-all hover:bg-[var(--brand-primary)]/90 hover:shadow-lg hover:shadow-[var(--brand-primary)]/20"
                    >
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Accept All
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
