"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";
import { useAdmin } from "@/core/context/AdminContext";
import { STOREFRONT_URL } from "@/config/env";
import type { AdminSection } from "@/types";
import { adminLogin } from "@/api/auth";

export function AdminAppShell({ children }: { children: React.ReactNode }) {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { token, setToken, userLabel, setUserLabel, logout, status, setStatus, isLoading, isAutoLogging } = useAdmin();
  const pathname = usePathname();

  // Login form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoginLoading, setIsLoginLoading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoginLoading(true);
    setLoginError("");
    try {
      const payload = await adminLogin(email, password);
      setToken(payload.accessToken);
      setUserLabel(payload.user.name || payload.user.email);
      localStorage.setItem("adminUserLabel", payload.user.name || payload.user.email);
      if (payload.refreshToken) {
        localStorage.setItem("adminRefreshToken", payload.refreshToken);
      }
      setStatus("Authenticated");
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoginLoading(false);
    }
  };

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
            <div className="mx-auto my-12 max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-md">
              <div className="mb-6 text-center">
                <p className="admin-eyebrow">RoboRoot Admin</p>
                <h2 className="mt-2 text-2xl font-black text-[#222222]">Control Panel Login</h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Enter your admin email and password to log in.
                </p>
              </div>

              {loginError && (
                <div className="mb-4 rounded-lg bg-red-50 p-3.5 text-xs font-bold text-red-605 border border-red-100">
                  ⚠️ {loginError}
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="grid gap-4">
                <div className="grid gap-1">
                  <label className="text-xs font-bold text-zinc-500">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@roboroot.in"
                    className="admin-input w-full"
                    required
                    disabled={isLoginLoading}
                  />
                </div>
                <div className="grid gap-1">
                  <label className="text-xs font-bold text-zinc-500">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="admin-input w-full"
                    required
                    disabled={isLoginLoading}
                  />
                </div>
                <button
                  type="submit"
                  className="admin-button admin-button-primary w-full mt-2"
                  disabled={isLoginLoading}
                >
                  {isLoginLoading ? "Logging in..." : "Login to Dashboard"}
                </button>
              </form>
            </div>
          ) : (
            !isAutoLogging && <>{children}</>
          )}
        </main>
      </div>
    </div>
  );
}
