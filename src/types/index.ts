export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string;
};

export type Restaurant = {
  id: string;
  name: string;
  slug?: string;
  address?: string;
  district?: string;
  province?: string;
  latitude?: number;
  longitude?: number;
  rating?: number;
};

export type DishImage = {
  image: string;
  isCover?: boolean;
};

export type Dish = {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
  images?: DishImage[];
  rating?: number;
  priceMin?: number;
  priceMax?: number;
  distanceKm?: number;
  suggestedByName?: string;
  categoryId?: string;
  category?: Category;
  restaurant?: Restaurant;
};

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
};

export type RandomFilters = {
  latitude: number;
  longitude: number;
  radiusKm?: number;
  limit?: number;
};
