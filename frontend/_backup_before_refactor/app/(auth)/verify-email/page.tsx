"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Mail, Loader2 } from "lucide-react";
import { API_BASE_URL } from "@/lib/api/config";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token found. Please use the link from your email.");
      return;
    }

    fetch(`${API_BASE_URL}/api/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        const data = await res.json() as { success: boolean; message?: string; error?: string };
        if (res.ok && data.success) {
          setStatus("success");
          setMessage(data.message ?? "Email verified successfully!");
        } else {
          setStatus("error");
          setMessage(data.error ?? "Verification failed. The link may have expired.");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Something went wrong. Please try again.");
      });
  }, [token]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 text-center"
    >
      {status === "loading" && (
        <>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E8E8E6] mx-auto">
            <Loader2 className="h-5 w-5 text-zinc-600 animate-spin" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Verifying your email…</h1>
          <p className="text-sm text-zinc-500">Just a moment.</p>
        </>
      )}

      {status === "success" && (
        <>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 mx-auto">
            <CheckCircle className="h-6 w-6 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Email verified!</h1>
          <p className="text-sm text-zinc-500">{message}</p>
          <Link
            href="/login"
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#222222] px-6 text-sm font-bold text-white hover:bg-[#1CA2D1] transition-colors"
          >
            Continue to login
          </Link>
        </>
      )}

      {status === "error" && (
        <>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mx-auto">
            <XCircle className="h-6 w-6 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Verification failed</h1>
          <p className="text-sm text-zinc-500">{message}</p>
          <div className="flex flex-col items-center gap-3">
            <Link
              href="/login"
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#222222] px-6 text-sm font-bold text-white hover:bg-[#1CA2D1] transition-colors"
            >
              Go to login
            </Link>
            <ResendButton />
          </div>
        </>
      )}
    </motion.div>
  );
}

function ResendButton() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleResend() {
    if (!email) return;
    setLoading(true);
    await fetch(`${API_BASE_URL}/api/auth/resend-verification`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }).catch(() => null);
    setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <p className="text-sm text-emerald-600 flex items-center gap-1.5">
        <Mail className="h-4 w-4" /> Check your inbox for a new verification link.
      </p>
    );
  }

  return (
    <div className="flex gap-2 w-full max-w-xs">
      <input
        type="email"
        placeholder="Your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="flex-1 rounded-xl border border-[#D2D2D0] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1CA2D1]"
      />
      <button
        type="button"
        onClick={handleResend}
        disabled={loading || !email}
        className="rounded-xl bg-[#E8E8E6] px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-[#D2D2D0] disabled:opacity-50 transition-colors"
      >
        {loading ? "…" : "Resend"}
      </button>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailContent />
    </Suspense>
  );
}
