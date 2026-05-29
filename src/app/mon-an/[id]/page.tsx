import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/ads/AdSlot";
import { DishCard } from "@/components/dishes/DishCard";
import { DishImage } from "@/components/dishes/DishImage";
import { AppCta } from "@/components/layout/AppCta";
import { JsonLd } from "@/components/seo/JsonLd";
import { getDishById, getRelatedDishes } from "@/api/dishes";
import { absoluteUrl, baseMetadata } from "@/lib/site";
import { formatCurrency } from "@/utils/format";

type DishPageProps = {
  params: Promise<{ id: string }>;
};

export const revalidate = 300;

export async function generateMetadata({ params }: DishPageProps): Promise<Metadata> {
  const { id } = await params;
  const dish = await getDishById(id);

  if (!dish) {
    return baseMetadata({
      title: "Không tìm thấy món ăn - Hôm Nay Ăn Gì?",
      description: "Món ăn này hiện chưa có dữ liệu. Hãy random món khác cho bữa hôm nay.",
      path: `/mon-an/${id}`,
    });
  }

  return baseMetadata({
    title: `${dish.name} - Gợi ý món ăn hôm nay`,
    description: dish.description || `Xem thông tin ${dish.name}, quán ăn, danh mục, rating và random món khác.`,
    path: `/mon-an/${dish.slug || dish.id}`,
    image: dish.imageUrl,
  });
}

export default async function DishPage({ params }: DishPageProps) {
  const { id } = await params;
  const dish = await getDishById(id);

  if (!dish) notFound();

  const relatedDishes = await getRelatedDishes(dish.category?.id || dish.category?.slug, dish.id, 4);
  const priceText = dish.priceMin
    ? dish.priceMax
      ? `${formatCurrency(dish.priceMin)} - ${formatCurrency(dish.priceMax)}`
      : `Từ ${formatCurrency(dish.priceMin)}`
    : "";

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: dish.name,
          image: dish.imageUrl ? [dish.imageUrl] : undefined,
          description: dish.description,
          category: dish.category?.name,
          brand: dish.restaurant
            ? {
                "@type": "Restaurant",
                name: dish.restaurant.name,
                address: dish.restaurant.address || dish.restaurant.district,
              }
            : undefined,
          aggregateRating: dish.rating
            ? {
                "@type": "AggregateRating",
                ratingValue: dish.rating,
                reviewCount: 12,
              }
            : undefined,
          url: absoluteUrl(`/mon-an/${dish.slug || dish.id}`),
        }}
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <article className="min-w-0">
          <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(280px,420px)]">
            <DishImage src={dish.imageUrl} alt={dish.name} priority />
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-orange-700">
                {dish.category?.name || "Món ăn"}
              </p>
              <h1 className="mt-2 text-3xl font-black leading-tight text-stone-950 sm:text-4xl">{dish.name}</h1>
              <p className="mt-4 text-base leading-7 text-stone-700">{dish.description}</p>
              <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <div className="border border-orange-100 bg-white p-3">
                  <dt className="text-stone-500">Rating</dt>
                  <dd className="mt-1 font-bold text-stone-950">{dish.rating ? `${dish.rating.toFixed(1)} sao` : "Đang cập nhật"}</dd>
                </div>
                <div className="border border-orange-100 bg-white p-3">
                  <dt className="text-stone-500">Giá</dt>
                  <dd className="mt-1 font-bold text-stone-950">{priceText || "Đang cập nhật"}</dd>
                </div>
                <div className="border border-orange-100 bg-white p-3">
                  <dt className="text-stone-500">Quán</dt>
                  <dd className="mt-1 font-bold text-stone-950">{dish.restaurant?.name || "Gợi ý bất kỳ"}</dd>
                </div>
                <div className="border border-orange-100 bg-white p-3">
                  <dt className="text-stone-500">Khu vực</dt>
                  <dd className="mt-1 font-bold text-stone-950">{dish.restaurant?.district || "Gần bạn"}</dd>
                </div>
              </dl>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link href="/" className="inline-flex min-h-11 items-center justify-center bg-orange-600 px-5 font-bold text-white hover:bg-orange-700">
                  Random món khác
                </Link>
                <a href="#tai-app" className="inline-flex min-h-11 items-center justify-center border border-stone-300 px-5 font-semibold text-stone-800 hover:bg-white">
                  Tải app
                </a>
              </div>
            </div>
          </div>

          <AdSlot id="dish-in-content" format="in-content" className="mt-8" />

          {relatedDishes.length > 0 ? (
            <section className="mt-10">
              <h2 className="text-2xl font-black text-stone-950">Món liên quan</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
