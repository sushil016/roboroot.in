"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdmin } from "@/core/context/AdminContext";
import { CatalogBrowser } from "@/components/admin/sections/CatalogBrowser";
import type { CategoryNode, Product } from "@/types";
import { fetchCategoryTree } from "@/api/categories";
import { fetchProducts, archiveProduct } from "@/api/products";

export default function CatalogPage() {
  const router = useRouter();
  const { token, setStatus, setIsLoading } = useAdmin();
  const [categories, setCategories] = useState<CategoryNode[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [categorySearch, setCategorySearch] = useState("");

  useEffect(() => {
    async function loadCatalog() {
      setIsLoading(true);
      try {
        const [categoryTree, productList] = await Promise.all([
          fetchCategoryTree(token || undefined),
          fetchProducts(token).catch(() => [] as Product[]),
        ]);
        setCategories(categoryTree);
        setProducts(productList);
        setStatus("Catalog loaded");
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Failed to load catalog");
      } finally {
        setIsLoading(false);
      }
    }
    if (token) {
      void loadCatalog();
    }
  }, [token, setStatus, setIsLoading]);

  useEffect(() => {
    if (!selectedCategory && categories[0]) {
      setSelectedCategory(categories[0].category);
    }
  }, [categories, selectedCategory]);

  const selectedCategoryNode = useMemo(
    () => categories.find((c) => c.category === selectedCategory) || categories[0],
    [categories, selectedCategory],
  );

  const selectedSubcategoryNode = useMemo(
    () => selectedCategoryNode?.subcategories.find((s) => s.name === selectedSubcategory),
    [selectedCategoryNode, selectedSubcategory],
  );

  const catalogProducts = useMemo(() => {
    if (selectedSubcategoryNode) return selectedSubcategoryNode.products;
    return selectedCategoryNode?.subcategories.flatMap((s) => s.products) || products;
  }, [products, selectedCategoryNode, selectedSubcategoryNode]);

  const filteredCategoryProducts = useMemo(() => {
    const q = categorySearch.toLowerCase();
    return catalogProducts.filter((p) =>
      `${p.name} ${p.brand || ""} ${p.sku || ""}`.toLowerCase().includes(q),
    );
  }, [catalogProducts, categorySearch]);

  async function handleArchiveProduct(product: Product) {
    if (!token) return;
    if (!window.confirm(`Archive ${product.name}?`)) return;
    setIsLoading(true);
    try {
      await archiveProduct(product.id, token);
      setStatus(`Archived ${product.name}`);
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed to archive product");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <CatalogBrowser
      categories={categories}
      selectedCategory={selectedCategoryNode}
      selectedSubcategory={selectedSubcategory}
      products={filteredCategoryProducts}
      search={categorySearch}
      onSearch={setCategorySearch}
      onSelectCategory={(cat) => { setSelectedCategory(cat); setSelectedSubcategory(""); }}
      onSelectSubcategory={setSelectedSubcategory}
      onEditProduct={(p) => router.push(`/products/${p.id}`)}
      onArchiveProduct={handleArchiveProduct}
    />
  );
}
