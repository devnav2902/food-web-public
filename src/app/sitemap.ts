import type { MetadataRoute } from "next";
import { getFeaturedDishes } from "@/api/dishes";
import { absoluteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const dishes = await getFeaturedDishes(50);
  const now = new Date();

  return [
    {
      url: absoluteUrl("/"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    ...dishes.map((dish) => ({
      url: absoluteUrl(`/mon-an/${dish.slug || dish.id}`),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
