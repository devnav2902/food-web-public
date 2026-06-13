export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type OpeningHoursDay = {
  open?: string;
  close?: string;
  closed?: boolean;
};

export type OpeningHours = {
  mon?: OpeningHoursDay;
  tue?: OpeningHoursDay;
  wed?: OpeningHoursDay;
  thu?: OpeningHoursDay;
  fri?: OpeningHoursDay;
  sat?: OpeningHoursDay;
  sun?: OpeningHoursDay;
};

export type Restaurant = {
  id: string;
  name: string;
  slug?: string;
  address?: string;
  streetAddress?: string;
  province?: string;
  provinceCode?: string;
  ward?: string;
  wardCode?: string;
  phone?: string;
  wifiPassword?: string;
  openingHours?: OpeningHours;
  priceMin?: number;
  priceMax?: number;
  latitude?: number;
  longitude?: number;
  rating?: number;
  status?: number;
  createdBy?: string;
  suggestedById?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type DishImage = {
  image: string;
  isCover?: boolean;
};

export type Dish = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  images?: DishImage[];
  rating?: number;
  ratingCount?: number;
  priceMin?: number;
  priceMax?: number;
  distanceKm?: number;
  suggestedByName?: string;
  suggestedById?: string;
  status?: number;
  isFeatured?: boolean;
  createdAt?: string;
  updatedAt?: string;
  categoryId?: string;
  restaurantId?: string;
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
  categoryId?: string;
};
