"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";
import { useAdmin } from "@/core/context/AdminContext";
import { STOREFRONT_URL } from "@/config/env";
import type { AdminSection } from "@/types";

export function AdminAppShell({ children }: { children: React.ReactNode }) {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { token, userLabel, logout, status, isLoading, isAutoLogging } = useAdmin();
  const pathname = usePathname();

  let activeSection: AdminSection = "dashboard";
  if (pathname.startsWith("/products")) activeSection = "products";
  else if (pathname.startsWith("/categories")) activeSection = "categories";
  else if (pathname.startsWith("/subcategories")) activeSection = "subcategories";
  else if (pathname.startsWith("/projects")) activeSection = "projects";
  else if (pathname.startsWith("/orders")) activeSection = "orders";
  else if (pathname.startsWith("/coupons")) activeSection = "coupons";
  else if (pathname.startsWith("/media")) activeSection = "media";
  else if (pathname.startsWith("/settings")) activeSection = "settings";
  else if (pathname.startsWith("/catalog")) activeSection = "catalog";

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[#F2F2F0] text-[#222222]">
      <AdminSidebar
        activeSection={activeSection}
        isExpanded={isSidebarExpanded}
        isMobileOpen={isMobileSidebarOpen}
        userLabel={userLabel}
        hasToken={!!token}
        onSelect={() => {}}
        onToggleExpanded={() => setIsSidebarExpanded((current) => !current)}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onLogout={logout}
      />

      <div className={`transition-[padding] duration-300 ${isSidebarExpanded ? "lg:pl-64" : "lg:pl-20"}`}>
        <AdminHeader
          activeSection={activeSection}
          status={status}
          isLoading={isLoading}
          userLabel={userLabel}
          hasToken={!!token}
          onRefresh={handleRefresh}
          onOpenSidebar={() => setIsMobileSidebarOpen(true)}
        />

        <main className="px-4 py-6 sm:px-6 lg:px-8">
          {isAutoLogging && (
            <div className="mb-6 flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
              <div className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-[#222222] border-t-transparent" />
              <p className="text-sm font-semibold text-zinc-600">Authenticating via session...</p>
            </div>
          )}

          {!isAutoLogging && !token ? (
            <div className="mb-6 rounded-2xl border border-zinc-300 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="admin-eyebrow">Authentication Required</p>
                  <h2 className="mt-1 text-xl font-extrabold text-[#222222]">Sign in via RoboRoot to continue</h2>
                  <p className="mt-1 text-sm text-zinc-500">
                    Log in with an admin account on the storefront, then return here.
                  </p>
                </div>
                <a
                  href={`${STOREFRONT_URL}/login?redirect=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "/")}`}
                  className="admin-button admin-button-primary shrink-0"
                >
                  Sign in to RoboRoot
                </a>
              </div>
            </div>
          ) : (
            !isAutoLogging && <>{children}</>
          )}
        </main>
      </div>
    </div>
  );
}
