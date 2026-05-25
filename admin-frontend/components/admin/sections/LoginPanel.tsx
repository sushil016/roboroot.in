"use client";

import type { FormEvent } from "react";

export function LoginPanel({
  email,
  password,
  isLoading,
  onEmail,
  onPassword,
  onSubmit,
}: {
  email: string;
  password: string;
  isLoading: boolean;
  onEmail: (value: string) => void;
  onPassword: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <section className="mb-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#222222]">Admin Login</p>
          <h2 className="mt-1 text-2xl font-black">Authenticate to edit catalog data</h2>
        </div>
        <form onSubmit={onSubmit} className="grid gap-3 md:grid-cols-[220px_220px_auto]">
          <input
            type="email"
            value={email}
            onChange={(event) => onEmail(event.target.value)}
            placeholder="Admin email"
            className="admin-input"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(event) => onPassword(event.target.value)}
            placeholder="Password"
            className="admin-input"
            required
          />
          <button className="admin-button admin-button-primary" disabled={isLoading}>
            Login
          </button>
        </form>
      </div>
    </section>
  );
}
