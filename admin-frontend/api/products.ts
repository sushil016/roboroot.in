import { apiFetch } from "./client";
import type { Product, ProductListResponse } from "@/types";
import { tagsToArray } from "@/utils";

export type ProductPayload = {
  name: string;
  sku?: string;
  description?: string;
  typicalUseCase?: string;
  vendorLink?: string;
  imageUrl?: string;
  category: string;
  subcategory: string;
  productType: string;
  brand?: string;
  tags: string[];
  unitPriceCents: number;
  discountedPriceCents?: number | null;
  stockQuantity: number;
  isBestSeller: boolean;
  isRobomaniacItem: boolean;
  isSoftware: boolean;
  isActive: boolean;
};

export async function fetchProducts(token: string): Promise<Product[]> {
  const payload = await apiFetch<ProductListResponse>(
    "/api/components?limit=200&sortBy=name&sortOrder=asc",
    { token },
  );
  return payload.data;
}

export async function createProduct(payload: ProductPayload, token: string): Promise<void> {
  await apiFetch("/api/components", {
    method: "POST",
    body: JSON.stringify(payload),
    token,
  });
}

export async function updateProduct(id: string, payload: Partial<ProductPayload>, token: string): Promise<void> {
  await apiFetch(`/api/components/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
    token,
  });
}

export async function archiveProduct(id: string, token: string): Promise<void> {
  await apiFetch(`/api/components/${id}`, { method: "DELETE", token });
}

export function buildProductPayload(form: {
  name: string;
  sku: string;
  description: string;
  typicalUseCase: string;
  vendorLink: string;
  imageUrl: string;
  category: string;
  subcategory: string;
  productType: string;
  brand: string;
  tags: string;
  unitPrice: string;
  discountedPrice: string;
  stockQuantity: string;
  isBestSeller: boolean;
  isRobomaniacItem: boolean;
  isSoftware: boolean;
  isActive: boolean;
}): ProductPayload {
  return {
    name: form.name,
    sku: form.sku || undefined,
    description: form.description || undefined,
    typicalUseCase: form.typicalUseCase || undefined,
    vendorLink: form.vendorLink || undefined,
    imageUrl: form.imageUrl || undefined,
    category: form.category,
    subcategory: form.subcategory,
    productType: form.productType,
    brand: form.brand || undefined,
    tags: tagsToArray(form.tags),
    unitPriceCents: Math.round(Number(form.unitPrice || 0) * 100),
    discountedPriceCents: form.discountedPrice ? Math.round(Number(form.discountedPrice) * 100) : null,
    stockQuantity: Number(form.stockQuantity || 0),
    isBestSeller: form.isBestSeller,
    isRobomaniacItem: form.isRobomaniacItem,
    isSoftware: form.isSoftware,
    isActive: form.isActive,
  };
}

export async function fetchProductById(id: string, token?: string): Promise<Product> {
  const payload = await apiFetch<{ data: Product }>(`/api/components/${id}`, { token });
  return payload.data;
}
