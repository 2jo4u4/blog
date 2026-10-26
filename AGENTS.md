# Project Conventions & Guidelines: Edge-Native Hono + Cloudflare D1

This project is an edge-native portfolio and technical blog built with **Cloudflare Workers**, **Hono (with Hono JSX/TSX Edge SSR)**, **Cloudflare D1 (edge SQLite)**, and **Tailwind CSS v4**.

## Key Guidelines
- **Zero Next.js / Zero Node.js Heavy Runtime**: Do not add Next.js or heavy server frameworks. All routes are handled by Hono workers.
- **Edge SSR for SEO**: Landing page (`/`) and Blog pages (`/blog`, `/blog/:slug`) are rendered directly to HTML on the edge with complete SEO metadata (`<title>`, OpenGraph, Twitter Cards, JSON-LD Schema).
- **Styling**: Tailwind CSS v4 compiled via `@tailwindcss/cli -i ./src/styles/globals.css -o ./public/styles.css --minify`.
- **Static Assets**: Stored in `./public` and served by Cloudflare Workers Static Assets.
- **Data Persistence**: Articles and tags stored in Cloudflare D1.
