# 03: Public Technical Notes Index and Tag Filtering at `/blog`

**What to build:**
Create the public technical blog index route (`GET /blog`) powered by Hono Edge SSR querying Cloudflare D1. The route queries all published posts (`is_published = true`) ordered by publication date, rendering a fast, responsive list of articles with publication dates, reading time estimates, summaries, and category badges. Enable instant category tag filtering so visitors can browse articles matching specific technologies. Deliver dedicated SEO metadata for the blog index page, including title, meta description, canonical link, and OpenGraph preview tags.

**Blocked by:** 02-cloudflare-d1-binding-and-schema

**Status:** ready-for-agent

- [ ] Hono route `GET /blog` queries published articles directly from D1 edge database.
- [ ] Blog index is rendered server-side via Hono JSX with semantic `<article>`, `<time>`, and heading tags.
- [ ] Tag filtering mechanism allows filtering articles by tag parameter (e.g. `/blog?tag=React`).
- [ ] Dedicated SEO meta tags (`og:title`, `og:description`, canonical URL) and JSON-LD `CollectionPage` schema are injected in the HTML `<head>`.
- [ ] Visual styling seamlessly matches the dark/light design tokens established in Ticket 01.
- [ ] Unauthenticated requests to `/blog` never expose draft (`is_published = false`) articles.
