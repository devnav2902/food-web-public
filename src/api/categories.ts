import { apiFetch } from "@/api/client";
import { fallbackCategories } from "@/lib/seed-data";
import type { Category, PaginatedResponse } from "@/types";

type CategoryListResponse = Category[] | PaginatedResponse<Category>;

export async function getCategories() {
  const response = await apiFetch<CategoryListResponse>("/categories", { revalidate: 1800 });

  if (!response) return fallbackCategories;

  return Array.isArray(response) ? response : response.data;
}

export async function getCategoryById(id: string) {
  const response = await apiFetch<Category>(`/categories/${id}`, { revalidate: 1800 });
  return response || fallbackCategories.find((category) => category.id === id || category.slug === id) || null;
}
