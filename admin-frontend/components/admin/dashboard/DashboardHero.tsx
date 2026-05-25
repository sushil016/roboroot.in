import type { AdminSection } from "@/types";

export function DashboardHero({
  onAddProduct,
  onBrowseCatalog,
}: {
  onAddProduct: () => void;
  onBrowseCatalog: (section: AdminSection) => void;
}) {
  return (
    <section className="relative overflow-hidden rounded-xl bg-[#222222] px-6 py-8 text-white shadow-sm sm:px-8 lg:px-10 lg:py-10">
      <div
        aria-hidden="true"
        className="absolute inset-y-0 right-0 hidden w-1/2 opacity-35 lg:block"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.09) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.09) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage: "linear-gradient(90deg, transparent, black)",
        }}
      />
      <div aria-hidden="true" className="absolute right-10 top-10 hidden h-32 w-32 rounded-full bg-zinc-800/70 blur-3xl lg:block" />
      <div className="relative max-w-3xl">
        <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-zinc-300">CONTROL ROOM</p>
        <h2 className="mt-4 max-w-2xl text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
          Manage your RoboRoot store from one clean dashboard.
        </h2>
        <p className="mt-4 max-w-2xl text-sm font-semibold leading-7 text-zinc-300 sm:text-base">
          A centralized admin panel for managing products, category structure, project showcases, media assets, and orders.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <button type="button" onClick={onAddProduct} className="admin-button admin-button-light">
            Add Product
          </button>
          <button type="button" onClick={() => onBrowseCatalog("catalog")} className="admin-button admin-button-dark-invert">
            Browse Catalog
          </button>
        </div>
      </div>
    </section>
  );
}
