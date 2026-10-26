# Specification: Edge-Native Hono + Cloudflare D1 Portfolio & Technical Blog

## Problem Statement

The author currently maintains a personal portfolio site built with Next.js static export (`output: 'export'`) deployed on Cloudflare Workers/Pages. While the site performs well for static presentation, extending it into a personal technical blog presents critical architectural limitations:
1. Every new Markdown article published requires a complete CI/CD rebuild and redeployment of the frontend bundle, delaying publishing feedback loops.
2. Relying on client-side SPA rendering for dynamic articles harms Search Engine Optimization (SEO), OpenGraph social preview crawlers, and initial paint performance.
3. Heavyweight SSR frameworks (such as full-stack Next.js with OpenNext) on Cloudflare Workers introduce cold-start latency, bulky bundle sizes, compatibility hazards with V8 worker isolates, and unnecessary framework overhead.

The author desires to abandon Next.js in favor of an ultra-lightweight, edge-native architecture that provides immediate dynamic article publishing without frontend rebuilds, zero-maintenance global hosting on Cloudflare, and pristine 100/100 SEO optimization across both the portfolio landing page and blog articles.

---

## Solution

Migrate the entire application to an edge-native full-stack architecture powered by **Hono** running directly on Cloudflare Workers, paired with **Cloudflare D1** (distributed edge SQLite) and **Tailwind CSS v4**:
- **Full Server-Side Rendering (SSR) at the Edge**: Both the portfolio landing page (`/`) and blog pages (`/blog`, `/blog/:slug`) are rendered directly into pure, semantic HTML by Hono at the edge within tens of milliseconds, complete with dynamic OpenGraph meta tags and JSON-LD structured data for perfect SEO.
- **Instant Article Publishing via Cloudflare D1**: Technical notes written in Markdown are stored in Cloudflare D1. An authenticated web-based admin portal (`/admin`) allows the author to create, edit, and publish posts instantly. Changes take effect on the edge immediately without triggering any Git commit or CI/CD rebuild.
- **Zero-Hydration Lean Performance**: The client bundle contains zero heavy framework runtimes. Client scripts are strictly limited to tiny progressive enhancements (theme toggle, smooth anchor navigation, and copy code snippets), yielding sub-30ms TTFB and perfect Lighthouse scores.

---

## User Stories

### Public Visitors & Recruiters
1. As a technical recruiter or hiring manager, I want to load the portfolio homepage instantly with zero layout shift or white screen, so that I can quickly assess the candidate's core background, achievements, and engineering impact.
2. As a recruiter, I want the homepage to render complete semantic HTML directly from the server, so that search engines accurately index the author's key technical proficiencies and career timeline.
3. As a visitor browsing on a mobile device, I want the portfolio layout, typography, project showcases, and career progression to gracefully adapt without horizontal overflow, so that I can comfortably review the author on my phone.
4. As a visitor, I want to toggle between dark mode and light mode, so that I can read the site comfortably in my current lighting environment, with my preference persisted across reloads.
5. As a visitor, I want to switch between Traditional Chinese and English, so that I can view the candidate's profile and projects in my preferred language.
6. As a tech lead evaluating candidate projects, I want to view detailed case studies for featured projects (e.g. Asymmetrical Multiplayer Battle, Collaborative Whiteboard, Infra Tuning) along with live links and screenshots, so that I can evaluate architecture depth and code craft.
7. As a visitor, I want smooth anchor scrolling when clicking header navigation links, so that I have a seamless, tactile browsing experience.
8. As a reader visiting from Twitter, LinkedIn, or Discord, I want rich social preview cards (with title, description, and preview image) to render properly when a link to the homepage or an article is shared.

### Technical Blog Readers & Developers
9. As a software engineer searching Google for technical solutions, I want individual blog posts (`/blog/:slug`) to load pre-rendered HTML with full text and code blocks, so that search engines rank the posts high and I get the content immediately.
10. As a technical reader, I want code snippets in articles to be properly syntax-highlighted with clear language badges and a one-click copy button, so that I can easily understand and use code examples.
11. As a blog reader, I want to browse an index of all published technical notes with publication dates, reading time estimates, summaries, and category tags, so that I can discover topics relevant to my interests.
12. As a blog reader, I want to filter articles by specific technology tags (e.g., `React`, `Docker`, `Cloudflare`, `Canvas`), so that I can read articles in my domain of interest.
13. As a blog reader, I want the blog post to display an automatically generated Table of Contents (TOC) anchored to article headings, so that I can quickly jump to specific sections of long-form guides.
14. As a blog reader, I want article view counts to increment accurately upon real page visits, so that I can gauge the popularity of community topics.

