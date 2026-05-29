import type { Metadata } from "next";
import Link from "next/link";
import { AdSlot } from "@/components/ads/AdSlot";
import { DishCard } from "@/components/dishes/DishCard";
import { AppCta } from "@/components/layout/AppCta";
import { RandomTool } from "@/components/random/RandomTool";
import { JsonLd } from "@/components/seo/JsonLd";
import { getCategories } from "@/api/categories";
import { getFeaturedDishes } from "@/api/dishes";
import { getRestaurants } from "@/api/restaurants";
import { absoluteUrl, baseMetadata } from "@/lib/site";

export const revalidate = 900;

export const metadata: Metadata = baseMetadata({
  title: "Hôm nay ăn gì? Gợi ý món ngon nhanh, dễ chọn",
  description:
    "Không biết hôm nay ăn gì? Xem cách chọn món theo thời điểm, ngân sách, khẩu vị và dùng tool random món ăn để chốt nhanh.",
  path: "/blog/hom-nay-an-gi",
});

export default async function TodayEatBlogPage() {
  const [categories, restaurants, featuredDishes] = await Promise.all([
    getCategories(),
    getRestaurants(),
    getFeaturedDishes(4),
  ]);

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: "Hôm nay ăn gì?",
          description: metadata.description,
          mainEntityOfPage: absoluteUrl("/blog/hom-nay-an-gi"),
          inLanguage: "vi-VN",
        }}
      />
      <article>
        <p className="text-sm font-semibold uppercase tracking-wide text-orange-700">Gợi ý evergreen</p>
        <h1 className="mt-2 text-3xl font-black leading-tight text-stone-950 sm:text-4xl">Hôm nay ăn gì?</h1>
        <p className="mt-4 text-lg leading-8 text-stone-700">
          Khi quá nhiều lựa chọn làm bạn mệt, hãy bắt đầu bằng một câu hỏi nhỏ: hôm nay mình cần ăn nhanh, ăn no, ăn nhẹ hay ăn vui?
        </p>

        <section className="mt-8">
          <h2 className="text-2xl font-black text-stone-950">Chốt món theo tình huống</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="border border-orange-100 bg-white p-4">
              <h3 className="font-bold text-stone-950">Đói và cần no nhanh</h3>
              <p className="mt-2 text-sm leading-6 text-stone-700">Ưu tiên cơm tấm, phở, bún bò hoặc món có đạm rõ ràng.</p>
            </div>
            <div className="border border-orange-100 bg-white p-4">
              <h3 className="font-bold text-stone-950">Muốn nhẹ bụng</h3>
              <p className="mt-2 text-sm leading-6 text-stone-700">Chọn salad, gỏi cuốn, bún hoặc món ít dầu mỡ.</p>
            </div>
            <div className="border border-orange-100 bg-white p-4">
              <h3 className="font-bold text-stone-950">Đi nhóm</h3>
              <p className="mt-2 text-sm leading-6 text-stone-700">Lẩu, nướng hoặc món chia phần giúp cả nhóm dễ đồng thuận hơn.</p>
            </div>
            <div className="border border-orange-100 bg-white p-4">
              <h3 className="font-bold text-stone-950">Không muốn nghĩ nữa</h3>
              <p className="mt-2 text-sm leading-6 text-stone-700">Dùng random món ăn để có một quyết định đủ tốt trong vài giây.</p>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <RandomTool categories={categories} restaurants={restaurants} title="Random nhanh trong bài viết" />
        </section>

        <AdSlot id="blog-in-content" format="in-content" className="mt-8" />

        <section className="mt-8">
          <h2 className="text-2xl font-black text-stone-950">Danh mục nên thử</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {categories.map((category) => (
              <Link
                href="/"
                key={category.id}
                className="border border-orange-200 bg-white px-3 py-2 text-sm font-semibold text-stone-800 hover:bg-orange-50"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-black text-stone-950">Món gợi ý</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {featuredDishes.map((dish) => (
              <DishCard key={dish.id} dish={dish} />
            ))}
          </div>
        </section>

        <div className="mt-8">
          <AppCta compact />
        </div>
      </article>
    </main>
  );
}
