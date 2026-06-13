import { getDishBySlug, getRelatedDishes } from "@/api/dishes";
import { AdSlot } from "@/components/ads/AdSlot";
import { DishCard } from "@/components/dishes/DishCard";
import { DishGalleryLightbox } from "@/components/dishes/DishGalleryLightbox";
import { DishImage } from "@/components/dishes/DishImage";
import { AppCta } from "@/components/layout/AppCta";
import { JsonLd } from "@/components/seo/JsonLd";
import { absoluteUrl, baseMetadata } from "@/lib/site";
import { formatCurrency } from "@/utils/format";
import type { Metadata } from "next";
import { MapPin, Phone, Shuffle } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { OpeningHours } from "@/types";

type DishPageProps = {
  params: Promise<{ id: string }>;
};

export const revalidate = 300;

const OPENING_HOUR_LABELS = {
  mon: "Thứ 2",
  tue: "Thứ 3",
  wed: "Thứ 4",
  thu: "Thứ 5",
  fri: "Thứ 6",
  sat: "Thứ 7",
  sun: "Chủ nhật",
} as const;

function formatOpeningHours(hours?: OpeningHours) {
  if (!hours) {
    return [];
  }

  return Object.entries(OPENING_HOUR_LABELS).reduce<
    Array<{ key: string; label: string; value: string }>
  >((items, [key, label]) => {
    const schedule = hours[key as keyof OpeningHours];

    if (!schedule) {
      return items;
    }

    const value = schedule.closed
      ? "Nghỉ"
      : schedule.open && schedule.close
        ? `${schedule.open} - ${schedule.close}`
        : "Đang cập nhật";

    items.push({
      key,
      label,
      value,
    });

    return items;
  }, []);
}

function getInfoPills(dish: {
  category?: { name?: string };
  rating?: number;
  ratingCount?: number;
  restaurant?: { ward?: string; province?: string };
}) {
  return [
    dish.restaurant?.ward || dish.restaurant?.province
      ? dish.restaurant?.ward || dish.restaurant?.province
      : null,
  ].filter((item): item is string => Boolean(item));
}

export async function generateMetadata({
  params,
}: DishPageProps): Promise<Metadata> {
  const { id } = await params;
  const dish = await getDishBySlug(id);

  if (!dish) {
    return baseMetadata({
      title: "Không tìm thấy món ăn - Hôm Nay Ăn Gì?",
      description:
        "Món ăn này hiện chưa có dữ liệu. Hãy random món khác cho bữa hôm nay.",
      path: `/mon-an/${id}`,
    });
  }

  return baseMetadata({
    title: `${dish.name} - Gợi ý món ăn hôm nay`,
    description:
      dish.description ||
      `Xem thông tin ${dish.name}, quán ăn, danh mục, rating và random món khác.`,
    path: `/mon-an/${dish.slug}`,
    image: dish.imageUrl,
  });
}

