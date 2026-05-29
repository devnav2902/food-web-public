import { apiFetch } from "@/api/client";
import { fallbackDishes } from "@/lib/seed-data";
import type { Dish, PaginatedResponse } from "@/types";

type DishListResponse = Dish[] | PaginatedResponse<Dish>;
type BackendDish = {
  id: number | string;
  name: string;
  description?: string | null;
  rating_avg?: number | string | null;
  slug?: string;
  category?: {
    id: number | string;
    name: string;
    slug?: string;
    description?: string | null;
  } | null;
  restaurant?: {
    id: number | string;
    name: string;
    slug?: string;
    street_address?: string | null;
    ward?: {
      full_name?: string | null;
    } | null;
  } | null;
  dishImages?: Array<{
    is_cover?: boolean;
    image?: string | null;
  }> | null;
};
type RankedDish = {
  id: string;
  name: string;
  rating_avg?: number;
  rating_count?: number;
  restaurant_name?: string;
  score?: number;
};
type RankedDishResponse = {
  data: RankedDish[];
};
type DishDetailResponse = {
  data: BackendDish | null;
};

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

function toNumber(value?: number | string | null) {
  if (value === null || value === undefined) return undefined;
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : undefined;
}

function mapBackendDish(dish: BackendDish): Dish {
  const coverImage = dish.dishImages?.find((image) => image.is_cover)?.image;
  const firstImage = dish.dishImages?.[0]?.image;

  return {
    id: String(dish.id),
    name: dish.name,
    slug: dish.slug || `${slugifyVietnamese(dish.name)}-${dish.id}`,
    description: dish.description || undefined,
    imageUrl: coverImage || firstImage || undefined,
    rating: toNumber(dish.rating_avg),
    category: dish.category
      ? {
          id: String(dish.category.id),
          name: dish.category.name,
          slug: dish.category.slug || slugifyVietnamese(dish.category.name),
          description: dish.category.description || undefined,
        }
      : undefined,
    restaurant: dish.restaurant
      ? {
          id: String(dish.restaurant.id),
          name: dish.restaurant.name,
          slug: dish.restaurant.slug,
          address: dish.restaurant.street_address || undefined,
          district: dish.restaurant.ward?.full_name || undefined,
        }
      : undefined,
  };
}

function mapRankedDish(dish: RankedDish): Dish {
  return {
    id: String(dish.id),
    name: dish.name,
    slug: `${slugifyVietnamese(dish.name)}-${dish.id}`,
    rating: toNumber(dish.rating_avg),
    restaurant: dish.restaurant_name
      ? {
          id: dish.restaurant_name,
          name: dish.restaurant_name,
        }
      : undefined,
  };
}

export async function getFeaturedDishes(limit = 6) {
  const response = await apiFetch<DishListResponse>(`/dishes?limit=${limit}&featured=true`, {
    revalidate: 600,
  });

  const dishes = response ? (Array.isArray(response) ? response : response.data) : fallbackDishes;
  return dishes.slice(0, limit);
}

export async function getTopDishes(limit = 5) {
  const ranking = await apiFetch<RankedDishResponse>("/ranking/top-dishes", {
    revalidate: 600,
  });

  if (!ranking?.data?.length) {
    return getFeaturedDishes(limit);
  }

  const hydratedDishes = await Promise.all(
    ranking.data.slice(0, limit).map(async (rankedDish) => {
      const dish = await getDishById(rankedDish.id);

      if (dish) {
        return dish;
      }

      return fallbackDishes.find((item) => item.id === String(rankedDish.id)) || mapRankedDish(rankedDish);
    }),
  );

  return hydratedDishes.filter((dish): dish is Dish => Boolean(dish));
}

export async function getDishById(id: string) {
  const response = await apiFetch<DishDetailResponse>(`/dishes/${id}`, { revalidate: 300 });
  const dish = response?.data ? mapBackendDish(response.data) : null;
  return dish || fallbackDishes.find((item) => item.id === id || item.slug === id) || null;
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
