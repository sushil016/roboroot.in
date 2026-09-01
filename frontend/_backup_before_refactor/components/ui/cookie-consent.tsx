"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, X, ShieldCheck, ExternalLink } from "lucide-react";
import Link from "next/link";

const STORAGE_KEY = "roboroot_cookie_consent";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem(STORAGE_KEY, "declined");
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-4 left-1/2 z-[100] w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2"
        >
          <div className="flex flex-col gap-4 rounded-2xl border-2 border-zinc-900 bg-zinc-950 p-5 shadow-[4px_4px_0px_0px_var(--brand-primary)] sm:flex-row sm:items-center">
            {/* Icon */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-primary)]/10 ring-1 ring-[var(--brand-primary)]/30">
              <Cookie className="h-5 w-5 text-[var(--brand-primary)]" />
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-white">
                We use cookies
              </p>
              <p className="mt-0.5 text-xs font-medium leading-relaxed text-zinc-400">
                We use cookies to improve your browsing experience and analyse site traffic.
                By continuing, you agree to our{" "}
                <Link href="/privacy" className="text-[var(--brand-primary)] underline-offset-2 hover:underline">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>

            {/* Actions */}
            <div className="flex shrink-0 items-center gap-2">
              <button
                onClick={decline}
                className="rounded-xl border border-zinc-700 px-4 py-2 text-xs font-black text-zinc-400 transition-colors hover:border-zinc-500 hover:text-white"
              >
                Decline
              </button>
              <button
                onClick={accept}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--brand-primary)] px-4 py-2 text-xs font-black text-white transition-opacity hover:opacity-90"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                Accept All
              </button>
              <button
                onClick={decline}
                aria-label="Close"
                className="rounded-lg p-1.5 text-zinc-600 transition-colors hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
