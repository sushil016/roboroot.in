"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authApi } from "@/features/auth/services/auth.service";
import { useAuthStore } from "@/store/user.store";
import { useCartStore } from "@/store/cart.store";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { legalApi } from "@/features/legal/services/legal.service";

function OAuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);
  const syncCartToServer = useCartStore((s) => s.syncToServer);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const errorParam = searchParams.get("error");
      if (errorParam) {
        setError("Authentication failed");
        toast.error("Authentication failed", {
          description: decodeURIComponent(errorParam),
        });
        setTimeout(() => router.push("/login"), 2000);
        return;
      }

      try {
        // Backend already set the httpOnly cookies before redirecting here.
        // Just fetch the current user — if cookies are valid, this succeeds.
        const user = await authApi.getCurrentUser();
        await legalApi.claimAnonymousConsents().catch(() => undefined);

        setAuth(user);
        syncCartToServer();

        toast.success("Signed in successfully!", {
          description: `Welcome, ${user.name || user.email}`,
        });

        const redirectTo = searchParams.get("redirect") || "/";
        router.push(redirectTo);
        router.refresh();
      } catch {
        setError("Failed to complete sign-in");
        toast.error("Authentication failed", {
          description: "Could not retrieve your account. Please try again.",
        });
        setTimeout(() => router.push("/login"), 2000);
      }
    };

    handleCallback();
  }, [searchParams, router, setAuth, syncCartToServer]);

  if (error) {
    return (
      <div className="text-center space-y-3">
        <p className="text-base font-bold text-red-500">Authentication Error</p>
        <p className="text-sm text-zinc-500">{error}</p>
        <p className="text-xs text-zinc-400">Redirecting to login…</p>
      </div>
    );
  }

  return (
    <div className="text-center space-y-4">
      <Loader2 className="h-8 w-8 animate-spin mx-auto text-[var(--brand-primary)]" />
      <p className="text-base font-bold text-[#222222]">Completing sign-in…</p>
      <p className="text-sm text-zinc-500">Please wait</p>
    </div>
  );
}

export function AuthCallbackPage() {
  return (
    <div className="flex min-h-screen items-center justify-center" style={{ background: "#F2F2F0" }}>
      <Suspense fallback={null}>
        <OAuthCallbackContent />
      </Suspense>
    </div>
  );
}
