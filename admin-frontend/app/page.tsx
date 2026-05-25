"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdmin } from "@/core/context/AdminContext";
import { DashboardView, type StatCard } from "@/components/admin/sections/DashboardView";
import type { AdminOrder, CategoryNode, Coupon, Product, Project } from "@/types";
import { fetchProducts } from "@/api/products";
import { fetchCategoryTree } from "@/api/categories";
import { fetchProjects } from "@/api/projects";
import { fetchAllOrders } from "@/api/orders";
import { listCoupons } from "@/api/coupons";
import { priceLabel } from "@/utils";

export default function DashboardPage() {
  const router = useRouter();
  const { token, setStatus, setIsLoading } = useAdmin();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryNode[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);

  useEffect(() => {
    async function loadDashboard() {
      setIsLoading(true);
      try {
        const [productList, categoryTree, projectList, orderList, couponList] = await Promise.all([
          fetchProducts(token).catch(() => [] as Product[]),
          fetchCategoryTree(token || undefined),
          fetchProjects(token || undefined),
          token ? fetchAllOrders(token) : Promise.resolve([] as AdminOrder[]),
          token ? listCoupons(token) : Promise.resolve([] as Coupon[]),
        ]);
        setProducts(productList);
        setCategories(categoryTree);
        setProjects(projectList);
        setOrders(orderList);
        setCoupons(couponList);
        setStatus("Dashboard refreshed");
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Failed to load dashboard");
      } finally {
        setIsLoading(false);
      }
    }

    if (token !== undefined) {
      void loadDashboard();
    }
  }, [token, setStatus, setIsLoading]);

  const stats = useMemo<StatCard[]>(() => {
    const active = products.filter((p) => p.isActive);
    const totalStockValue = products.reduce((s, p) => s + p.unitPriceCents * p.stockQuantity, 0);
    const mediaFiles = products.filter((p) => p.imageUrl).length;
    return [
      { label: "Products", value: products.length, detail: `${active.length} active`, icon: "products" },
      { label: "Categories", value: categories.length, detail: "Derived from catalog", icon: "categories" },
      {
        label: "Subcategories",
        value: categories.reduce((s, c) => s + c.subcategories.length, 0),
        detail: "Browse groups",
        icon: "subcategories",
      },
      { label: "Best Sellers", value: products.filter((p) => p.isBestSeller).length, detail: "Homepage picks", icon: "bestSeller" },
      { label: "Low Stock", value: products.filter((p) => p.stockQuantity <= 10).length, detail: "10 or less", icon: "warning" },
      { label: "Orders", value: orders.length, detail: "Admin visible", icon: "orders" },
      { label: "Stock Value", value: priceLabel(totalStockValue), detail: "Catalog estimate", icon: "currency" },
      { label: "Media Files", value: mediaFiles, detail: "Products with image", icon: "media" },
    ];
  }, [categories, orders.length, products]);

  return (
    <DashboardView
      stats={stats}
      products={products}
      categories={categories}
      projects={projects}
      status=""
      onEditProduct={(p, targetSection) => {
        if (targetSection === "media") {
           router.push("/media");
        } else if (p) {
           router.push(`/products/${p.id}`);
        } else {
           router.push("/products/new");
        }
      }}
      onSelectSection={(section) => router.push(`/${section}`)}
    />
  );
}
