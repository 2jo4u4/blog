# 01: Complete Next.js Deprecation and Edge-Native Hono SSR Landing Page with Full SEO

**What to build:**
Completely excise all Next.js dependencies and configurations from the repository. Initialize a lightweight, edge-native Cloudflare Worker runtime powered by Hono with JSX/TSX templating. Migrate all existing portfolio components (Hero, Metrics, Projects, Skills, Experience, Contact, theme switcher, and language toggles) to server-rendered Hono JSX components that stream full semantic HTML directly on `/`. Compile Tailwind CSS v4 ahead of time and serve it alongside static project images via Cloudflare Workers Static Assets. The resulting page must render complete `<title>`, OpenGraph tags, semantic headers, and JSON-LD schema on `/` with zero hydration latency and zero Next.js runtime overhead.

**Blocked by:** None (can start immediately)

**Status:** closed

- [x] All Next.js dependencies (`next`, `eslint-config-next`, `@tailwindcss/turbopack`), build outputs (`.next`, `out`), and config files (`next.config.ts`, `next-env.d.ts`) are completely removed from `package.json` and disk.
- [x] Project dependencies are cleanly re-installed with Hono, Tailwind CSS v4, and Wrangler for Cloudflare Workers.
- [x] `wrangler.jsonc` is configured as a Cloudflare Worker with static assets binding pointing to compiled CSS and public assets.
- [x] Home route (`/`) is rendered server-side at the edge using Hono JSX/TSX with pristine semantic HTML and zero client framework bundle.
- [x] Full SEO metadata is pre-rendered in `<head>`, including canonical URL, OpenGraph tags (`og:title`, `og:image`, `og:description`), Twitter Card tags, and `Person`/`WebSite` JSON-LD structured data.
- [x] Core visual design, Bento Grid project showcases, responsive drawer navigation, dark/light theme switching, and i18n language switching behave identically or better than the previous version.
- [x] Requesting `GET /` against the local edge runner yields HTTP 200 with complete raw HTML containing all portfolio keywords without client-side execution.
