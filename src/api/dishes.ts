import { apiFetch } from "@/api/client";
import { fallbackDishes } from "@/lib/seed-data";
import type { Dish, PaginatedResponse } from "@/types";

type DishListResponse = Dish[] | PaginatedResponse<Dish>;

export async function getFeaturedDishes(limit = 6) {
  const response = await apiFetch<DishListResponse>(`/dishes?limit=${limit}&featured=true`, {
    revalidate: 600,
  });

  const dishes = response ? (Array.isArray(response) ? response : response.data) : fallbackDishes;
  return dishes.slice(0, limit);
}

export async function getDishById(id: string) {
  const response = await apiFetch<Dish>(`/dishes/${id}`, { revalidate: 300 });
  return response || fallbackDishes.find((dish) => dish.id === id || dish.slug === id) || null;
}

export async function getRelatedDishes(categoryId?: string, excludeId?: string, limit = 4) {
  const query = categoryId ? `?categoryId=${categoryId}&limit=${limit + 1}` : `?limit=${limit + 1}`;
  const response = await apiFetch<DishListResponse>(`/dishes${query}`, { revalidate: 600 });
  const dishes = response ? (Array.isArray(response) ? response : response.data) : fallbackDishes;

  return dishes
    .filter((dish) => dish.id !== excludeId)
    .filter((dish) => !categoryId || dish.category?.id === categoryId || dish.category?.slug === categoryId)
    .slice(0, limit);
}
