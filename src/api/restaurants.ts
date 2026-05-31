import { apiFetch } from "@/api/client";
import type { PaginatedResponse, Restaurant } from "@/types";

type RestaurantListResponse = Restaurant[] | PaginatedResponse<Restaurant>;

export async function getRestaurants() {
  const response = await apiFetch<RestaurantListResponse>("/restaurants", { revalidate: 900 });

  if (!response) return [];

  return Array.isArray(response) ? response : response.data;
}

export async function getRestaurantById(id: string) {
  const response = await apiFetch<Restaurant>(`/restaurants/${id}`, { revalidate: 900 });
  return response || null;
}
