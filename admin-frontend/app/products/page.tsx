"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdmin } from "@/core/context/AdminContext";
import { ProductsView } from "@/components/admin/sections/ProductsView";
import type { Product } from "@/types";
import { fetchProducts, archiveProduct } from "@/api/products";

export default function ProductsPage() {
  const router = useRouter();
  const { token, setStatus, setIsLoading } = useAdmin();
  const [products, setProducts] = useState<Product[]>([]);
  const [productSearch, setProductSearch] = useState("");

  useEffect(() => {
    async function loadProducts() {
      setIsLoading(true);
      try {
        const productList = await fetchProducts(token).catch(() => [] as Product[]);
        setProducts(productList);
        setStatus("Products loaded");
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Failed to load products");
      } finally {
        setIsLoading(false);
      }
    }

    if (token) {
      void loadProducts();
    }
  }, [token, setStatus, setIsLoading]);

  const filteredProducts = useMemo(() => {
    const q = productSearch.toLowerCase();
    return products.filter((p) =>
      [p.name, p.sku || "", p.category, p.subcategory, p.brand || "", p.tags.join(" ")]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [productSearch, products]);

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
    <ProductsView
      products={filteredProducts}
      productSearch={productSearch}
      onSearch={setProductSearch}
      onNew={() => router.push("/products/new")}
      onEdit={(p) => router.push(`/products/${p.id}`)}
      onArchive={handleArchiveProduct}
    />
  );
}
