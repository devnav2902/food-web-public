"use client";

import { getRandomDishes } from "@/api/random";
import { DishImage } from "@/components/dishes/DishImage";
import type { Category, Dish } from "@/types";
import { formatCurrency } from "@/utils/format";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronRight,
  Copy,
  Dice5,
  ExternalLink,
  LocateFixed,
  MapPin,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";

type RandomToolProps = {
  categories: Category[];
  title?: string;
};

type Coordinates = {
  latitude: number;
  longitude: number;
};

const spinMessages = [
  "Đang dò món ngon quanh bạn...",
  "Đang xem quán nào đang hợp bụng...",
  "Đang chọn món đủ gần để đi ăn ngay...",
  "Đang lắc ra một lựa chọn đỡ phải nghĩ...",
];

const radiusOptions = [
  { label: "2 km", value: 2 },
  { label: "5 km", value: 5 },
  { label: "10 km", value: 10 },
  { label: "15 km", value: 15 },
];
const RANDOM_RESULT_DELAY_MS = 3000;
const LOCATION_STORAGE_KEY = "random-tool-location";

function getGeolocationErrorCode(error: unknown) {
  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    typeof error.code === "number"
  ) {
    return error.code;
  }

  return null;
}

function formatDistance(distanceKm?: number) {
  if (distanceKm === undefined) return "";
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }

  return `${distanceKm.toFixed(distanceKm >= 10 ? 0 : 1)} km`;
}

function getGoogleMapsUrl(coordinates: Coordinates) {
  return `https://www.google.com/maps/search/?api=1&query=${coordinates.latitude},${coordinates.longitude}`;
}

function hasCoordinatesChanged(
  current: Coordinates | null,
  next: Coordinates,
) {
  if (!current) {
    return true;
  }

  return (
    current.latitude !== next.latitude || current.longitude !== next.longitude
  );
}

function getRandomRequestKey(
  coordinates: Coordinates,
  radiusKm: string,
  categoryId: string,
) {
  return [
    coordinates.latitude,
    coordinates.longitude,
    radiusKm,
    categoryId || "all",
  ].join(":");
}

function readStoredCoordinates() {
  if (typeof window === "undefined") {
    return null;
  }

  const savedLocation = window.localStorage.getItem(LOCATION_STORAGE_KEY);
  if (!savedLocation) {
    return null;
  }

  try {
    const parsed = JSON.parse(savedLocation) as Partial<Coordinates> | null;
    if (
      parsed &&
      typeof parsed.latitude === "number" &&
      typeof parsed.longitude === "number"
    ) {
      return {
        latitude: parsed.latitude,
        longitude: parsed.longitude,
      };
    }
  } catch {
    window.localStorage.removeItem(LOCATION_STORAGE_KEY);
  }

  return null;
}

