"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { API_BASE_URL } from "@/lib/api/config";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setIsSending(true);
    try {
      await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      // Always show success (server doesn't reveal if email exists)
      setSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E8E8E6] mx-auto">
          <Mail className="h-5 w-5 text-zinc-600" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Reset your password</h1>
        <p className="text-sm text-zinc-500">
          Enter your email and we'll send you a reset link.
        </p>
      </div>

      {sent ? (
        <div className="rounded-2xl border border-[#D2D2D0] bg-[#F2F2F0] p-6 text-center space-y-3">
          <p className="text-sm font-semibold text-[#222222]">Check your inbox</p>
          <p className="text-sm text-zinc-500">
            If this email is registered, you'll receive a reset link within a few minutes.
          </p>
          <Button asChild variant="outline" className="border-[#D2D2D0] mt-2">
            <Link href="/login">Back to login</Link>
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="border-[#D2D2D0] focus-visible:ring-[#1CA2D1]"
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button
            disabled={isSending}
            className="w-full bg-[#222222] hover:bg-[#1CA2D1]"
          >
            {isSending ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>
      )}

      <p className="text-center text-sm text-zinc-500">
        <Link href="/login" className="inline-flex items-center gap-1 hover:text-[#1CA2D1]">
          <ArrowLeft className="h-3 w-3" /> Back to login
        </Link>
      </p>
    </motion.div>
  );
}
