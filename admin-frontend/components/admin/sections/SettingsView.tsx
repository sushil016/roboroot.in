"use client";

export function SettingsView({ apiBaseUrl, token, userLabel }: { apiBaseUrl: string; token: string; userLabel: string }) {
  return (
    <section className="grid gap-6 xl:grid-cols-2">
      <div className="admin-card p-5">
        <p className="admin-eyebrow">Environment</p>
        <h2 className="admin-card-title">API and session</h2>
        <div className="mt-5 flex flex-col gap-4 text-sm font-semibold">
          <div className="admin-soft-surface p-4">
            <p className="text-zinc-500">API base URL</p>
            <p className="mt-1 font-black">{apiBaseUrl}</p>
          </div>
          <div className="admin-soft-surface p-4">
            <p className="text-zinc-500">Admin user</p>
            <p className="mt-1 font-black">{userLabel || "Not logged in"}</p>
          </div>
          <div className="admin-soft-surface p-4">
            <p className="text-zinc-500">Token</p>
            <p className="mt-1 font-black">{token ? "Stored in this browser" : "No active admin token"}</p>
          </div>
        </div>
      </div>
      <div className="admin-card p-5">
        <p className="admin-eyebrow">Operating Model</p>
        <h2 className="admin-card-title">Catalog source of truth</h2>
        <p className="admin-muted mt-4">
          Categories and subcategories are derived from product records. Rename and archive operations update the matching products, so the storefront category tree updates immediately from the backend.
        </p>
      </div>
    </section>
  );
}
