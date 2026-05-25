"use client";

import Image from "next/image";
import Link from "next/link";
import type { AdminSection } from "@/types";
import { sectionItems } from "@/config/navigation";
import { STOREFRONT_URL } from "@/config/env";
import { AdminIcon } from "@/components/admin/ui/AdminIcon";

export function AdminSidebar({
  activeSection,
  isExpanded,
  isMobileOpen,
  userLabel,
  hasToken,
  onSelect,
  onToggleExpanded,
  onCloseMobile,
  onLogout,
}: {
  activeSection: AdminSection;
  isExpanded: boolean;
  isMobileOpen: boolean;
  userLabel: string;
  hasToken: boolean;
  onSelect: (section: AdminSection) => void;
  onToggleExpanded: () => void;
  onCloseMobile: () => void;
  onLogout: () => void;
}) {
  const desktopWidth = isExpanded ? "lg:w-64" : "lg:w-20";
  const mobileTransform = isMobileOpen ? "translate-x-0" : "-translate-x-full";

  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 ${mobileTransform} border-r border-zinc-800 bg-[#222222] text-white shadow-2xl shadow-zinc-950/20 transition-all duration-300 ease-out lg:translate-x-0 ${desktopWidth}`}
      >
        <div className="flex h-full min-h-0 flex-col px-3 py-4">
          <div className={`flex items-center gap-3 border-b border-white/10 pb-4 ${isExpanded ? "justify-between" : "justify-center"}`}>
            <div className={`flex min-w-0 items-center gap-3 ${isExpanded ? "" : "lg:justify-center"}`}>
              <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-[#F2F2F0] p-1.5">
                <Image src="/roboroot-logo.png" alt="RoboRoot" width={120} height={34} className="h-auto w-full object-contain" priority />
              </span>
              {isExpanded ? (
                <div className="min-w-0">
                  <p className="truncate text-sm font-extrabold text-white">RoboRoot</p>
                  <p className="text-xs font-semibold text-zinc-300">Admin Console</p>
                  <p className="text-xs font-semibold text-zinc-400">Store Management</p>
                </div>
              ) : null}
            </div>
            <button
              type="button"
              onClick={onToggleExpanded}
              className="hidden size-9 place-items-center rounded-md border border-white/10 text-zinc-300 transition hover:bg-zinc-800 hover:text-white lg:grid"
              aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
              title={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
            >
              <AdminIcon name={isExpanded ? "collapse" : "expand"} className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={onCloseMobile}
              className="grid size-9 place-items-center rounded-md border border-white/10 text-zinc-300 transition hover:bg-zinc-800 hover:text-white lg:hidden"
              aria-label="Close sidebar"
            >
              <AdminIcon name="close" className="h-5 w-5" />
            </button>
          </div>

          <nav className="mt-4 flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto pr-1">
            {sectionItems.map((item) => {
              const isActive = activeSection === item.id;

              return (
                <Link
                  key={item.id}
                  title={isExpanded ? undefined : item.label}
                  href={item.id === "dashboard" ? "/" : `/${item.id}`}
                  onClick={onCloseMobile}
                  className={`group flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left text-sm font-semibold transition ${
                    isActive
                      ? "bg-[#F2F2F0] text-[#222222]"
                      : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
                  } ${isExpanded ? "justify-start" : "lg:justify-center"}`}
                >
                  <span
                    className={`grid size-9 shrink-0 place-items-center rounded-lg border transition ${
                      isActive ? "border-zinc-300 bg-white" : "border-white/10 bg-white/5 group-hover:border-white/20"
                    }`}
                  >
                    <AdminIcon name={item.icon} className="h-5 w-5" />
                  </span>
                  {isExpanded ? <span className="truncate">{item.label}</span> : null}
                </Link>
              );
            })}
          </nav>

          <div className="mt-4 border-t border-white/10 pt-4">
            <a
              href={STOREFRONT_URL}
              className={`flex min-h-10 items-center justify-center gap-2 rounded-xl bg-white px-3 text-sm font-bold text-[#222222] transition hover:bg-[#F2F2F0] ${
                isExpanded ? "" : "lg:px-0"
              }`}
              title="Open Storefront"
            >
              <AdminIcon name="storefront" className="h-5 w-5" />
              {isExpanded ? <span>Open Storefront</span> : null}
            </a>

            <div className={`mt-3 rounded-xl border border-white/10 p-3 ${isExpanded ? "" : "lg:px-2"}`}>
              <div className={`flex items-center gap-3 ${isExpanded ? "" : "lg:justify-center"}`}>
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white/10 text-zinc-200">
                  <AdminIcon name="user" className="h-5 w-5" />
                </span>
                {isExpanded ? (
                  <div className="min-w-0">
                    <p className="truncate text-sm font-extrabold text-white">{hasToken ? userLabel || "Admin" : "Guest"}</p>
                    <p className="text-xs font-semibold text-zinc-400">{hasToken ? "Authenticated" : "Login required"}</p>
                  </div>
                ) : null}
              </div>
              {hasToken ? (
                <button
                  type="button"
                  onClick={onLogout}
                  className={`mt-3 flex min-h-9 w-full items-center justify-center gap-2 rounded-md border border-white/10 text-sm font-bold text-zinc-300 transition hover:bg-zinc-800 hover:text-white ${
                    isExpanded ? "px-3" : "lg:px-0"
                  }`}
                  title="Logout"
                >
                  <AdminIcon name="logout" className="h-4 w-4" />
                  {isExpanded ? <span>Logout</span> : null}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </aside>

      {isMobileOpen ? (
        <button
          aria-label="Close sidebar"
          type="button"
          className="fixed inset-0 z-30 bg-zinc-950/40 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      ) : null}
    </>
  );
}
