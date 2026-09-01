"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  ExternalLink,
  Heart,
  LogOut,
  PackageCheck,
  Settings,
  Shield,
  User,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { useAuthStore } from "@/lib/store/authStore";

const NAV_ITEMS = [
  { label: "Profile", href: "/profile", icon: User },
  { label: "Orders", href: "/orders", icon: PackageCheck },
  { label: "Wishlist", href: "/wishlist", icon: Heart },
  { label: "Settings", href: "/settings", icon: Settings },
];

const ADMIN_ROLES = ["ADMIN", "SUPER_ADMIN"];
const ADMIN_URL = process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3002";

function getInitials(name: string | null | undefined, email: string): string {
  if (name) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
  return email[0]?.toUpperCase() ?? "U";
}

export function AccountShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, clearAuth, isLoading } = useAuthStore();

  function handleLogout() {
    clearAuth();
    toast.success("Logged out successfully");
    router.push("/");
  }

  return (
    <SidebarProvider
      defaultOpen
      style={{ "--sidebar-width": "15rem" } as React.CSSProperties}
    >
      <div className="flex w-full min-h-[calc(100vh-120px)] bg-[#f2f2f0]">
        {/* Account Sidebar */}
        <Sidebar
          collapsible="none"
          className="border-r border-[#D2D2D0] bg-[#F2F2F0] shrink-0"
        >
          {/* User info header */}
          <SidebarHeader className="border-b border-[#D2D2D0] p-4">
            {isLoading ? (
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-3.5 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border-2 border-[var(--brand-primary)]/20 shrink-0">
                  <AvatarImage
                    src={user?.avatarUrl || undefined}
                    alt={user?.name || user?.email || ""}
                  />
                  <AvatarFallback className="bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] text-sm font-bold">
                    {user ? getInitials(user.name, user.email) : "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-[#222222] leading-tight">
                    {user?.name || "User"}
                  </p>
                  <p className="truncate text-[11px] text-zinc-500 mt-0.5">
                    {user?.email}
                  </p>
                </div>
              </div>
            )}
          </SidebarHeader>

          {/* Navigation */}
          <SidebarContent className="p-2">
            <SidebarGroup>
              <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400 px-2 mb-1">
                My Account
              </SidebarGroupLabel>
              <SidebarMenu>
                {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
                  const isActive = pathname === href;
                  return (
                    <SidebarMenuItem key={href}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        className={
                          isActive
                            ? "bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] font-semibold hover:bg-[var(--brand-primary)]/15 hover:text-[var(--brand-primary)]"
                            : "text-zinc-600 hover:text-[#222222] hover:bg-[#E8E8E6]"
                        }
                      >
                        <Link href={href} className="flex items-center gap-2.5">
                          <Icon className="h-4 w-4 shrink-0" />
                          <span>{label}</span>
                          {isActive && (
                            <motion.div
                              layoutId="account-nav-indicator"
                              className="ml-auto h-1.5 w-1.5 rounded-full bg-[var(--brand-primary)]"
                              transition={{ duration: 0.2 }}
                            />
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>

          {/* Admin Console link */}
          {user && ADMIN_ROLES.includes(user.role) && (
            <div className="border-t border-[#D2D2D0] p-2">
              <a
                href={ADMIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-sm font-semibold text-[var(--brand-primary)] transition-colors hover:bg-[var(--brand-primary)]/10"
              >
                <Shield className="h-4 w-4 shrink-0" />
                <span>Admin Console</span>
                <ExternalLink className="ml-auto h-3 w-3 opacity-60" />
              </a>
            </div>
          )}

          {/* Logout */}
          <SidebarFooter className="border-t border-[#D2D2D0] p-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleLogout}
                  className="text-zinc-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-4 w-4 shrink-0" />
                  <span>Sign Out</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        {/* Main content */}
        <div className="flex-1 min-w-0 px-6 py-8 lg:px-10">
          {children}
        </div>
      </div>
    </SidebarProvider>
  );
}
