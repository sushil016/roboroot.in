import { apiFetch } from "./client";
import type { CategoryNode } from "@/types";

export async function fetchCategoryTree(token?: string): Promise<CategoryNode[]> {
  const payload = await apiFetch<{ success: boolean; data: CategoryNode[] }>(
    "/api/components/categories/tree",
    token ? { token } : {},
  );
  return payload.data;
}

export type CategoryPayload = {
  name: string;
  description?: string;
  imageUrl?: string;
  isActive?: boolean;
};

export async function fetchCategoriesAdmin(token: string) {
  const payload = await apiFetch<{ success: boolean; data: any[] }>("/api/categories", { token });
  return payload.data;
}

export async function createCategory(body: CategoryPayload, token: string) {
  const payload = await apiFetch<{ success: boolean; data: any }>("/api/categories", {
    method: "POST",
    body: JSON.stringify(body),
    token,
  });
  return payload.data;
}

export async function updateCategory(id: string, body: Partial<CategoryPayload>, token: string) {
  const payload = await apiFetch<{ success: boolean; data: any }>(`/api/categories/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
    token,
  });
  return payload.data;
}

export async function deleteCategory(id: string, token: string) {
  const payload = await apiFetch<{ success: boolean; message: string }>(`/api/categories/${id}`, {
    method: "DELETE",
    token,
  });
  return payload.message;
}

export async function createSubcategory(categoryId: string, body: CategoryPayload, token: string) {
  const payload = await apiFetch<{ success: boolean; data: any }>(`/api/categories/${categoryId}/subcategories`, {
    method: "POST",
    body: JSON.stringify(body),
    token,
  });
  return payload.data;
}

export async function updateSubcategory(categoryId: string, subId: string, body: Partial<CategoryPayload>, token: string) {
  const payload = await apiFetch<{ success: boolean; data: any }>(`/api/categories/${categoryId}/subcategories/${subId}`, {
    method: "PATCH",
    body: JSON.stringify(body),
    token,
  });
  return payload.data;
}

export async function deleteSubcategory(categoryId: string, subId: string, token: string) {
  const payload = await apiFetch<{ success: boolean; message: string }>(`/api/categories/${categoryId}/subcategories/${subId}`, {
    method: "DELETE",
    token,
  });
  return payload.message;
}
