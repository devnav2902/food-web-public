import Link from "next/link";
import { ChevronRight, Star } from "lucide-react";
import type { Dish } from "@/types";
import { formatCurrency } from "@/utils/format";
import { DishImage } from "@/components/dishes/DishImage";

export function DishCard({
  dish,
  priority = false,
}: {
  dish: Dish;
  priority?: boolean;
}) {
  const href = `/mon-an/${dish.slug}`;

  return (
    <article className="group overflow-hidden border border-orange-100 bg-white shadow-sm transition hover:-translate-y-1 hover:border-orange-200 hover:shadow-[0_18px_38px_rgba(120,53,15,0.12)]">
      <Link href={href} aria-label={`Xem chi tiết ${dish.name}`}>
        <DishImage
          src={dish.imageUrl}
          alt={dish.name}
          priority={priority}
          className="transition duration-300 group-hover:scale-[1.03]"
        />
      </Link>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-bold text-stone-950">
            <Link href={href} className="hover:text-orange-700">
              {dish.name}
            </Link>
          </h3>
          {dish.rating ? (
            <span className="inline-flex shrink-0 items-center gap-1 bg-orange-50 px-2 py-1 text-sm font-black text-orange-700">
              <Star
                className="h-3.5 w-3.5 fill-orange-500"
                aria-hidden="true"
              />
              {dish.rating.toFixed(1)}
            </span>
          ) : null}
        </div>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-stone-600">
          {dish.description}
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-stone-600">
          {dish.category ? (
            <span className="bg-orange-50 px-2 py-1">{dish.category.name}</span>
          ) : null}
          {dish.restaurant ? (
            <span className="bg-stone-100 px-2 py-1">
              {dish.restaurant.name}
            </span>
          ) : null}
          {dish.priceMin ? (
            <span className="bg-stone-100 px-2 py-1">
              Từ {formatCurrency(dish.priceMin)}
            </span>
          ) : null}
        </div>
        <Link
          href={href}
          className="mt-4 inline-flex items-center gap-1 text-sm font-black text-orange-700 hover:text-orange-900"
        >
          Xem món này
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
