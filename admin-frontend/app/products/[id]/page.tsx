"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAdmin } from "@/core/context/AdminContext";
import { emptyProductForm } from "@/config/forms";
import type { ProductForm } from "@/types";
import { fetchProductById, updateProduct, buildProductPayload } from "@/api/products";
import { ProductFormPanel } from "@/components/admin/sections/ProductFormPanel";
import { productToForm } from "@/utils";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { token, setStatus, setIsLoading, isLoading } = useAdmin();
  const [productForm, setProductForm] = useState<ProductForm>(emptyProductForm);

  useEffect(() => {
    async function loadProduct() {
      if (!id) return;
      setIsLoading(true);
      try {
        const product = await fetchProductById(id, token);
        setProductForm(productToForm(product));
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Failed to load product");
      } finally {
        setIsLoading(false);
      }
    }
    
    if (token) {
      void loadProduct();
    }
  }, [id, token, setStatus, setIsLoading]);

  async function handleSaveProduct(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return setStatus("Not authenticated");
    
    setIsLoading(true);
    try {
      const payload = buildProductPayload(productForm);
      await updateProduct(id, payload, token);
      setStatus(`Updated product ${productForm.name}`);
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
        onNew={() => router.push("/products/new")} 
      />
    </div>
  );
}
