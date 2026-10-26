# Jay Huang - Portfolio & Technical Blog

Edge-native personal portfolio and technical blog powered by **Cloudflare Workers**, **Hono (with Hono JSX/TSX Edge SSR)**, **Cloudflare D1 (edge SQLite)**, and **Tailwind CSS v4**.

## Architecture & Features
- **Edge SSR (Server-Side Rendering)**: High performance edge HTML streaming with zero hydration latency.
- **100/100 SEO Ready**: Fully pre-rendered `<title>`, OpenGraph meta tags, Twitter Cards, and `Person`/`WebSite` JSON-LD structured data.
- **Tailwind CSS v4 Ahead-of-Time Build**: Ultra-lightweight compiled CSS served directly via Cloudflare Workers Static Assets.
- **Zero Heavy Runtime Overheads**: Completely excised Next.js/React client bundles.
- **Cloudflare D1 (Edge Database)**: Ultra low latency SQLite database distributed across Cloudflare edge data centers.

## Development

```bash
# Install dependencies
npm install

# Compile Tailwind CSS
npm run build:css

# Run local development with Wrangler
npm run dev

# Run Vitest test suite
npm run test

# Production build & dry-run
npm run build

# Deploy to Cloudflare Workers
npm run deploy
```