export function RandomTool({ categories, title }: RandomToolProps) {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [dish, setDish] = useState<Dish | undefined>();
  const [categoryId, setCategoryId] = useState("");
  const [radiusKm, setRadiusKm] = useState("5");
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [locationLabel, setLocationLabel] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [spinIndex, setSpinIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isPending, startTransition] = useTransition();
  const coordinatesRef = useRef<Coordinates | null>(null);
  const activeRandomRequestKeyRef = useRef<string | null>(null);

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
    const initialCoordinates = readStoredCoordinates();

    if (initialCoordinates) {
      coordinatesRef.current = initialCoordinates;
      setCoordinates(initialCoordinates);
      setLocationLabel("Đã lưu vị trí trên thiết bị");
      setStatus(
        "Đang dùng vị trí đã lưu. Bạn có thể bấm cập nhật nếu đã di chuyển.",
      );
    } else {
      setLocationLabel("Chưa lý vị trí hiện tại");
      setStatus("");
    }
  }, []);

  useEffect(() => {
    if (!isPending) return;
    const interval = window.setInterval(() => {
      setSpinIndex((current) => (current + 1) % spinMessages.length);
    }, 520);

    return () => window.clearInterval(interval);
  }, [isPending]);

  async function ensureCoordinates(forceRefresh = false) {
    if (coordinates && !forceRefresh) return coordinates;

    if (!("geolocation" in navigator)) {
      throw new Error("Trình duyệt này chưa hỗ trợ định vị.");
    }

    const position = await new Promise<GeolocationPosition>(
      (resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 120000,
        });
      },
    );

    const nextCoordinates = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };

    coordinatesRef.current = nextCoordinates;
    setCoordinates(nextCoordinates);
    setLocationLabel("Đã lấy vị trí hiện tại của bạn");

    window.localStorage.setItem(
      LOCATION_STORAGE_KEY,
      JSON.stringify(nextCoordinates),
    );

    return nextCoordinates;
  }

  function setLocationError(message: string) {
    coordinatesRef.current = null;
    activeRandomRequestKeyRef.current = null;
    setCoordinates(null);
    setLocationLabel("Chưa lấy vị trí hiện tại");
    setError(message);
    setStatus("");
    window.localStorage.removeItem(LOCATION_STORAGE_KEY);
  }

  async function requestLocation() {
    setError("");
    setStatus("");
    setIsLocating(true);

    try {
      const previousCoordinates = coordinates;
      const nextCoordinates = await ensureCoordinates(true);

      if (hasCoordinatesChanged(previousCoordinates, nextCoordinates)) {
        activeRandomRequestKeyRef.current = null;
        setDishes([]);
        setDish(undefined);
      }
      setStatus(
        "Đã lấy vị trí thành công. Giờ bạn có thể random món gần mình.",
      );
    } catch (caughtError) {
      const errorCode = getGeolocationErrorCode(caughtError);

      if (errorCode === 1) {
        setLocationError("Bạn cần bật quyền vị trí để random món gần mình.");
        return;
      }

      if (errorCode === 3) {
        setLocationError(
          "Lấy vị trí quá lâu. Bạn thử lại ở nơi có GPS hoặc mạng ổn định hơn.",
        );
        return;
      }

      setLocationError("Chưa lấy được vị trí hiện tại.");
    } finally {
      setIsLocating(false);
    }
  }

  async function randomize() {
    if (isPending) return;

    setError("");

    if (!coordinates) {
      setError("Bạn cần bấm lấy vị trí trước khi random món gần bạn.");
      return;
    }

    const requestCoordinates = coordinates;
    const requestRadiusKm = radiusKm;
    const requestCategoryId = categoryId;
    const requestKey = getRandomRequestKey(
      requestCoordinates,
      requestRadiusKm,
      requestCategoryId,
    );

    activeRandomRequestKeyRef.current = requestKey;

    startTransition(async () => {
      try {
        const [dishes] = await Promise.all([
          getRandomDishes({
            latitude: requestCoordinates.latitude,
            longitude: requestCoordinates.longitude,
            radiusKm: Number(requestRadiusKm),
            limit: 7,
            categoryId: requestCategoryId || undefined,
          }),
          new Promise((resolve) =>
            window.setTimeout(resolve, RANDOM_RESULT_DELAY_MS),
          ),
        ]);

        const latestCoordinates = coordinatesRef.current;
        const latestRequestKey = latestCoordinates
          ? getRandomRequestKey(
              latestCoordinates,
              requestRadiusKm,
              requestCategoryId,
            )
          : null;

        if (
          activeRandomRequestKeyRef.current !== requestKey ||
          latestRequestKey !== requestKey
        ) {
          return;
        }

        setDishes(dishes);
        setDish(dishes[0]);

        if (dishes.length === 0) {
          if (requestCategoryId) {
            const activeCategory = categories.find(
              (item) => item.id === requestCategoryId,
            );
            setError(
              `Chưa có món ${activeCategory?.name?.toLowerCase() || "đúng danh mục"} trong bán kính ${requestRadiusKm} km quanh bạn.`,
            );

            return;
          }

          setError(
            `Không tìm thấy món nào trong bán kính ${requestRadiusKm} km quanh bạn.`,
          );
        }
      } catch (caughtError) {
        const errorCode = getGeolocationErrorCode(caughtError);

        if (errorCode === 1) {
          setLocationError("Bạn cần bật quyền vị trí để random món gần mình.");
          return;
        }

        setError("Chưa random được món lúc này. Bạn thử lại một nhịp nữa.");
      }
    });
  }

  async function copyDishLink() {
    if (!dish) {
      return;
    }

    const url = `${window.location.origin}/mon-an/${dish.slug}`;

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

  const distanceText = useMemo(
    () => formatDistance(dish?.distanceKm),
    [dish?.distanceKm],
  );

  const dishMapUrl =
    dish?.restaurant?.latitude !== undefined &&
    dish?.restaurant?.longitude !== undefined
      ? getGoogleMapsUrl({
          latitude: dish.restaurant.latitude,
          longitude: dish.restaurant.longitude,
        })
      : "";

  const isRandomDisabled = isPending;

  return (
    <section
      className="relative isolate overflow-hidden border border-orange-200 bg-[#fffdf7] p-3 shadow-[0_30px_90px_rgba(120,53,15,0.16)] sm:p-5 lg:p-6"
      aria-label="Công cụ random món ăn"
    >
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,rgba(255,247,237,0.96),rgba(255,255,255,0.82)_50%,rgba(236,253,245,0.82))]" />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_430px] lg:items-stretch">
        <div className="flex flex-col">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 border border-orange-200 bg-white/90 px-3 py-1.5 text-xs font-black uppercase text-orange-700 shadow-sm">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Random món gần bạn
            </span>
            <span className="border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800">
              {todayKey}
            </span>
          </div>

          <h1 className="mt-4 max-w-2xl text-4xl font-black leading-[1.04] text-stone-950 sm:text-5xl lg:text-6xl">
            {title || "Hôm nay ăn gì?"}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-stone-700 sm:text-lg">
            Lấy vị trí hiện tại, chọn bán kính rồi bấm random để ra món và quán
            đủ gần để đi ăn ngay.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_180px]">
            <div className="rounded-lg border border-orange-100 bg-white/90 p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-black text-stone-950">
                    Vị trí hiện tại
                  </p>
                  <p className="mt-1 text-sm leading-6 text-stone-600">
                    {locationLabel}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={requestLocation}
                  disabled={isLocating}
                  className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-4 text-sm font-bold text-orange-800 transition hover:bg-orange-100 disabled:cursor-wait disabled:opacity-70"
                >
                  {isLocating ? (
                    <RefreshCw
                      className="h-4 w-4 animate-spin"
                      aria-hidden="true"
                    />
                  ) : (
                    <LocateFixed className="h-4 w-4" aria-hidden="true" />
                  )}
                  {isLocating
                    ? "Đang lấy..."
                    : coordinates
                      ? "Cập nhật"
                      : "Lấy vị trí"}
                </button>
              </div>
            </div>

            <label className="rounded-lg border border-orange-100 bg-white/90 p-4 text-sm font-bold text-stone-800 shadow-sm">
              Bán kính tìm món
              <select
                value={radiusKm}
                onChange={(event) => setRadiusKm(event.target.value)}
                className="mt-2 h-11 w-full rounded-lg border border-orange-100 bg-white px-3 text-stone-950 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
              >
                {radiusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="mt-3 rounded-lg border border-orange-100 bg-white/90 p-4 text-sm font-bold text-stone-800 shadow-sm">
            Danh mục
            <select
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              className="mt-2 h-11 w-full rounded-lg border border-orange-100 bg-white px-3 text-stone-950 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
            >
              <option value="">Tất cả món</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <motion.button
              type="button"
              onClick={randomize}
              disabled={isRandomDisabled}
              whileTap={{ scale: 0.98 }}
              whileHover={{ y: -2 }}
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-lg bg-stone-950 px-8 text-lg font-black text-white shadow-[0_16px_36px_rgba(28,25,23,0.24)] transition hover:bg-orange-700 disabled:cursor-wait disabled:bg-orange-300"
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

          {status ? (
            <p className="mt-4 text-sm font-medium text-emerald-700">
              {status}
            </p>
          ) : null}
          {error ? (
            <p className="mt-2 text-sm font-medium text-red-700">{error}</p>
          ) : null}
        </div>

        <div className="w-full">
          <div className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-[0_20px_54px_rgba(68,64,60,0.14)]">
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
                    className="relative flex h-28 w-28 items-center justify-center rounded-full border-8 border-orange-100 bg-white shadow-inner"
                  >
                    <div className="absolute inset-3 rounded-full border-4 border-transparent border-t-orange-600" />
                    <Dice5
                      className="relative h-9 w-9 text-orange-700"
                      aria-hidden="true"
                    />
                  </motion.div>
                  <p className="relative mt-5 text-lg font-black text-stone-950">
                    {spinMessages[spinIndex]}
                  </p>
                  <p className="relative mt-2 text-sm text-stone-600">
                    Đang ưu tiên món đủ gần để bạn chốt nhanh.
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
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-stone-950/90 via-stone-950/46 to-transparent p-4 pt-20 text-white">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="inline-flex items-center gap-1.5 rounded-md bg-orange-500 px-2 py-1 text-xs font-black uppercase text-white">
                          <Sparkles
                            className="h-3.5 w-3.5"
                            aria-hidden="true"
                          />
                          Nên thử
                        </p>
                        {distanceText ? (
                          <span className="rounded-md bg-white/18 px-2 py-1 text-xs font-bold text-white">
                            Cách bạn {distanceText}
                          </span>
                        ) : null}
                      </div>
                      <h2 className="mt-2 text-3xl font-black leading-tight">
                        {dish.name}
                      </h2>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="mt-4 grid gap-3 rounded-lg border border-orange-100 bg-orange-50/55 p-4 text-sm text-stone-700">
                      {dish.restaurant ? (
                        <div className="flex items-start gap-2">
                          <MapPin
                            className="mt-0.5 h-4 w-4 shrink-0 text-orange-700"
                            aria-hidden="true"
                          />
                          <div>
                            <p className="font-bold text-stone-950">
                              {dish.restaurant.name}
                            </p>
                            {dish.restaurant.address ? (
                              <p className="mt-1 leading-6 text-stone-600">
                                {dish.restaurant.address}
                              </p>
                            ) : null}
                          </div>
                        </div>
                      ) : null}

                      <div className="flex flex-wrap gap-2 text-xs text-stone-600">
                        {dish.suggestedByName ? (
                          <span className="rounded-md bg-white px-2 py-1 font-semibold text-stone-700">
                            Gợi ý bởi {dish.suggestedByName}
                          </span>
                        ) : null}
                        {dish.rating ? (
                          <span className="rounded-md bg-white px-2 py-1 font-semibold text-orange-700">
                            {dish.rating.toFixed(1)} sao
                            {dish.ratingCount
                              ? ` · ${dish.ratingCount} đánh giá`
                              : ""}
                          </span>
                        ) : null}
                        {priceText ? (
                          <span className="rounded-md bg-emerald-50 px-2 py-1 font-semibold text-emerald-800">
                            {priceText}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2 text-sm font-semibold">
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        type="button"
                        onClick={randomize}
                        disabled={isRandomDisabled}
                        className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg bg-orange-600 px-3 text-white hover:bg-orange-700"
                      >
                        <RefreshCw className="h-4 w-4" aria-hidden="true" />
                        Lại
                      </motion.button>
                      <Link
                        href={`/mon-an/${dish.slug || dish.id}`}
                        className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg border border-stone-300 px-3 text-stone-800 hover:bg-stone-50"
                        target="_blank"
                      >
                        Chi tiết
                        <ChevronRight className="h-4 w-4" aria-hidden="true" />
                      </Link>
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        type="button"
                        onClick={copyDishLink}
                        className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg border border-stone-300 px-3 text-stone-800 hover:bg-stone-50"
                      >
                        <Copy className="h-4 w-4" aria-hidden="true" />
                        {copied ? "Đã copy" : "Copy"}
                      </motion.button>
                      {dishMapUrl ? (
                        <a
                          href={dishMapUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg border border-stone-300 px-3 text-stone-800 hover:bg-stone-50"
                        >
                          <ExternalLink
                            className="h-4 w-4"
                            aria-hidden="true"
                          />
                          Google Maps
                        </a>
                      ) : null}
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
                    className="flex h-20 w-20 items-center justify-center rounded-full bg-stone-950 text-white shadow-[0_16px_36px_rgba(28,25,23,0.2)]"
                    aria-hidden="true"
                  >
                    <Dice5 className="h-9 w-9" />
                  </motion.span>
                  <p className="mt-5 text-xl font-black text-stone-950">
                    Bật vị trí rồi random để có món đầu tiên
                  </p>
                  <p className="mt-2 max-w-xs text-sm leading-6 text-stone-600">
                    Hệ thống sẽ lấy món ngẫu nhiên từ các quán đang ở gần bạn.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {dishes.length > 1 ? (
        <div className="mt-6 border-t border-orange-100 pt-5">
          <div>
            <h2 className="text-lg font-bold text-stone-950">
              Những món khác gần bạn
            </h2>
            <p className="mt-1 text-sm text-stone-600">
              Chạm vào món để đổi kết quả chính mà không cần random lại.
            </p>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {dishes.map((item, index) => (
              <button
                type="button"
                key={`${item.id}-${index}`}
                onClick={() => setDish(item)}
                className={`overflow-hidden rounded-lg border text-left transition hover:-translate-y-0.5 hover:bg-orange-50 ${
                  dish?.id === item.id
                    ? "border-orange-400 bg-orange-50 shadow-sm"
                    : "border-stone-200 bg-white"
                }`}
              >
                <DishImage
                  src={item.imageUrl}
                  alt={item.name}
                  className="aspect-[16/10]"
                />
                <div className="p-3">
                  <span className="block font-bold text-stone-950">
                    {item.name}
                  </span>
                  {item.restaurant ? (
                    <span className="mt-1 block text-xs leading-5 text-stone-600">
                      {item.restaurant.name}
                    </span>
                  ) : null}
                  {item.distanceKm !== undefined ? (
                    <span className="mt-2 inline-block rounded-md bg-white px-2 py-1 text-xs font-semibold text-orange-700">
                      {formatDistance(item.distanceKm)}
                    </span>
                  ) : null}
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="fixed inset-x-3 bottom-3 z-40 sm:hidden">
        <button
          type="button"
          onClick={randomize}
          disabled={isRandomDisabled}
          className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-lg bg-stone-950 px-5 text-base font-black text-white shadow-[0_16px_40px_rgba(28,25,23,0.35)] disabled:cursor-wait disabled:bg-orange-300"
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
              : "Random món gần bạn"}
        </button>
      </div>
    </section>
  );
}
