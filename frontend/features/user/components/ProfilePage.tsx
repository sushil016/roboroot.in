"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ExternalLink, GraduationCap, Mail, Shield, User } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { MagicCard } from "@/components/ui/magic-card";
import { AccountShell } from "@/features/user/components/AccountShell";
import { useAuthStore } from "@/store/user.store";
import { authApi } from "@/features/auth/services/auth.service";
import { env } from "@/lib/env";

const ADMIN_ROLES = ["ADMIN", "SUPER_ADMIN"];
const ADMIN_URL = env.adminUrl;

function getInitials(name: string | null | undefined, email: string): string {
  if (name) {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  }
  return email[0]?.toUpperCase() ?? "U";
}

const INFO_ROWS = (user: { name?: string | null; email: string; college?: string | null; role: string }) => [
  { icon: User, label: "Full Name", value: user.name || "Not provided" },
  { icon: Mail, label: "Email Address", value: user.email },
  { icon: GraduationCap, label: "College / University", value: user.college || "Not provided" },
  { icon: Shield, label: "Account Role", value: user.role.charAt(0) + user.role.slice(1).toLowerCase() },
];

export function ProfilePage() {
  const { user, isAuthenticated, isLoading, setUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: "", college: "", avatarUrl: "" });

  useEffect(() => {
    if (user) {
      setProfileForm({ name: user.name || "", college: user.college || "", avatarUrl: user.avatarUrl || "" });
    }
  }, [user]);

  if (!isAuthenticated && !isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-5 px-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#E8E8E6]">
          <User className="h-7 w-7 text-zinc-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#222222]">Login to view your profile</h1>
          <p className="mt-1 text-sm text-zinc-500">Your account, orders, wishlist, and settings live here.</p>
        </div>
        <Button asChild className="bg-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/90">
          <Link href="/login?redirect=/profile">Login</Link>
        </Button>
      </div>
    );
  }

  async function handleProfileSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updatedUser = await authApi.updateProfile({
        name: profileForm.name,
        college: profileForm.college,
        avatarUrl: profileForm.avatarUrl,
      });
      setUser(updatedUser);
      setIsEditing(false);
      toast.success("Profile updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <AccountShell>
      {isLoading ? (
        <div className="max-w-2xl space-y-4">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-4 w-64" />
          <div className="rounded-2xl border border-[#D2D2D0] bg-white p-6 flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full shrink-0" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          </div>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[68px] rounded-xl" />
          ))}
        </div>
      ) : user ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl space-y-5"
        >
          <div>
            <h1 className="text-2xl font-bold text-[#222222]">Profile</h1>
            <p className="mt-1 text-sm text-zinc-500">Manage your account details and preferences.</p>
          </div>

          {/* Admin Console shortcut */}
          {ADMIN_ROLES.includes(user.role) && (
            <a
              href={ADMIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-2xl border border-[var(--brand-primary)]/30 bg-[var(--brand-primary)]/5 px-5 py-4 transition-colors hover:bg-[var(--brand-primary)]/10"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-primary)]">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[var(--brand-primary)]">Admin Console</p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Manage products, orders, categories and more
                </p>
              </div>
              <ExternalLink className="h-4 w-4 text-[var(--brand-primary)] shrink-0" />
            </a>
          )}

          {/* Avatar card */}
          <MagicCard
            className="rounded-2xl [--color-background:#ffffff]"
            gradientFrom="var(--brand-primary)"
            gradientTo="#E8E8E6"
            gradientColor="var(--brand-primary)"
            gradientOpacity={0.06}
          >
            <div className="flex items-center gap-5 p-6">
              <Avatar className="h-16 w-16 border-2 border-[var(--brand-primary)]/20 shrink-0">
                <AvatarImage src={user.avatarUrl || undefined} alt={user.name || user.email} />
                <AvatarFallback className="bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] text-xl font-bold">
                  {getInitials(user.name, user.email)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-[#222222] truncate">{user.name || "User"}</h2>
                <p className="text-sm text-zinc-500">{user.email}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="inline-flex rounded-full bg-[var(--brand-primary)]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[var(--brand-primary)]">
                    {user.role}
                  </span>
                  <span className="text-[11px] text-zinc-400">
                    Member since{" "}
                    {new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
                  </span>
                </div>
              </div>
              {!isEditing && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                  className="shrink-0 border-[#D2D2D0]"
                >
                  Edit
                </Button>
              )}
            </div>
          </MagicCard>

          {/* Edit form */}
          {isEditing ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <MagicCard
                className="rounded-2xl [--color-background:#ffffff]"
                gradientFrom="var(--brand-primary)"
                gradientTo="#E8E8E6"
                gradientColor="var(--brand-primary)"
                gradientOpacity={0.06}
              >
                <form onSubmit={handleProfileSubmit} className="p-6 space-y-4">
                  <h3 className="font-bold text-[#222222]">Edit Profile</h3>
                  <div className="space-y-3">
                    {[
                      { key: "name", label: "Full Name", placeholder: "Full name" },
                      { key: "college", label: "College / Institution", placeholder: "College or institution" },
                      { key: "avatarUrl", label: "Avatar URL", placeholder: "https://..." },
                    ].map(({ key, label, placeholder }) => (
                      <div key={key}>
                        <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                          {label}
                        </label>
                        <Input
                          value={profileForm[key as keyof typeof profileForm]}
                          onChange={(e) => setProfileForm((p) => ({ ...p, [key]: e.target.value }))}
                          placeholder={placeholder}
                          className="mt-1.5 border-[#D2D2D0] focus-visible:ring-[var(--brand-primary)]"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button disabled={isSaving} className="bg-[#222222] hover:bg-[var(--brand-primary)]">
                      {isSaving ? "Saving..." : "Save Profile"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="border-[#D2D2D0]"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </MagicCard>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {INFO_ROWS(user).map(({ icon: Icon, label, value }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.04 }}
                  whileHover={{ x: 3 }}
                >
                  <MagicCard
                    className="rounded-xl [--color-background:#ffffff]"
                    gradientFrom="var(--brand-primary)"
                    gradientTo="#E8E8E6"
                    gradientColor="var(--brand-primary)"
                    gradientOpacity={0.05}
                  >
                    <div className="flex items-center gap-4 p-4">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#E8E8E6]">
                        <Icon className="h-4 w-4 text-zinc-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400">
                          {label}
                        </p>
                        <p className="mt-0.5 text-sm font-medium text-[#222222] truncate">{value}</p>
                      </div>
                    </div>
                  </MagicCard>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      ) : null}
    </AccountShell>
  );
}
