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
  rating?: number;
};

export type Dish = {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
  rating?: number;
  priceMin?: number;
  priceMax?: number;
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
  categoryId?: string;
  restaurantId?: string;
  budget?: "cheap" | "medium" | "premium";
  nearMe?: boolean;
  latitude?: number;
  longitude?: number;
};
