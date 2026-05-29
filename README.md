# Hôm Nay Ăn Gì?

Public SEO web tool built with Next.js App Router, TypeScript and Tailwind CSS.

## Install

```bash
pnpm install
```

## Run Dev

```bash
pnpm dev
```

## Build

```bash
pnpm build
```

## API Config

Copy `.env.example` to `.env.local`.

```bash
API_BASE_URL=http://localhost:3000
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3001
```

`API_BASE_URL` is used by server-side fetches. `NEXT_PUBLIC_API_BASE_URL` is used by client random interactions when needed. Random results come from the NestJS API; if `/random/dishes` fails or returns no dishes, the UI shows an error instead of mock data.

## SEO Notes

- App Router pages use Metadata API with canonical URLs, Open Graph and Twitter card data.
- `src/app/sitemap.ts` and `src/app/robots.ts` generate `/sitemap.xml` and `/robots.txt`.
- Dish detail pages render JSON-LD product-like structured data.
- Home, random tool, dish detail and blog pages use semantic `main`, `section`, `article`, `h1`, `h2`.

## Ads Slot Notes

Ad placeholders live in `src/components/ads/AdSlot.tsx`.

Supported formats:

- `horizontal`
- `rectangle`
- `sidebar`
- `in-content`

Each slot reserves height to avoid layout shift and can be replaced with Google AdSense code later. No popup, overlay or random-button blocking ads are used.
