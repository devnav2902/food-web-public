import type { Metadata } from "next";

const defaultSiteUrl = "https://hom-nay-an-gi.vn";

export const siteConfig = {
  name: "Hôm Nay Ăn Gì?",
  description:
    "Công cụ random món ăn giúp bạn quyết định hôm nay ăn gì nhanh hơn, vui hơn và dễ quay lại mỗi ngày.",
  url: process.env.NEXT_PUBLIC_SITE_URL || defaultSiteUrl,
  appCtaPath: "W:\\sources\\flutter\\food_app",
};

export function absoluteUrl(path = "/") {
  const base = siteConfig.url.replace(/\/$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${cleanPath}`;
}

export function baseMetadata({
  title,
  description,
  path,
  image,
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
}): Metadata {
  const url = absoluteUrl(path);
  const images = image ? [{ url: image }] : [{ url: absoluteUrl("/og-default.jpg") }];

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: siteConfig.name,
      type: "website",
      locale: "vi_VN",
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: images.map((item) => item.url),
    },
  };
}
