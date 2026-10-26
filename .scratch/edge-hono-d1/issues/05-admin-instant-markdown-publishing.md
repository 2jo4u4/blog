# 05: Admin Authentication and In-Browser Instant Markdown Publishing at `/admin`

**What to build:**
Implement the secure admin workspace and instant publishing flow under `/admin`. Provide session-based authentication using cryptographically secure password hashes and HTTP-only signed cookies. Once authenticated, provide a clean in-browser Markdown editor with live preview, custom slug configuration, title/summary fields, tag management, and Draft/Published toggle. Saving or publishing writes directly to Cloudflare D1, making the article immediately live on `/blog` and `/blog/:slug` in real-time with zero CI/CD builds or Git deployments.

**Blocked by:** 04-dynamic-article-reader-ssr

**Status:** closed

- [x] `/admin` route redirects unauthenticated visitors to `/admin/login`.
- [x] Login endpoint validates credentials using Web Crypto API and sets secure HTTP-only session cookie.
- [x] Authenticated dashboard lists all articles (drafts and published) with options to create, edit, or delete.
- [x] Markdown editor provides title, slug, summary, tags, and content fields with live preview.
- [x] Submitting a new or edited article saves directly to Cloudflare D1 edge database.
- [x] Newly published articles become visible at `/blog` and `/blog/:slug` immediately without rebuild.
- [x] API routes (`POST /api/posts`, `PUT /api/posts/:id`, `DELETE /api/posts/:id`) reject unauthenticated requests with HTTP 401/403.