export default async function DishPage({ params }: DishPageProps) {
  const { id } = await params;
  const dish = await getDishBySlug(id);

  if (!dish) {
    notFound();
  }

  const relatedDishes = await getRelatedDishes(dish.category?.id, dish.id, 3);
  const priceText = dish.priceMin
    ? dish.priceMax
      ? `${formatCurrency(dish.priceMin)} - ${formatCurrency(dish.priceMax)}`
      : `Từ ${formatCurrency(dish.priceMin)}`
    : "";
  const openingHours = formatOpeningHours(dish.restaurant?.openingHours);
  const infoPills = getInfoPills(dish);
  const galleryImages = dish.images?.filter((image) => image.image) ?? [];
  const mapsHref =
    dish.restaurant?.latitude !== undefined &&
    dish.restaurant?.longitude !== undefined
      ? `https://www.google.com/maps/search/?api=1&query=${dish.restaurant.latitude},${dish.restaurant.longitude}`
      : dish.restaurant?.address
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(dish.restaurant.address)}`
        : undefined;

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: dish.name,
          image: dish.imageUrl ? [dish.imageUrl] : undefined,
          category: dish.category?.name,
          brand: dish.restaurant
            ? {
                "@type": "Restaurant",
                name: dish.restaurant.name,
                address: dish.restaurant.address,
                ward: dish.restaurant.ward,
              }
            : undefined,
          aggregateRating: dish.rating
            ? {
                "@type": "AggregateRating",
                ratingValue: dish.rating,
                reviewCount: dish.ratingCount,
              }
            : undefined,
          url: absoluteUrl(`/mon-an/${dish.slug}`),
        }}
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <article className="min-w-0">
          <section className="overflow-hidden rounded-lg border border-orange-100 bg-gradient-to-br from-orange-50 via-white to-amber-50">
            <div className="grid gap-5 p-4 sm:p-5 xl:grid-cols-[minmax(0,1fr)_380px] xl:items-start xl:p-6">
              <div className="order-2 min-w-0 xl:order-1">
                <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-orange-700">
                  <span className="inline-flex max-w-full items-center gap-2 rounded-lg bg-white px-3 py-1 break-words">
                    <span aria-hidden="true">
                      {dish.category?.icon || "🍽️"}
                    </span>
                    <span className="min-w-0 break-words">
                      {dish.category?.name || "Món ăn"}
                    </span>
                  </span>
                  {dish.isFeatured ? (
                    <span className="inline-flex rounded-lg bg-orange-600 px-3 py-1 text-white">
                      Nổi bật
                    </span>
                  ) : null}
                </div>

                <h1 className="mt-3 break-words text-3xl font-black leading-tight text-stone-950 sm:text-4xl">
                  {dish.name}
                </h1>

                {infoPills.length > 0 ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {infoPills.map((item) => (
                      <span
                        key={item}
                        className="inline-flex max-w-full rounded-full bg-white px-3 py-1 text-sm text-stone-700 ring-1 ring-orange-100"
                      >
                        <span className="break-words">{item}</span>
                      </span>
                    ))}
                  </div>
                ) : null}

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="min-w-0 rounded-lg border border-orange-100 bg-white p-4">
                    <p className="text-sm font-semibold text-stone-500">
                      Giá tham khảo
                    </p>
                    <p className="mt-1 break-words text-xl font-black leading-tight text-stone-950">
                      {priceText || "Đang cập nhật"}
                    </p>
                  </div>

                  <div className="min-w-0 rounded-lg border border-orange-100 bg-white p-4">
                    <p className="text-sm font-semibold text-stone-500">
                      Đánh giá
                    </p>
                    <p className="mt-1 break-words text-xl font-black leading-tight text-stone-950">
                      {dish.rating
                        ? `${dish.rating.toFixed(1)} / 5`
                        : "Chưa có"}
                    </p>
                    <p className="mt-1 text-sm text-stone-500">
                      {dish.ratingCount
                        ? `${dish.ratingCount} lượt đánh giá`
                        : "Cộng đồng đang cập nhật"}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  {mapsHref ? (
                    <a
                      href={mapsHref}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-orange-600 px-5 text-center font-bold text-white transition hover:bg-orange-700 sm:w-auto"
                    >
                      <MapPin className="mr-2 h-4 w-4" aria-hidden="true" />
                      Xem đường đi
                    </a>
                  ) : null}

                  {dish.restaurant?.phone ? (
                    <a
                      href={`tel:${dish.restaurant.phone}`}
                      className="inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-orange-200 bg-white px-5 text-center font-bold text-orange-700 transition hover:border-orange-300 hover:bg-orange-50 sm:w-auto"
                    >
                      <Phone className="mr-2 h-4 w-4" aria-hidden="true" />
                      Gọi quán
                    </a>
                  ) : null}

                  <Link
                    href="/"
                    className="inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-stone-200 bg-white px-5 text-center font-bold text-stone-900 transition hover:border-orange-300 hover:text-orange-700 sm:w-auto"
                  >
                    <Shuffle className="mr-2 h-4 w-4" aria-hidden="true" />
                    Random món khác
                  </Link>
                </div>
              </div>

              <div className="order-1 min-w-0 xl:order-2">
                <DishImage
                  src={dish.imageUrl}
                  alt={dish.name}
                  priority
                  className="rounded-lg"
                />
              </div>
            </div>
          </section>

          {galleryImages.length > 1 ? (
            <section className="mt-6 min-w-0 rounded-lg border border-orange-100 bg-white p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-stone-950">
                    Hình ảnh món ăn
                  </h2>
                  <p className="mt-1 text-sm text-stone-500">
                    Ảnh được gửi kèm từ dữ liệu món này
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-orange-50 px-3 py-1 text-sm font-bold text-orange-700">
                  {galleryImages.length} ảnh
                </span>
              </div>

              <DishGalleryLightbox
                dishName={dish.name}
                images={galleryImages}
              />
            </section>
          ) : null}

          <div className="mt-6 grid gap-4">
            <section className="min-w-0 rounded-lg border border-orange-100 bg-white p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-stone-950">
                    Về món này
                  </h2>
                  <p className="mt-1 text-sm text-stone-500">
                    Tóm tắt nhanh để dễ quyết định
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border border-stone-200 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                      Danh mục
                    </p>
                    <p className="mt-2 break-words text-base font-bold text-stone-950">
                      {dish.category?.name || "Đang cập nhật"}
                    </p>
                    {dish.category?.description ? (
                      <p className="mt-2 break-words text-sm leading-6 text-stone-600">
                        {dish.category.description}
                      </p>
                    ) : null}
                  </div>

                  <div className="rounded-lg border border-stone-200 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                      Gợi ý bởi
                    </p>
                    <p className="mt-2 break-words text-base font-bold text-stone-950">
                      {dish.suggestedByName || "Cộng đồng"}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="min-w-0 rounded-lg border border-orange-100 bg-white p-5">
              <div>
                <h2 className="text-xl font-black text-stone-950">
                  Thông tin quán
                </h2>
                <p className="mt-1 text-sm text-stone-500">
                  Những gì bạn cần để đi hoặc liên hệ ngay
                </p>
              </div>

              <div className="mt-4 space-y-3 text-sm text-stone-700">
                <div className="min-w-0 rounded-lg bg-stone-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                    Tên quán
                  </p>
                  <p className="mt-1 break-words text-base font-bold text-stone-950">
                    {dish.restaurant?.name || "Đang cập nhật"}
                  </p>
                </div>

                <div className="min-w-0 rounded-lg bg-stone-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                    Địa chỉ
                  </p>
                  <p className="mt-1 break-words">
                    {dish.restaurant?.address ||
                      dish.restaurant?.ward ||
                      "Đang cập nhật"}
                  </p>
                </div>

                {dish.restaurant?.phone ? (
                  <div className="min-w-0 rounded-lg bg-stone-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                      Điện thoại
                    </p>
                    <p className="mt-1 break-all">{dish.restaurant.phone}</p>
                  </div>
                ) : null}

                {dish.restaurant?.wifiPassword ? (
                  <div className="min-w-0 rounded-lg bg-stone-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                      Wi-Fi
                    </p>
                    <p className="mt-1 break-all font-bold text-stone-950">
                      {dish.restaurant.wifiPassword}
                    </p>
                  </div>
                ) : null}

                {openingHours.length > 0 ? (
                  <div className="min-w-0 rounded-lg bg-stone-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                      Giờ mở cửa
                    </p>
                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                      {openingHours.map((item) => (
                        <div
                          key={item.key}
                          className="flex min-w-0 flex-col gap-1 rounded-lg bg-orange-50 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <span className="font-medium text-stone-700">
                            {item.label}
                          </span>
                          <span className="break-words font-bold text-stone-950 sm:text-right">
                            {item.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </section>
          </div>

          <AdSlot id="dish-in-content" format="in-content" className="mt-8" />

          {relatedDishes.length > 0 ? (
            <section className="mt-10">
              <h2 className="text-2xl font-black text-stone-950">
                Món liên quan
              </h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {relatedDishes.map((item) => (
                  <DishCard key={item.id} dish={item} />
                ))}
              </div>
            </section>
          ) : null}

          <div id="tai-app" className="mt-10">
            <AppCta compact />
          </div>
        </article>

        <aside className="hidden lg:block">
          <div className="sticky top-4">
            <AdSlot id="dish-sidebar" format="sidebar" />
          </div>
        </aside>
      </div>
    </main>
  );
}
