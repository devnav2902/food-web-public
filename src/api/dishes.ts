import { apiFetch } from "@/api/client";
import type { Dish, DishImage, PaginatedResponse } from "@/types";

type DishListResponse = BackendDish[] | PaginatedResponse<BackendDish>;
type BackendOpeningHoursDay = {
  open?: string;
  close?: string;
  closed?: boolean;
};

type BackendWard = {
  full_name?: string | null;
};

type BackendDish = {
  id: number | string;
  name: string;
  description?: string | null;
  rating_avg?: number | string | null;
  rating_count?: number | string | null;
  price_min?: number | string | null;
  price_max?: number | string | null;
  slug: string;
  status?: number | string | null;
  category_id?: number | string | null;
  suggested_by?: number | string | null;
  restaurant_id?: number | string | null;
  created_at?: string | null;
  updated_at?: string | null;
  is_featured?: boolean | null;
  suggestedBy?: {
    id?: number | string | null;
    name?: string | null;
  } | null;
  coverImageUrl?: string | null;
  category?: {
    id: number | string;
    name: string;
    slug?: string;
    description?: string | null;
    icon?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
  } | null;
  restaurant?: {
    id: number | string;
    name: string;
    slug?: string;
    phone?: string | null;
    status?: number | string | null;
    created_by?: number | string | null;
    suggested_by?: number | string | null;
    created_at?: string | null;
    updated_at?: string | null;
    street_address?: string | null;
    province_code?: string | null;
    ward_code?: string | null;
    wifi_password?: string | null;
    price_min?: number | string | null;
    price_max?: number | string | null;
    province?: {
      full_name?: string | null;
    } | null;
    ward?: BackendWard | null;
    opening_hours?: string | Record<string, BackendOpeningHoursDay> | null;
    latitude?: number | string | null;
    longitude?: number | string | null;
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

function parseOpeningHours(
  value?: string | Record<string, BackendOpeningHoursDay> | null,
) {
  if (!value) return undefined;

  if (typeof value !== "string") {
    return value;
  }

  try {
    const parsed = JSON.parse(value) as Record<string, BackendOpeningHoursDay>;
    return parsed;
  } catch {
    return undefined;
  }
}

function mapBackendDish(dish: BackendDish): Dish {
  const imageUrl = dish.coverImageUrl || undefined;
  const wardName = dish.restaurant?.ward?.full_name?.trim();
  const provinceName = dish.restaurant?.province?.full_name?.trim();
  const addressParts = [
    dish.restaurant?.street_address?.trim(),
    wardName,
    provinceName,
  ].filter(Boolean);

  return {
    id: String(dish.id),
    name: dish.name,
    slug: dish.slug,
    description: dish.description || undefined,
    imageUrl,
    images: (dish.dishImages ?? []).reduce<DishImage[]>((images, image) => {
      if (!image.image) {
        return images;
      }

      images.push({
        image: image.image,
        isCover: image.is_cover,
      });

      return images;
    }, []),
    rating: toNumber(dish.rating_avg),
    ratingCount: toNumber(dish.rating_count),
    priceMin: toNumber(dish.restaurant?.price_min),
    priceMax: toNumber(dish.restaurant?.price_max),
    suggestedByName: dish.suggestedBy?.name?.trim() || undefined,
    suggestedById:
      dish.suggestedBy?.id !== null && dish.suggestedBy?.id !== undefined
        ? String(dish.suggestedBy.id)
        : dish.suggested_by !== null && dish.suggested_by !== undefined
          ? String(dish.suggested_by)
          : undefined,
    status: toNumber(dish.status),
    isFeatured: Boolean(dish.is_featured),
    createdAt: dish.created_at || undefined,
    updatedAt: dish.updated_at || undefined,
    categoryId:
      dish.category_id !== null && dish.category_id !== undefined
        ? String(dish.category_id)
        : dish.category?.id !== null && dish.category?.id !== undefined
          ? String(dish.category.id)
          : undefined,
    restaurantId:
      dish.restaurant_id !== null && dish.restaurant_id !== undefined
        ? String(dish.restaurant_id)
        : dish.restaurant?.id !== null && dish.restaurant?.id !== undefined
          ? String(dish.restaurant.id)
          : undefined,
    category: dish.category
      ? {
          id: String(dish.category.id),
          name: dish.category.name,
          slug: dish.category.slug!,
          description: dish.category.description || undefined,
          icon: dish.category.icon || undefined,
          createdAt: dish.category.created_at || undefined,
          updatedAt: dish.category.updated_at || undefined,
        }
      : undefined,
    restaurant: dish.restaurant
      ? {
          id: String(dish.restaurant.id),
          name: dish.restaurant.name,
          slug: dish.restaurant.slug,
          phone: dish.restaurant.phone || undefined,
          status: toNumber(dish.restaurant.status),
          createdBy:
            dish.restaurant.created_by !== null &&
            dish.restaurant.created_by !== undefined
              ? String(dish.restaurant.created_by)
              : undefined,
          suggestedById:
            dish.restaurant.suggested_by !== null &&
            dish.restaurant.suggested_by !== undefined
              ? String(dish.restaurant.suggested_by)
              : undefined,
          createdAt: dish.restaurant.created_at || undefined,
          updatedAt: dish.restaurant.updated_at || undefined,
          streetAddress: dish.restaurant.street_address || undefined,
          address: addressParts.join(", ") || undefined,
          ward: wardName || undefined,
          wardCode: dish.restaurant.ward_code || undefined,
          province: provinceName || undefined,
          provinceCode: dish.restaurant.province_code || undefined,
          wifiPassword: dish.restaurant.wifi_password || undefined,
          openingHours: parseOpeningHours(dish.restaurant.opening_hours),
          priceMin: toNumber(dish.restaurant.price_min),
          priceMax: toNumber(dish.restaurant.price_max),
          latitude: toNumber(dish.restaurant.latitude),
          longitude: toNumber(dish.restaurant.longitude),
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
    .map((dish) => mapBackendDish(dish))
    .filter((dish) => {
      if (dish.id !== excludeId && dish.categoryId === categoryId) {
        return true;
      }

      return false;
    })
    .slice(0, limit);
}
