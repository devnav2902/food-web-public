import { apiFetch } from "@/api/client";
import type { Category, PaginatedResponse } from "@/types";

type CategoryListResponse = Category[] | PaginatedResponse<Category>;

export async function getCategories() {
  const response = await apiFetch<CategoryListResponse>("/categories", { revalidate: 1800 });

  if (!response) return [];

  return Array.isArray(response) ? response : response.data;
}

export async function getCategoryById(id: string) {
  const response = await apiFetch<Category>(`/categories/${id}`, { revalidate: 1800 });
  return response || null;
}
