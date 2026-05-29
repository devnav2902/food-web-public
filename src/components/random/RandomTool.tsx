"use client";

import { getRandomDishes } from "@/api/random";
import { DishImage } from "@/components/dishes/DishImage";
import type { Category, Dish, RandomFilters, Restaurant } from "@/types";
import { formatCurrency } from "@/utils/format";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronRight,
  Copy,
  Dice5,
  LocateFixed,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";

type RandomToolProps = {
  categories: Category[];
  restaurants?: Restaurant[];
  advanced?: boolean;
  title?: string;
};

const spinMessages = [
  "Đang ngửi mùi món ngon...",
  "Đang né món bạn ăn hôm qua...",
  "Đang hỏi bụng đói của bạn...",
  "Đang chốt món đáng tiền...",
];

export function RandomTool({
  categories,
  restaurants = [],
  advanced = false,
  title,
}: RandomToolProps) {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [dish, setDish] = useState<Dish | undefined>();
  const [categoryId, setCategoryId] = useState("");
  const [restaurantId, setRestaurantId] = useState("");
  const [nearMe, setNearMe] = useState(false);
  const [error, setError] = useState("");
  const [spinIndex, setSpinIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  const todayKey = useMemo(
    () =>
      new Intl.DateTimeFormat("vi-VN", {
        weekday: "long",
        day: "2-digit",
        month: "2-digit",
      }).format(new Date()),
    [],
  );

  useEffect(() => {
    if (!isPending) return;
    const interval = window.setInterval(() => {
      setSpinIndex((current) => (current + 1) % spinMessages.length);
    }, 520);

    return () => window.clearInterval(interval);
  }, [isPending]);

  async function randomize(mode: "all" | "filtered" = "filtered") {
    setError("");
    startTransition(async () => {
      try {
        const filters: RandomFilters =
          mode === "all"
            ? {}
            : {
                categoryId: categoryId || undefined,
                nearMe,
              };

        if (nearMe && "geolocation" in navigator) {
          const position = await new Promise<GeolocationPosition>(
            (resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, {
                timeout: 5000,
              });
            },
          );
          filters.latitude = position.coords.latitude;
          filters.longitude = position.coords.longitude;
        }

        const nextDishes = await getRandomDishes(filters);
        setDishes(nextDishes);
        setDish(nextDishes[0]);
      } catch {
        setError("Chưa random được món lúc này. Bạn thử lại một nhịp nhé.");
      }
    });
  }

  async function shareDish() {
    if (!dish) return;
    const url = `${window.location.origin}/mon-an/${dish.slug || dish.id}`;
    const text = `Hôm nay thử ${dish.name} nhé!`;

    if (navigator.share) {
      await navigator.share({ title: dish.name, text, url });
      return;
    }

    await navigator.clipboard.writeText(`${text} ${url}`);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  async function copyDishLink() {
    if (!dish) return;
    const url = `${window.location.origin}/mon-an/${dish.slug || dish.id}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  const priceText = useMemo(() => {
    if (!dish?.priceMin) return "";
    return dish.priceMax
      ? `${formatCurrency(dish.priceMin)} - ${formatCurrency(dish.priceMax)}`
      : `Từ ${formatCurrency(dish.priceMin)}`;
  }, [dish]);

  const activeCategory = categories.find(
    (category) => category.id === categoryId,
  );
  const activeRestaurant = restaurants.find(
    (restaurant) => restaurant.id === restaurantId,
  );

  return (
    <section
      className="relative isolate overflow-hidden border border-orange-200 bg-[#fffdf7] p-3 shadow-[0_30px_90px_rgba(120,53,15,0.16)] sm:p-5 lg:p-6"
      aria-label="Công cụ random món ăn"
    >
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,rgba(255,247,237,0.96),rgba(255,255,255,0.78)_48%,rgba(236,253,245,0.78))]" />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_430px] lg:items-stretch">
        <div className="flex flex-col">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 border border-orange-200 bg-white/85 px-3 py-1.5 text-xs font-black uppercase text-orange-700 shadow-sm">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Món hôm nay
            </span>
            <span className="border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800">
              {todayKey}
            </span>
          </div>

          <h1 className="mt-4 max-w-2xl text-4xl font-black leading-[1.04] text-stone-950 sm:text-5xl lg:text-6xl">
            {title || "Hôm nay ăn gì?"}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-stone-700 sm:text-lg">
            Bấm random để có món ngay.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-bold text-stone-800">
              Danh mục
              <select
                value={categoryId}
                onChange={(event) => setCategoryId(event.target.value)}
                className="mt-2 h-12 w-full border border-orange-100 bg-white px-3 text-stone-950 shadow-sm outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
              >
                <option value="">Tất cả món</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>

            {advanced ? (
              <label className="text-sm font-bold text-stone-800">
                Vị trí
                <div className="mt-2 flex items-center gap-2 ">
                  <input
                    type="checkbox"
                    checked={nearMe}
                    onChange={(event) => setNearMe(event.target.checked)}
                    className="h-4 w-4 accent-orange-700"
                  />
                  Ưu tiên gần tôi
                </div>
              </label>
            ) : null}
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <motion.button
              type="button"
              onClick={() => randomize("filtered")}
              disabled={isPending}
              whileTap={{ scale: 0.98 }}
              whileHover={{ y: -2 }}
              className="inline-flex min-h-14 items-center justify-center gap-2 bg-stone-950 px-8 text-lg font-black text-white shadow-[0_16px_36px_rgba(28,25,23,0.24)] transition hover:bg-orange-700 disabled:cursor-wait disabled:bg-orange-300"
            >
              {isPending ? (
                <RefreshCw
                  className="h-5 w-5 animate-spin"
                  aria-hidden="true"
                />
              ) : (
                <Dice5 className="h-5 w-5" aria-hidden="true" />
              )}
              {isPending ? "Đang chọn món..." : "Random món ngay"}
            </motion.button>
          </div>

          {error ? (
            <p className="mt-4 text-sm font-medium text-red-700">{error}</p>
          ) : null}
        </div>

        <div className="w-full">
          <div className="overflow-hidden border border-stone-200 bg-white shadow-[0_20px_54px_rgba(68,64,60,0.14)]">
            <AnimatePresence mode="wait">
              {isPending && !dish ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="relative flex h-[460px] flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-orange-100 via-white to-emerald-50 p-6 text-center"
                >
                  <div className="absolute inset-0 animate-[shimmer_1.6s_infinite] bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.7),transparent)]" />
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1.1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="relative flex h-28 w-28 items-center justify-center border-8 border-orange-100 bg-white shadow-inner"
                  >
                    <div className="absolute inset-3 border-4 border-transparent border-t-orange-600" />
                    <Dice5
                      className="relative h-9 w-9 text-orange-700"
                      aria-hidden="true"
                    />
                  </motion.div>
                  <p className="relative mt-5 text-lg font-black text-stone-950">
                    {spinMessages[spinIndex]}
                  </p>
                  <p className="relative mt-2 text-sm text-stone-600">
                    Đang chọn một món đủ ngon để bạn không phải nghĩ nữa.
                  </p>
                </motion.div>
              ) : dish ? (
                <motion.article
                  key={dish.id}
                  initial={{ opacity: 0, y: 18, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -12, scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 260, damping: 24 }}
                >
                  <div className="relative">
                    <DishImage
                      src={dish.imageUrl}
                      alt={dish.name}
                      priority
                      className="min-h-64"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-stone-950/88 via-stone-950/42 to-transparent p-4 pt-20 text-white">
                      <p className="inline-flex items-center gap-1.5 bg-orange-500 px-2 py-1 text-xs font-black uppercase text-white">
                        <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                        Nên thử
                      </p>
                      <h2 className="mt-2 text-3xl font-black leading-tight">
                        {dish.name}
                      </h2>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="mt-3 text-sm leading-6 text-stone-700">
                      {dish.description}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-stone-600">
                      {dish.category ? (
                        <span className="bg-orange-50 px-2 py-1 font-semibold text-orange-800">
                          {dish.category.name}
                        </span>
                      ) : null}
                      {dish.restaurant ? (
                        <span className="bg-stone-100 px-2 py-1">
                          {dish.restaurant.name}
                        </span>
                      ) : null}
                      {dish.rating ? (
                        <span className="bg-stone-100 px-2 py-1">
                          {dish.rating.toFixed(1)} sao
                        </span>
                      ) : null}
                      {priceText ? (
                        <span className="bg-emerald-50 px-2 py-1 font-semibold text-emerald-800">
                          {priceText}
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2 text-sm font-semibold sm:grid-cols-4">
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        type="button"
                        onClick={() => randomize("filtered")}
                        className="inline-flex min-h-11 items-center justify-center gap-1.5 bg-orange-600 px-3 text-white hover:bg-orange-700"
                      >
                        <RefreshCw className="h-4 w-4" aria-hidden="true" />
                        Lại
                      </motion.button>
                      <Link
                        href={`/mon-an/${dish.slug || dish.id}`}
                        className="inline-flex min-h-11 items-center justify-center gap-1.5 border border-stone-300 px-3 text-stone-800 hover:bg-stone-50 whitespace-nowrap"
                        target="_blank"
                      >
                        Chi tiết
                        <ChevronRight className="h-4 w-4" aria-hidden="true" />
                      </Link>
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        type="button"
                        onClick={copyDishLink}
                        className="inline-flex min-h-11 items-center justify-center gap-1.5 border border-stone-300 px-3 text-stone-800 hover:bg-stone-50"
                      >
                        <Copy className="h-4 w-4" aria-hidden="true" />
                        {copied ? "Đã copy" : "Copy"}
                      </motion.button>
                    </div>
                  </div>
                </motion.article>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex min-h-[420px] flex-col items-center justify-center bg-[radial-gradient(circle_at_top,#fed7aa,transparent_46%),linear-gradient(135deg,#fff7ed,#ffffff_55%,#ecfdf5)] p-6 text-center"
                >
                  <motion.span
                    animate={{ y: [0, -8, 0] }}
                    transition={{
                      duration: 2.4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="flex h-20 w-20 items-center justify-center bg-stone-950 text-white shadow-[0_16px_36px_rgba(28,25,23,0.2)]"
                    aria-hidden="true"
                  >
                    <Dice5 className="h-9 w-9" />
                  </motion.span>
                  <p className="mt-5 text-xl font-black text-stone-950">
                    Bấm random để có món đầu tiên
                  </p>
                  <p className="mt-2 max-w-xs text-sm leading-6 text-stone-600">
                    Không cần đăng nhập. Có thể random lại ngay nếu món chưa
                    đúng mood.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {dishes.length > 1 ? (
        <div className="mt-6 border-t border-orange-100 pt-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-stone-950">
                Những gợi ý khác
              </h2>
              <p className="mt-1 text-sm text-stone-600">
                Bấm vào món để đưa lên kết quả chính và chia sẻ nhanh.
              </p>
            </div>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
            {dishes.map((item, index) => (
              <button
                type="button"
                key={`${item.id}-${index}`}
                onClick={() => {
                  setDish(item);
                }}
                className={`min-h-24 border p-3 text-left text-sm transition hover:-translate-y-0.5 hover:bg-orange-50 ${
                  dish?.id === item.id
                    ? "border-orange-400 bg-orange-50 shadow-sm"
                    : "border-stone-200 bg-white"
                }`}
              >
                <span className="block font-bold text-stone-950">
                  {item.name}
                </span>
                {item.restaurant ? (
                  <span className="mt-1 block text-xs leading-5 text-stone-600">
                    {item.restaurant.name}
                  </span>
                ) : null}
                {item.rating ? (
                  <span className="mt-2 inline-block bg-white px-2 py-1 text-xs font-semibold text-orange-700">
                    {item.rating.toFixed(1)} sao
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="fixed inset-x-3 bottom-3 z-40 sm:hidden">
        <button
          type="button"
          onClick={() => randomize("filtered")}
          disabled={isPending}
          className="inline-flex min-h-14 w-full items-center justify-center gap-2 bg-stone-950 px-5 text-base font-black text-white shadow-[0_16px_40px_rgba(28,25,23,0.35)] disabled:cursor-wait disabled:bg-orange-300"
        >
          {isPending ? (
            <RefreshCw className="h-5 w-5 animate-spin" aria-hidden="true" />
          ) : (
            <Dice5 className="h-5 w-5" aria-hidden="true" />
          )}
          {isPending
            ? spinMessages[spinIndex]
            : dish
              ? "Random món khác"
              : "Random món ngay"}
        </button>
      </div>
    </section>
  );
}
