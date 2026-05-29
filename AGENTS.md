<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Product Memory

- This project is the public SEO web tool "Hôm Nay Ăn Gì?".
- It must prioritize the random food tool as the first-screen experience, not a hollow landing page.
- Use Next.js App Router, TypeScript, Tailwind CSS, Server Components for SEO pages, and Client Components for random interactions.
- Backend is the NestJS REST API at `W:\sources\nestjs\food_app_be`; configure it through `API_BASE_URL` and `NEXT_PUBLIC_API_BASE_URL`.
- Mobile app CTA points to `W:\sources\flutter\food_app`; do not use Flutter Web.
- Keep ads as reserved non-overlay slots through `src/components/ads/AdSlot.tsx`.
- Maintain SEO basics: Metadata API, canonical URLs, sitemap, robots, semantic HTML, JSON-LD where useful, internal links, and Vietnamese no-accent URLs.
- UI should feel warm, modern, food-oriented, mobile-first, and never like an admin panel. Card radius should stay at 8px or less.
