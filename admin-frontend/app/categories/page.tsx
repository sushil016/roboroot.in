"use client";

import { useEffect, useState } from "react";
import { useAdmin } from "@/core/context/AdminContext";
import { CategoriesView } from "@/components/admin/sections/CategoriesView";
import { fetchCategoriesAdmin } from "@/api/categories";

export default function CategoriesPage() {
  const { token, setStatus, setIsLoading } = useAdmin();
  const [categories, setCategories] = useState<any[]>([]);

  async function loadCategories() {
    setIsLoading(true);
    try {
      const categoryTree = await fetchCategoriesAdmin(token || "");
      setCategories(categoryTree || []);
      setStatus("Categories loaded");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed to load categories");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (token) {
      void loadCategories();
    }
  }, [token, setStatus, setIsLoading]);

  return (
    <CategoriesView
      categories={categories}
      token={token || ""}
      onReload={() => void loadCategories()}
    />
  );
}
