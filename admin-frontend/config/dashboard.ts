import type { AdminSection } from "@/types";
import type { AdminIconName } from "./navigation";

export type DashboardActionId =
  | "add-product"
  | "add-category"
  | "upload-media"
  | "manage-projects"
  | "view-orders";

export type QuickActionItem = {
  id: DashboardActionId;
  label: string;
  description: string;
  icon: AdminIconName;
  targetSection: AdminSection;
  primary?: boolean;
};

export const quickActionItems: QuickActionItem[] = [
  {
    id: "add-product",
    label: "Add Product",
    description: "Create a new catalog item",
    icon: "plus",
    targetSection: "products",
    primary: true,
  },
  {
    id: "add-category",
    label: "Add Category",
    description: "Manage product grouping",
    icon: "categories",
    targetSection: "categories",
  },
  {
    id: "upload-media",
    label: "Upload Media",
    description: "Review product images",
    icon: "upload",
    targetSection: "media",
  },
  {
    id: "manage-projects",
    label: "Manage Projects",
    description: "Edit featured builds",
    icon: "projects",
    targetSection: "projects",
  },
  {
    id: "view-orders",
    label: "View Orders",
    description: "Check customer orders",
    icon: "orders",
    targetSection: "orders",
  },
];

export const recentActivityItems = [
  "Product catalog updated",
  "Category structure refreshed",
  "Media library checked",
  "Dashboard refreshed",
] as const;

export type CatalogOverviewItem = {
  id: "products" | "categories" | "subcategories" | "bestSellers" | "lowStock";
  label: string;
  icon: AdminIconName;
};

export const catalogOverviewItems: CatalogOverviewItem[] = [
  { id: "products", label: "Products", icon: "products" },
  { id: "categories", label: "Categories", icon: "categories" },
  { id: "subcategories", label: "Sub Categories", icon: "subcategories" },
  { id: "bestSellers", label: "Best Sellers", icon: "bestSeller" },
  { id: "lowStock", label: "Low Stock", icon: "warning" },
];
