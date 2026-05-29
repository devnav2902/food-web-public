import type { Metadata } from "next";
import { ArrowRight, CheckCircle2, Clock3, Flame, HeartHandshake } from "lucide-react";
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

export const revalidate = 300;

export const metadata: Metadata = baseMetadata({
  title: "Random món ăn hôm nay - Hôm Nay Ăn Gì?",
  description:
    "Không biết hôm nay ăn gì? Random ngay 7 món ăn, lọc theo danh mục, quán ăn, ngân sách hoặc vị trí gần bạn.",
  path: "/",
});

export default async function HomePage() {
  const [categories, restaurants, featuredDishes] = await Promise.all([
    getCategories(),
    getRestaurants(),
    getFeaturedDishes(6),
  ]);

  const faqItems = [
    {
      question: "Random món ăn hoạt động thế nào?",
      answer:
        "Website lấy 7 món ngẫu nhiên, sau đó hiển thị một món chính cùng danh sách gợi ý để bạn chọn nhanh.",
    },
    {
      question: "Có thể random theo nhu cầu không?",
      answer:
        "Có. Bạn có thể lọc theo danh mục, quán ăn, ngân sách hoặc bật tùy chọn gần tôi nếu muốn tìm gợi ý phù hợp hơn.",
    },
    {
      question: "Khi nào nên random lại?",
      answer:
        "Nếu món đầu tiên không hợp khẩu vị, ngân sách hoặc thời tiết hôm đó, hãy random lại ngay. Lịch sử gần đây giúp bạn quay lại món đã thấy ổn.",
    },
    {
      question: "Web này có phù hợp dùng hằng ngày không?",
      answer:
        "Có. Trang ưu tiên thao tác nhanh trên điện thoại, không cần đăng nhập và có mục món gần đây để bạn dùng lại mỗi ngày.",
    },
  ];

  const decisionPlaybooks = [
    {
      title: "Đói thật sự",
      description: "Ưu tiên cơm, phở, bún bò hoặc món có đạm. Chọn mood Ăn no rồi random.",
    },
    {
      title: "Chưa biết thèm gì",
      description: "Đừng lọc quá nhiều. Random tất cả trước, sau đó bấm lại nếu món chưa đúng cảm giác.",
    },
    {
      title: "Đi cùng nhóm",
      description: "Chọn lẩu nướng hoặc món dễ chia. Gửi kết quả random cho nhóm để chốt nhanh.",
    },
  ];

  const returnReasons = [
    { title: "Không cần nghĩ lâu", description: "Một nút random cho lúc đang đói hoặc cả nhóm chưa thống nhất.", icon: Clock3 },
    { title: "Có gu hơn mỗi lần dùng", description: "Lịch sử gần đây giúp bạn nhớ món đã thấy hợp và chọn lại nhanh.", icon: HeartHandshake },
    { title: "Chốt nhanh theo mood", description: "Lọc nhẹ theo danh mục, ngân sách, quán ăn hoặc vị trí gần bạn.", icon: CheckCircle2 },
  ];

  return (
    <main>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Hôm Nay Ăn Gì?",
          url: absoluteUrl("/"),
          applicationCategory: "FoodApplication",
          operatingSystem: "Web",
          description: metadata.description,
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqItems.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: item.answer,
            },
          })),
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Món ăn nổi bật hôm nay",
          itemListElement: featuredDishes.map((dish, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: dish.name,
            url: absoluteUrl(`/mon-an/${dish.slug || dish.id}`),
          })),
        }}
      />

      <section className="mx-auto max-w-6xl px-4 py-4 sm:py-7">
        <RandomTool
          categories={categories}
          restaurants={restaurants}
          advanced
          title="Hôm nay ăn gì?"
        />
      </section>

      <div className="mx-auto max-w-6xl px-4">
        <AdSlot id="home-after-random" format="horizontal" />
      </div>

      <section className="mx-auto max-w-6xl px-4 py-10" aria-labelledby="featured-title">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-black uppercase text-orange-700">
              <Flame className="h-4 w-4" aria-hidden="true" />
              Gợi ý nhanh
            </p>
            <h2 id="featured-title" className="mt-2 text-2xl font-black tracking-tight text-stone-950 sm:text-3xl">
              Món nổi bật để chọn ngay
            </h2>
          </div>
          <Link href="/blog/hom-nay-an-gi" className="inline-flex items-center gap-1 text-sm font-bold text-orange-700 hover:text-orange-900">
            Xem cách chọn món hôm nay
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featuredDishes.map((dish, index) => (
            <DishCard key={dish.id} dish={dish} priority={index < 2} />
          ))}
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4">
        <AdSlot id="home-after-featured" format="in-content" />
      </div>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-10 lg:grid-cols-[0.95fr_1.05fr]" aria-labelledby="category-title">
        <div>
          <p className="text-sm font-black uppercase text-orange-700">Không muốn nghĩ nhiều</p>
          <h2 id="category-title" className="mt-2 text-2xl font-black tracking-tight text-stone-950 sm:text-3xl">
            Chọn theo mood ăn uống
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-stone-700">
            Danh mục giúp bạn thu hẹp lựa chọn trước khi random: ăn no, ăn nhẹ, đi nhóm hoặc ăn sạch.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {categories.map((category) => (
            <Link
              href="/"
              key={category.id}
              className="group border border-orange-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-300 hover:bg-orange-50"
            >
              <span className="flex items-center justify-between gap-3 text-lg font-black text-stone-950">
                {category.name}
                <ArrowRight className="h-4 w-4 text-orange-600 transition group-hover:translate-x-0.5" aria-hidden="true" />
              </span>
              {category.description ? (
                <span className="mt-2 block text-sm leading-6 text-stone-600">{category.description}</span>
              ) : null}
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8" aria-labelledby="decision-title">
        <div className="border border-orange-200 bg-white/84 p-5 shadow-sm sm:p-6">
          <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <p className="text-sm font-black uppercase text-orange-700">Giảm mệt khi chọn món</p>
              <h2 id="decision-title" className="mt-2 text-2xl font-black tracking-tight text-stone-950 sm:text-3xl">
                Không biết ăn gì thì làm theo 3 bước
              </h2>
              <p className="mt-3 text-sm leading-6 text-stone-700">
                Khi đang đói và có quá nhiều lựa chọn, hãy giảm số quyết định phải nghĩ. Chọn mood, random, rồi chỉ cần quyết định có ăn món đó hay bấm lại.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {decisionPlaybooks.map((item, index) => (
                <article key={item.title} className="border border-orange-100 bg-orange-50/70 p-4 transition hover:-translate-y-0.5 hover:bg-white">
                  <span className="inline-flex h-8 w-8 items-center justify-center bg-orange-600 text-xs font-black text-white">{index + 1}</span>
                  <h3 className="mt-2 font-black text-stone-950">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-stone-700">{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8" aria-labelledby="return-title">
        <div className="grid gap-4 md:grid-cols-3">
          {returnReasons.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className="border border-emerald-100 bg-white p-5 shadow-sm">
                <Icon className="h-6 w-6 text-emerald-700" aria-hidden="true" />
                <h2 id={item.title === returnReasons[0].title ? "return-title" : undefined} className="mt-3 text-lg font-black text-stone-950">
                  {item.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-stone-600">{item.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-4">
        <AppCta />
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10" aria-labelledby="faq-title">
        <div className="max-w-2xl">
          <p className="text-sm font-black uppercase text-orange-700">Câu hỏi nhanh</p>
          <h2 id="faq-title" className="mt-2 text-2xl font-black text-stone-950 sm:text-3xl">
            Dùng thế nào cho nhanh?
          </h2>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {faqItems.map((item) => (
            <article key={item.question} className="border border-orange-100 bg-white p-5 shadow-sm">
              <h3 className="font-bold text-stone-950">{item.question}</h3>
              <p className="mt-2 text-sm leading-6 text-stone-700">{item.answer}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
