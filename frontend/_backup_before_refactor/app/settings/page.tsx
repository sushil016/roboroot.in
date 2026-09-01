"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Bell, Lock, Settings, User } from "lucide-react";
import { useAuthStore } from "@/lib/store/authStore";
import { AddressBook } from "@/components/account/AddressBook";
import { AccountShell } from "@/components/account/AccountShell";
import { MagicCard } from "@/components/ui/magic-card";
import { Button } from "@/components/ui/button";

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-[#D2D2D0] bg-[#F2F2F0] px-4 py-3">
      <div>
        <p className="text-sm font-semibold text-[#222222]">{label}</p>
        {description && <p className="text-xs text-zinc-500 mt-0.5">{description}</p>}
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
          checked ? "bg-[var(--brand-primary)]" : "bg-zinc-200"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition duration-200 ${
            checked ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

function SectionHeader({ icon: Icon, label }: { icon: React.FC<{ className?: string }>; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#E8E8E6]">
        <Icon className="h-3.5 w-3.5 text-zinc-600" />
      </div>
      <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">{label}</h2>
    </div>
  );
}

export default function SettingsPage() {
  const { user, isAuthenticated, clearAuth } = useAuthStore();
  const [marketing, setMarketing] = useState(true);
  const [orderUpdates, setOrderUpdates] = useState(true);

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-5 px-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#E8E8E6]">
          <Settings className="h-7 w-7 text-zinc-400" />
        </div>
        <h1 className="text-2xl font-bold text-[#222222]">Login to manage settings</h1>
        <Button asChild className="bg-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/90">
          <Link href="/login?redirect=/settings">Login</Link>
        </Button>
      </div>
    );
  }

  return (
    <AccountShell>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-2xl space-y-8"
      >
        <div>
          <h1 className="text-2xl font-bold text-[#222222]">Settings</h1>
          <p className="mt-1 text-sm text-zinc-500">Manage your account preferences and security.</p>
        </div>

        {/* Profile summary */}
        <section>
          <SectionHeader icon={User} label="Profile" />
          <MagicCard
            className="rounded-2xl [--color-background:#ffffff]"
            gradientFrom="var(--brand-primary)"
            gradientTo="#E8E8E6"
            gradientColor="var(--brand-primary)"
            gradientOpacity={0.05}
          >
            <div className="flex items-center justify-between p-5">
              <div className="space-y-1">
                <p className="text-sm font-bold text-[#222222]">{user?.name || "No name set"}</p>
                <p className="text-xs text-zinc-500">{user?.email}</p>
                <span className="inline-flex rounded-full bg-[var(--brand-primary)]/10 px-2 py-0.5 text-[10px] font-semibold text-[var(--brand-primary)]">
                  {user?.role}
                </span>
              </div>
              <Button asChild size="sm" variant="outline" className="border-[#D2D2D0] shrink-0">
                <Link href="/profile">Edit Profile</Link>
              </Button>
            </div>
          </MagicCard>
        </section>

        {/* Notifications */}
        <section>
          <SectionHeader icon={Bell} label="Notifications" />
          <div className="space-y-2">
            <ToggleRow
              label="Order updates"
              description="Get notified about your order status"
              checked={orderUpdates}
              onChange={setOrderUpdates}
            />
            <ToggleRow
              label="Offers & new arrivals"
              description="Deals, discounts, and new products"
              checked={marketing}
              onChange={setMarketing}
            />
          </div>
        </section>

        {/* Security */}
        <section>
          <SectionHeader icon={Lock} label="Security" />
          <MagicCard
            className="rounded-2xl [--color-background:#ffffff]"
            gradientFrom="var(--brand-primary)"
            gradientTo="#E8E8E6"
            gradientColor="var(--brand-primary)"
            gradientOpacity={0.05}
          >
            <div className="p-5 flex items-center justify-between gap-4">
              <p className="text-sm text-zinc-600">
                Logout from this browser if you are using a shared device.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="shrink-0 border-red-200 text-red-600 hover:bg-red-50"
                onClick={clearAuth}
              >
                Logout
              </Button>
            </div>
          </MagicCard>
        </section>

        {/* Address book */}
        <section>
          <AddressBook />
        </section>
      </motion.div>
    </AccountShell>
  );
}
