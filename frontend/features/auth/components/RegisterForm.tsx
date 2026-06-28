"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { signupSchema, type SignupFormData } from "@/features/auth/schemas/auth.schema";
import { Loader2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { OAuthButtons } from "@/features/auth/components/OAuthButtons";
import { cn } from "@/lib/utils";

export function RegisterForm() {
  const { signup, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "", college: "" },
  });

  const onSubmit = (data: SignupFormData) => {
    signup({ name: data.name, email: data.email, password: data.password, college: data.college });
  };

  return (
    <div className="rounded-2xl border border-[#D8D8C4] bg-white px-8 py-8 shadow-lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name */}
        <div className="space-y-1.5">
          <label className="block text-sm font-bold text-[#222222]">
            Full Name <span className="font-normal text-zinc-400">(optional)</span>
          </label>
          <input
            {...register("name")}
            type="text"
            placeholder="Sushil Sahani"
            autoComplete="name"
            disabled={isLoading}
            className={cn(
              "w-full rounded-xl border bg-[#EBEBEB] px-4 py-3 text-sm font-medium text-[#222222] placeholder:text-zinc-400 outline-none transition focus:border-[#1CA2D1] focus:bg-white focus:ring-2 focus:ring-[#1CA2D1]/20",
              errors.name ? "border-red-400" : "border-[#D8D8C4]"
            )}
          />
          {errors.name && (
            <p className="text-xs font-medium text-red-500">{errors.name.message}</p>
          )}
        </div>

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
              errors.email ? "border-red-400" : "border-[#D8D8C4]"
            )}
          />
          {errors.email && (
            <p className="text-xs font-medium text-red-500">{errors.email.message}</p>
          )}
        </div>

        {/* College */}
        <div className="space-y-1.5">
          <label className="block text-sm font-bold text-[#222222]">
            College / University <span className="font-normal text-zinc-400">(optional)</span>
          </label>
          <input
            {...register("college")}
            type="text"
            placeholder="IIT Bombay, VIT, etc."
            disabled={isLoading}
            className="w-full rounded-xl border border-[#D8D8C4] bg-[#EBEBEB] px-4 py-3 text-sm font-medium text-[#222222] placeholder:text-zinc-400 outline-none transition focus:border-[#1CA2D1] focus:bg-white focus:ring-2 focus:ring-[#1CA2D1]/20"
          />
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label className="block text-sm font-bold text-[#222222]">Password</label>
          <div className="relative">
            <input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              placeholder="Create a strong password"
              autoComplete="new-password"
              disabled={isLoading}
              className={cn(
                "w-full rounded-xl border bg-[#EBEBEB] px-4 py-3 pr-11 text-sm font-medium text-[#222222] placeholder:text-zinc-400 outline-none transition focus:border-[#1CA2D1] focus:bg-white focus:ring-2 focus:ring-[#1CA2D1]/20",
                errors.password ? "border-red-400" : "border-[#D8D8C4]"
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

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <label className="block text-sm font-bold text-[#222222]">Confirm Password</label>
          <input
            {...register("confirmPassword")}
            type={showPassword ? "text" : "password"}
            placeholder="Repeat your password"
            autoComplete="new-password"
            disabled={isLoading}
            className={cn(
              "w-full rounded-xl border bg-[#EBEBEB] px-4 py-3 text-sm font-medium text-[#222222] placeholder:text-zinc-400 outline-none transition focus:border-[#1CA2D1] focus:bg-white focus:ring-2 focus:ring-[#1CA2D1]/20",
              errors.confirmPassword ? "border-red-400" : "border-[#D8D8C4]"
            )}
          />
          {errors.confirmPassword && (
            <p className="text-xs font-medium text-red-500">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1CA2D1] py-3 text-sm font-black text-white shadow-md shadow-[#1CA2D1]/20 transition hover:opacity-90 disabled:opacity-60"
        >
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          {isLoading ? "Creating account…" : "Create Account"}
        </button>

        <p className="text-center text-xs text-zinc-400">
          By signing up, you agree to our Terms of Service and Privacy Policy.
        </p>
      </form>

      {/* Divider */}
      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-[#D8D8C4]" />
        <span className="text-xs font-semibold text-zinc-400">OR</span>
        <div className="h-px flex-1 bg-[#D8D8C4]" />
      </div>

      <OAuthButtons isLoading={isLoading} />

      <p className="mt-6 text-center text-sm text-zinc-500">
        Already have an account?{" "}
        <Link
          href={
            typeof window !== "undefined" && new URLSearchParams(window.location.search).get("redirect")
              ? `/login?redirect=${encodeURIComponent(new URLSearchParams(window.location.search).get("redirect")!)}`
              : "/login"
          }
          className="font-bold text-[#1CA2D1] hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