### Author (Content Management & Publishing)
15. As the author, I want to access a protected `/admin` route with password/token authentication, so that unauthorized users cannot alter my blog posts or site settings.
16. As the author, I want to write and edit articles using a clean, split-screen or live-preview Markdown editor in `/admin`, so that I can format my articles with confidence.
17. As the author, I want to assign custom slugs, publication status (Draft vs. Published), summaries, and tags to each article, so that I have complete control over content taxonomy and URL design.
18. As the author, I want newly published or edited articles to be saved directly to Cloudflare D1 and become visible online immediately, so that I never have to wait for a 60-second CI/CD build to publish a fix or a new post.
19. As the author, I want to manage drafts privately without public exposure until I explicitly switch the status to published, so that I can write ongoing notes over several days.
20. As the author, I want an export/backup mechanism for all D1 markdown posts into raw files or JSON, so that my content is never vendor-locked.

---

## Implementation Decisions

### 1. Framework & Edge Runtime
- **Deprecate Next.js entirely**: Remove Next.js, Turbopack, and associated build artifacts.
- **Adopt Hono**: Utilize Hono as the single edge runtime framework running natively inside Cloudflare Workers (`workerd`).
- **Templating**: Utilize Hono JSX / html template literals for Edge SSR, guaranteeing zero runtime client-side overhead while maintaining component modularity.

### 2. Edge Database & Persistence
- **Cloudflare D1**: Distributed SQLite edge database for all dynamic blog data.
- **Drizzle ORM (or D1 Prepared Statements)**: Strongly typed schema migrations and query execution compatible with Cloudflare Workers.
- **Core Entities**:
  - `posts`: `id`, `slug` (unique index), `title`, `summary`, `content` (raw Markdown), `tags` (JSON string or relational), `is_published`, `views`, `created_at`, `updated_at`.
  - `admin_users` / `auth_tokens`: Secure credential hashes for `/admin` authentication.

### 3. Markdown & Syntax Pipeline
- **Markdown Processing**: Server-side parsing on the edge using lightweight, zero-dependency/wasm-friendly parsers (such as `marked` or `micromark` with `prismjs` / `shiki` edge adapter).
- **Security**: Sanitize generated HTML to prevent XSS from raw Markdown injections.

### 4. SEO & Metadata Architecture
- Every route generated by Hono Edge SSR outputs:
  - Canonical URL tag (`rel="canonical"`)
  - OpenGraph protocol tags (`og:title`, `og:description`, `og:image`, `og:url`, `og:type`)
  - Twitter card tags (`twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`)
  - JSON-LD structured data: `Person` schema on `/`, `BlogPosting` / `TechArticle` schema on `/blog/:slug`.

### 5. Styling & Assets Pipeline
- **Tailwind CSS v4**: Compiled ahead-of-time into a minified, standalone CSS asset placed in the static assets directory.
- **Static Assets**: Images (`/images/projects/*`, `/favicon.svg`) and compiled CSS are served directly via Cloudflare Workers Static Assets binding (`assets: { directory: "./public" }`).

### 6. Authentication for `/admin`
- Password hashing with Web Crypto API (`PBKDF2` or `HMAC-SHA256`).
- Session management via signed HTTP-only cookies (`SameSite=Strict`, `Secure`) with time-based expiration.

---

## Testing Decisions

### What Makes a Good Test
- **External Behavior Only**: Tests must interact through HTTP requests and verify HTTP status codes, headers, and response HTML/JSON bodies without asserting on internal function names or database internals.
- **SEO & Server-Render Integrity**: Tests must ensure that requesting `/` and `/blog/:slug` yields status 200 with complete `<title>`, OpenGraph tags, semantic headers (`<h1>`), and unescaped HTML content in the raw response body prior to any client-side execution.
- **Authentication & Security Bounds**: Tests must verify that accessing `/admin` or calling `POST /api/posts` without valid session cookies/tokens returns 401/403, and that published draft articles are inaccessible to unauthenticated visitors.

### Primary Testing Seam (The Highest Feasible Seam)
- **Hono Application Request Seam (`app.request()`)**:
  Using Hono's native `app.request(url, options, env)` test runner paired with Miniflare / `@cloudflare/vitest-pool-workers`.
  - This allows executing the full HTTP lifecycle against a simulated Cloudflare Workers environment and an in-memory D1 database.
  - A single seam tests routing, edge SSR, D1 queries, authentication middleware, and HTML serialization in one pass.

---

## Out of Scope

1. **Third-Party OAuth Logins**: No Google/GitHub OAuth for blog visitors (visitors read without logging in; only the author logs into `/admin`).
2. **Comment System**: Interactive visitor comments (e.g., Giscus, Utterances) are deferred to a future iteration.
3. **Multi-Author Collaboration**: The CMS and admin dashboard are strictly single-user for the portfolio owner.
4. **Subscription / Newsletter Emailing**: Automated subscriber newsletters or Mailchimp/Resend integrations are out of scope for this milestone.

---

## Further Notes

- **Migration Safety**: The current Next.js repository state is committed and pushed to GitHub `main` (`837ceb8`), ensuring a clean rollback point at any time.
- **Domain & Deployment Continuity**: The target domain `blog.2jo4u4.workers.dev` will transition seamlessly upon updating `wrangler.jsonc` to deploy the Hono worker with D1 bindings.
