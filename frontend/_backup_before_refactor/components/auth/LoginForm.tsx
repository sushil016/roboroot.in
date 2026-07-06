"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/lib/hooks/useAuth";
import { loginSchema, type LoginFormData } from "@/lib/schemas/auth.schema";
import { Loader2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { OAuthButtons } from "./OAuthButtons";
import { cn } from "@/lib/utils";

export function LoginForm() {
  const { login, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  return (
    <div className="rounded-2xl border border-[#D2D2D0] bg-white px-8 py-8 shadow-lg">
      <form onSubmit={handleSubmit((d) => login(d))} className="space-y-5">
        {/* Email */}
        <div className="space-y-1.5">
          <label className="block text-sm font-bold text-[#222222]">Email</label>
          <input
            {...register("email")}
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            disabled={isLoading}
            className={cn(
              "w-full rounded-xl border bg-[#EBEBEB] px-4 py-3 text-sm font-medium text-[#222222] placeholder:text-zinc-400 outline-none transition focus:border-[#1CA2D1] focus:bg-white focus:ring-2 focus:ring-[#1CA2D1]/20",
              errors.email ? "border-red-400" : "border-[#D2D2D0]"
            )}
          />
          {errors.email && (
            <p className="text-xs font-medium text-red-500">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-bold text-[#222222]">Password</label>
            <Link
              href="/forgot-password"
              className="text-xs font-semibold text-[#1CA2D1] hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              autoComplete="current-password"
              disabled={isLoading}
              className={cn(
                "w-full rounded-xl border bg-[#EBEBEB] px-4 py-3 pr-11 text-sm font-medium text-[#222222] placeholder:text-zinc-400 outline-none transition focus:border-[#1CA2D1] focus:bg-white focus:ring-2 focus:ring-[#1CA2D1]/20",
                errors.password ? "border-red-400" : "border-[#D2D2D0]"
              )}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs font-medium text-red-500">{errors.password.message}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1CA2D1] py-3 text-sm font-black text-white shadow-md shadow-[#1CA2D1]/20 transition hover:opacity-90 disabled:opacity-60"
        >
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          {isLoading ? "Signing in…" : "Sign In"}
        </button>
      </form>

      {/* Divider */}
      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-[#D2D2D0]" />
        <span className="text-xs font-semibold text-zinc-400">OR</span>
        <div className="h-px flex-1 bg-[#D2D2D0]" />
      </div>

      <OAuthButtons isLoading={isLoading} />

      <p className="mt-6 text-center text-sm text-zinc-500">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-bold text-[#1CA2D1] hover:underline">
          Create one free
        </Link>
      </p>
    </div>
  );
}
