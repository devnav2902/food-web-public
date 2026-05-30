import type { Metadata } from "next";
import { Flame } from "lucide-react";
import { AdSlot } from "@/components/ads/AdSlot";
import { DishCard } from "@/components/dishes/DishCard";
import { AppCta } from "@/components/layout/AppCta";
import { RandomTool } from "@/components/random/RandomTool";
import { JsonLd } from "@/components/seo/JsonLd";
import { getCategories } from "@/api/categories";
import { getTopDishes } from "@/api/dishes";
import { absoluteUrl, baseMetadata } from "@/lib/site";

export const revalidate = 300;

export const metadata: Metadata = baseMetadata({
  title: "Random món ăn hôm nay - Hôm Nay Ăn Gì?",
  description:
    "Không biết hôm nay ăn gì? Bật vị trí rồi random ngay 7 món ăn gần bạn để chốt quán nhanh hơn.",
  path: "/",
});

export default async function HomePage() {
  const [categories, featuredDishes] = await Promise.all([
    getCategories(),
    getTopDishes(5),
  ]);

  const faqItems = [
    {
      question: "Random món ăn hoạt động thế nào?",
      answer:
        "Website lấy vị trí hiện tại của bạn, tìm các món trong bán kính đã chọn rồi random ra 7 gợi ý để chốt nhanh.",
    },
    {
      question: "Cần bật vị trí không?",
      answer:
        "Có. Endpoint random hiện dùng latitude và longitude để trả về món gần bạn, nên cần cấp quyền vị trí trên trình duyệt.",
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
      description:
        "Ưu tiên cơm, phở, bún bò hoặc món có đạm. Chọn mood Ăn no rồi random.",
    },
    {
      title: "Chưa biết thèm gì",
      description:
        "Đừng lọc quá nhiều. Random tất cả trước, sau đó bấm lại nếu món chưa đúng cảm giác.",
    },
    {
      title: "Đi cùng nhóm",
      description:
        "Chọn lẩu nướng hoặc món dễ chia. Gửi kết quả random cho nhóm để chốt nhanh.",
    },
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
          title="Hôm nay ăn gì?"
        />
      </section>

      <div className="mx-auto max-w-6xl px-4">
        <AdSlot id="home-after-random" format="horizontal" />
      </div>

      <section
        className="mx-auto max-w-6xl px-4 py-10"
        aria-labelledby="featured-title"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-black uppercase text-orange-700">
              <Flame className="h-4 w-4" aria-hidden="true" />
              Gợi ý nhanh
            </p>
            <h2
              id="featured-title"
              className="mt-2 text-2xl font-black tracking-tight text-stone-950 sm:text-3xl"
            >
              Món nổi bật để chọn ngay
            </h2>
          </div>
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

      <section
        className="mx-auto max-w-6xl px-4 py-8"
        aria-labelledby="decision-title"
      >
        <div className="border border-orange-200 bg-white/84 p-5 shadow-sm sm:p-6">
          <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <p className="text-sm font-black uppercase text-orange-700">
                Giảm mệt khi chọn món
              </p>
              <h2
                id="decision-title"
                className="mt-2 text-2xl font-black tracking-tight text-stone-950 sm:text-3xl"
              >
                Không biết ăn gì thì làm theo 3 bước
              </h2>
              <p className="mt-3 text-sm leading-6 text-stone-700">
                Khi đang đói và có quá nhiều lựa chọn, hãy giảm số quyết định
                phải nghĩ. Chọn mood, random, rồi chỉ cần quyết định có ăn món
                đó hay bấm lại.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {decisionPlaybooks.map((item, index) => (
                <article
                  key={item.title}
                  className="border border-orange-100 bg-orange-50/70 p-4 transition hover:-translate-y-0.5 hover:bg-white"
                >
                  <span className="inline-flex h-8 w-8 items-center justify-center bg-orange-600 text-xs font-black text-white">
                    {index + 1}
                  </span>
                  <h3 className="mt-2 font-black text-stone-950">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-stone-700">
                    {item.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-4">
        <AppCta />
      </section>

      <section
        className="mx-auto max-w-6xl px-4 py-10"
        aria-labelledby="faq-title"
      >
        <div className="max-w-2xl">
          <p className="text-sm font-black uppercase text-orange-700">
            Câu hỏi nhanh
          </p>
          <h2
            id="faq-title"
            className="mt-2 text-2xl font-black text-stone-950 sm:text-3xl"
          >
            Dùng thế nào cho nhanh?
          </h2>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {faqItems.map((item) => (
            <article
              key={item.question}
              className="border border-orange-100 bg-white p-5 shadow-sm"
            >
              <h3 className="font-bold text-stone-950">{item.question}</h3>
              <p className="mt-2 text-sm leading-6 text-stone-700">
                {item.answer}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
