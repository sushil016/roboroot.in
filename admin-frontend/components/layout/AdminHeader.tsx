"use client";

import { STOREFRONT_URL } from "@/config/env";
import { sectionItems } from "@/config/navigation";
import type { AdminSection } from "@/types";
import { AdminIcon } from "@/components/admin/ui/AdminIcon";

export function AdminHeader({
  activeSection,
  status,
  isLoading,
  userLabel,
  hasToken,
  onRefresh,
  onOpenSidebar,
}: {
  activeSection: AdminSection;
  status: string;
  isLoading: boolean;
  userLabel: string;
  hasToken: boolean;
  onRefresh: () => void;
  onOpenSidebar: () => void;
}) {
  const label = sectionItems.find((item) => item.id === activeSection)?.label ?? "Dashboard";

  return (
    <header className="sticky top-0 z-20 border-b border-zinc-200 bg-[#F2F2F0]/90 backdrop-blur-xl">
      <div className="flex min-h-20 flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex items-start gap-3">
          <button
            type="button"
            className="grid size-10 shrink-0 place-items-center rounded-md border border-zinc-300 bg-white text-[#222222] shadow-sm lg:hidden"
            onClick={onOpenSidebar}
            aria-label="Open sidebar"
          >
            <AdminIcon name="menu" className="h-5 w-5" />
          </button>
          <div>
            <p className="admin-eyebrow">{label}</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#222222] sm:text-3xl">
              Dashboard & Control Panel
            </h1>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-zinc-600">
              Manage products, categories, projects, media and orders from one place.
            </p>
            {status ? <p className="mt-1 text-xs font-bold text-zinc-500">{status}</p> : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={onRefresh} className="admin-button admin-button-secondary" disabled={isLoading}>
            <AdminIcon name="refresh" className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            {isLoading ? "Refreshing" : "Refresh"}
          </button>
          <a href={STOREFRONT_URL} className="admin-button admin-button-secondary">
            <AdminIcon name="storefront" className="h-4 w-4" />
            Open Storefront
          </a>
          <span className="inline-flex min-h-10 items-center gap-2 rounded-md border border-zinc-300 bg-white px-4 text-sm font-bold text-[#222222]">
            <span className={`h-2 w-2 rounded-full ${hasToken ? "bg-[#222222]" : "bg-zinc-400"}`} />
            {hasToken ? userLabel || "Admin active" : "Login required"}
          </span>
        </div>
      </div>
    </header>
  );
}
