import { apiFetch } from "@/api/client";
import type { Dish, DishImage, RandomFilters } from "@/types";

type BackendRandomDishImage = {
  image?: string | null;
  is_cover?: boolean;
};

type BackendRandomDish = {
  dish_id: number | string;
  dish_name: string;
  dish_slug: string;
  dish_description?: string | null;
  dish_rating_avg?: number | string | null;
  dish_rating_count?: number | string | null;
  dish_category_id?: number | string | null;
  restaurant_id?: number | string | null;
  restaurant_name?: string | null;
  restaurant_latitude?: number | string | null;
  restaurant_longitude?: number | string | null;
  restaurant_street_address?: string | null;
  province_name?: string | null;
  ward_name?: string | null;
  suggested_by_name?: string | null;
  distance_km?: number | string | null;
  coverImageUrl?: string | null;
  images?: BackendRandomDishImage[] | null;
};

type BackendRandomDishesResponse =
  | { data: BackendRandomDish[] }
  | { data: { data: BackendRandomDish[] } };

function buildQuery(filters: RandomFilters) {
  const params = new URLSearchParams({
    latitude: String(filters.latitude),
    longitude: String(filters.longitude),
  });

  if (filters.radiusKm) {
    params.set("radiusKm", String(filters.radiusKm));
  }

  if (filters.limit) {
    params.set("limit", String(filters.limit));
  }

  if (filters.categoryId) {
    params.set("category_id", filters.categoryId);
  }

  return `?${params.toString()}`;
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
  if (!response) return null;
  return Array.isArray(response.data) ? response.data : response.data.data;
}

function toNumber(value?: number | string | null) {
  if (value === null || value === undefined) return undefined;
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : undefined;
}

function mapImages(images?: BackendRandomDishImage[] | null) {
  return (images ?? [])
    .map((image): DishImage | null => {
      if (!image.image) return null;

      return {
        image: image.image,
        isCover: image.is_cover,
      };
    })
    .filter((image): image is DishImage => Boolean(image));
}

function mapBackendDish(dish: BackendRandomDish): Dish {
  const images = mapImages(dish.images);
  const imageUrl = dish.coverImageUrl || images[0]?.image;
  const wardName = dish.ward_name?.trim();
  const provinceName = dish.province_name?.trim();
  const addressParts = [
    dish.restaurant_street_address?.trim(),
    wardName,
    provinceName,
  ].filter(Boolean);

  return {
    id: String(dish.dish_id),
    name: dish.dish_name,
    slug: dish.dish_slug,
    description:
      dish.dish_description?.trim() ||
      (dish.restaurant_name
        ? `Gợi ý gần bạn tại ${dish.restaurant_name}.`
        : "Món ăn được random từ dữ liệu gần bạn."),
    imageUrl: imageUrl || undefined,
    images,
    rating: toNumber(dish.dish_rating_avg),
    ratingCount: toNumber(dish.dish_rating_count),
    distanceKm: toNumber(dish.distance_km),
    suggestedByName: dish.suggested_by_name || undefined,
    categoryId:
      dish.dish_category_id !== null && dish.dish_category_id !== undefined
        ? String(dish.dish_category_id)
        : undefined,
    restaurant: dish.restaurant_name
      ? {
          id: String(dish.restaurant_id || dish.restaurant_name),
          name: dish.restaurant_name,
          address: addressParts.join(", ") || undefined,
          ward: wardName || undefined,
          province: provinceName || undefined,
          latitude: toNumber(dish.restaurant_latitude),
          longitude: toNumber(dish.restaurant_longitude),
        }
      : undefined,
  };
}

export async function getRandomDish(filters: RandomFilters) {
  const dishes = await getRandomDishes(filters);
  return dishes[0];
}

export async function getRandomDishes(filters: RandomFilters) {
  const response = await apiFetch<BackendRandomDishesResponse>(
    `/random/dishes${buildQuery(filters)}`,
    {
      method: "GET",
      revalidate: 0,
    },
  );
  const backendDishes = getBackendDishes(response);

  if (backendDishes === null) {
    return [];
  }

  return backendDishes.map(mapBackendDish);
}
