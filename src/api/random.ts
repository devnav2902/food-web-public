import { apiFetch } from "@/api/client";
import { fallbackDishes } from "@/lib/seed-data";
import type { Dish, RandomFilters } from "@/types";

type BackendRandomDish = {
  id: number | string;
  name: string;
  suggested_by?: string;
  restaurant_id?: number | string;
  restaurant_name?: string;
  restaurant_phone?: string;
  restaurant_wifi_password?: string;
  restaurant_street_address?: string;
  restaurant_price_min?: number | string;
  restaurant_price_max?: number | string;
  rating_avg?: number | string;
  rating_count?: number | string;
};

type BackendRandomDishesResponse =
  | { data: BackendRandomDish[] }
  | { data: { data: BackendRandomDish[] } };

function buildQuery(filters?: RandomFilters) {
  const params = new URLSearchParams();

  if (filters?.categoryId) params.set("categoryId", filters.categoryId);
  if (filters?.restaurantId) params.set("restaurantId", filters.restaurantId);
  if (filters?.budget) params.set("budget", filters.budget);
  if (filters?.nearMe) params.set("nearMe", "true");
  if (filters?.latitude) params.set("lat", String(filters.latitude));
  if (filters?.longitude) params.set("lng", String(filters.longitude));

  const query = params.toString();
  return query ? `?${query}` : "";
}

function slugifyVietnamese(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getBackendDishes(response: BackendRandomDishesResponse | null) {
  if (!response) return [];
  return Array.isArray(response.data) ? response.data : response.data.data;
}

function toNumber(value?: number | string | null) {
  if (value === null || value === undefined) return undefined;
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : undefined;
}

function mapBackendDish(dish: BackendRandomDish): Dish {
  const restaurantId = dish.restaurant_id ? String(dish.restaurant_id) : undefined;

  return {
    id: String(dish.id),
    name: dish.name,
    slug: `${slugifyVietnamese(dish.name)}-${dish.id}`,
    rating: toNumber(dish.rating_avg),
    priceMin: toNumber(dish.restaurant_price_min),
    priceMax: toNumber(dish.restaurant_price_max),
    description: dish.restaurant_name
      ? `Món được gợi ý tại ${dish.restaurant_name}${dish.suggested_by ? ` bởi ${dish.suggested_by}` : ""}.`
      : "Món ăn được random từ dữ liệu backend.",
    restaurant: dish.restaurant_name
      ? {
          id: restaurantId || dish.restaurant_name,
          name: dish.restaurant_name,
          address: dish.restaurant_street_address,
        }
      : undefined,
  };
}

export async function getRandomDish(filters?: RandomFilters) {
  const dishes = await getRandomDishes(filters);

  return dishes[0];
}

export async function getRandomDishes(filters?: RandomFilters) {
  const response = await apiFetch<BackendRandomDishesResponse>(`/random/dishes${buildQuery(filters)}`, {
    method: "GET",
    revalidate: 0,
  });
  const dishes = getBackendDishes(response).map(mapBackendDish);

  if (dishes.length === 0) {
    return [...fallbackDishes].sort(() => Math.random() - 0.5).slice(0, 7);
  }

  return dishes;
}
