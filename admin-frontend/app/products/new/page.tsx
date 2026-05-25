"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdmin } from "@/core/context/AdminContext";
import { emptyProductForm } from "@/config/forms";
import type { ProductForm } from "@/types";
import { createProduct, buildProductPayload } from "@/api/products";
import { ProductFormPanel } from "@/components/admin/sections/ProductFormPanel";

export default function NewProductPage() {
  const router = useRouter();
  const { token, setStatus, setIsLoading, isLoading } = useAdmin();
  const [productForm, setProductForm] = useState<ProductForm>(emptyProductForm);

  async function handleSaveProduct(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return setStatus("Not authenticated");
    
    setIsLoading(true);
    try {
      const payload = buildProductPayload(productForm);
      await createProduct(payload, token);
      setStatus(`Created product ${productForm.name}`);
      router.push("/products");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed to save product");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <button 
        onClick={() => router.push("/products")} 
        className="mb-6 admin-action"
      >
        &larr; Back to Products
      </button>
      <ProductFormPanel 
        productForm={productForm} 
        isLoading={isLoading} 
        onForm={setProductForm} 
        onSubmit={handleSaveProduct} 
        onNew={() => setProductForm(emptyProductForm)} 
      />
    </div>
  );
}
