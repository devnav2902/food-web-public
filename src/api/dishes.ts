import { apiFetch } from "@/api/client";
import type { Dish, PaginatedResponse } from "@/types";

type DishListResponse = Dish[] | PaginatedResponse<Dish>;
type BackendDish = {
  id: number | string;
  name: string;
  description?: string | null;
  rating_avg?: number | string | null;
  rating_count?: number | string | null;
  slug: string;
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
  slug: string;
  coverImageUrl?: string | null;
};
type RankedDishResponse = {
  data: RankedDish[];
};
type DishDetailResponse = {
  data: BackendDish | null;
};

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
    slug: dish.slug,
    description: dish.description || undefined,
    imageUrl: coverImage || firstImage || undefined,
    rating: toNumber(dish.rating_avg),
    ratingCount: toNumber(dish.rating_count),
    category: dish.category
      ? {
          id: String(dish.category.id),
          name: dish.category.name,
          slug: dish.category.slug!,
          description: dish.category.description || undefined,
        }
      : undefined,
    restaurant: dish.restaurant
      ? {
          id: String(dish.restaurant.id),
          name: dish.restaurant.name,
          slug: dish.restaurant.slug,
          address: dish.restaurant.street_address || undefined,
          ward: dish.restaurant.ward?.full_name || undefined,
        }
      : undefined,
  };
}

function mapRankedDish(dish: RankedDish): Dish {
  const imageUrl = dish.coverImageUrl || undefined;

  return {
    id: String(dish.id),
    name: dish.name,
    slug: dish.slug,
    imageUrl,
    rating: toNumber(dish.rating_avg),
    ratingCount: toNumber(dish.rating_count),
    restaurant: dish.restaurant_name
      ? {
          id: dish.restaurant_name,
          name: dish.restaurant_name,
        }
      : undefined,
  };
}

export async function getFeaturedDishes(limit = 6) {
  const response = await apiFetch<DishListResponse>(
    `/dishes?limit=${limit}&featured=true`,
    {
      revalidate: 600,
    },
  );

  const dishes = response
    ? Array.isArray(response)
      ? response
      : response.data
    : [];
  return dishes.slice(0, limit);
}

export async function getTopDishes(limit = 5) {
  const ranking = await apiFetch<RankedDishResponse>("/ranking/top-dishes", {
    revalidate: 600,
  });

  if (!ranking?.data.length) {
    return [];
  }

  const hydratedDishes = ranking.data.slice(0, limit).map((rankedDish) => {
    return mapRankedDish(rankedDish);
  });

  return hydratedDishes;
}

export async function getDishById(id: string) {
  const response = await apiFetch<DishDetailResponse>(`/dishes/${id}`, {
    revalidate: 300,
  });
  const dish = response?.data ? mapBackendDish(response.data) : null;
  return dish || null;
}

export async function getDishBySlug(slug: string) {
  const response = await apiFetch<DishDetailResponse>(`/dishes/slug/${slug}`, {
    revalidate: 300,
  });
  const dish = response?.data ? mapBackendDish(response.data) : null;
  return dish || null;
}

export async function getRelatedDishes(
  categoryId?: string,
  excludeId?: string,
  limit = 3,
) {
  const query = categoryId
    ? `?categoryId=${categoryId}&limit=${limit + 1}`
    : `?limit=${limit + 1}`;

  const response = await apiFetch<DishListResponse>(`/dishes${query}`, {
    revalidate: 600,
  });

  const dishes = response
    ? Array.isArray(response)
      ? response
      : response.data
    : [];

  return dishes
    .filter((dish) => dish.id !== excludeId)
    .filter((dish) => !categoryId || dish.category?.id === categoryId)
    .slice(0, limit);
}
