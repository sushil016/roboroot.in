import type { AdminSection } from "@/types";

export type AdminIconName =
  | "dashboard"
  | "catalog"
  | "products"
  | "categories"
  | "subcategories"
  | "projects"
  | "orders"
  | "coupons"
  | "media"
  | "settings"
  | "menu"
  | "close"
  | "collapse"
  | "expand"
  | "refresh"
  | "storefront"
  | "logout"
  | "user"
  | "plus"
  | "upload"
  | "activity"
  | "stock"
  | "currency"
  | "bestSeller"
  | "warning";

export type SidebarItem = {
  id: AdminSection;
  label: string;
  icon: AdminIconName;
};

export const sectionItems: SidebarItem[] = [
  { id: "dashboard", label: "Dashboard", icon: "dashboard" },
  { id: "catalog", label: "Browse Catalog", icon: "catalog" },
  { id: "products", label: "Products", icon: "products" },
  { id: "categories", label: "Categories", icon: "categories" },
  { id: "subcategories", label: "Sub Categories", icon: "subcategories" },
  { id: "projects", label: "Projects", icon: "projects" },
  { id: "orders", label: "Orders", icon: "orders" },
  { id: "coupons", label: "Coupons", icon: "coupons" },
  { id: "media", label: "Images & Media", icon: "media" },
  { id: "settings", label: "Settings", icon: "settings" },
];
