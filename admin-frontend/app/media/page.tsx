"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdmin } from "@/core/context/AdminContext";
import { MediaView } from "@/components/admin/sections/MediaView";
import type { Product } from "@/types";
import { fetchProducts } from "@/api/products";

export default function MediaPage() {
  const router = useRouter();
  const { token, setStatus, setIsLoading } = useAdmin();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts() {
      setIsLoading(true);
      try {
        const productList = await fetchProducts(token).catch(() => [] as Product[]);
        setProducts(productList);
        setStatus("Media loaded");
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Failed to load media");
      } finally {
        setIsLoading(false);
      }
    }
    
    if (token) {
      void loadProducts();
    }
  }, [token, setStatus, setIsLoading]);

  return (
    <MediaView 
      products={products} 
      onEditProduct={(p) => router.push(p ? `/products/${p.id}` : "/products/new")} 
    />
  );
}
