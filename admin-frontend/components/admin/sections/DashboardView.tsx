"use client";

import type { Product, CategoryNode, Project, AdminSection } from "@/types";
import type { AdminIconName } from "@/config/navigation";
import type { DashboardActionId } from "@/config/dashboard";
import { DashboardHero } from "@/components/admin/dashboard/DashboardHero";
import { StatsCard } from "@/components/admin/dashboard/StatsCard";
import { QuickActions } from "@/components/admin/dashboard/QuickActions";
import { RecentActivity } from "@/components/admin/dashboard/RecentActivity";
import { CatalogOverview, type CatalogOverviewValues } from "@/components/admin/dashboard/CatalogOverview";

export type StatCard = {
  label: string;
  value: number | string;
  detail: string;
  icon: AdminIconName;
};

export function DashboardView({
  stats,
  products,
  categories,
  projects,
  status,
  onEditProduct,
  onSelectSection,
}: {
  stats: StatCard[];
  products: Product[];
  categories: CategoryNode[];
  projects: Project[];
  status: string;
  onEditProduct: (product?: Product, targetSection?: AdminSection) => void;
  onSelectSection: (section: AdminSection) => void;
}) {
  const catalogValues: CatalogOverviewValues = {
    products: products.length,
    categories: categories.length,
    subcategories: categories.reduce((sum, category) => sum + category.subcategories.length, 0),
    bestSellers: products.filter((product) => product.isBestSeller).length,
    lowStock: products.filter((product) => product.stockQuantity <= 10).length,
  };

  function handleQuickAction(actionId: DashboardActionId) {
    if (actionId === "add-product") {
      onEditProduct(undefined, "products");
      return;
    }

    if (actionId === "add-category") {
      onSelectSection("categories");
      return;
    }

    if (actionId === "upload-media") {
      onSelectSection("media");
      return;
    }

    if (actionId === "manage-projects") {
      onSelectSection("projects");
      return;
    }

    onSelectSection("orders");
  }

  return (
    <div className="space-y-6">
      <DashboardHero onAddProduct={() => onEditProduct(undefined, "products")} onBrowseCatalog={onSelectSection} />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatsCard key={stat.label} icon={stat.icon} label={stat.label} value={stat.value} detail={stat.detail} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <QuickActions onAction={handleQuickAction} />
        <RecentActivity status={status} />
        <CatalogOverview values={catalogValues} />
      </section>

      <section className="admin-panel">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="admin-panel-heading">
            <p className="admin-eyebrow">Project Workspace</p>
            <h3>{projects.length} project showcases connected</h3>
            <p className="mt-2 text-sm font-semibold text-zinc-500">
              Product, media, and order operations continue through the existing admin sections.
            </p>
          </div>
          <button type="button" onClick={() => onSelectSection("projects")} className="admin-button admin-button-secondary">
            Manage Projects
          </button>
        </div>
      </section>
    </div>
  );
}
