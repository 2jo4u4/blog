# 02: Cloudflare D1 Database Binding and Posts Schema Migration

**What to build:**
Configure Cloudflare D1 distributed edge SQLite database bindings in `wrangler.jsonc` and implement the schema definition and migration pipeline. The schema must define the `posts` entity to store technical note metadata and raw Markdown content, as well as an `admin_users` entity for authentication credentials. Provide a verified local and remote migration workflow, along with a health-check/diagnostic endpoint to verify that the edge worker can query and mutate D1 within the Cloudflare isolate.

**Blocked by:** 01-hono-edge-ssr-landing-page

**Status:** closed

- [x] Cloudflare D1 database binding (e.g. `DB`) is declared in `wrangler.jsonc`.
- [x] Database migration files define the `posts` table (`id`, `slug` unique index, `title`, `summary`, `content`, `tags`, `is_published`, `views`, `created_at`, `updated_at`).
- [x] Database migration files define the `admin_users` table for password authentication.
- [x] Migration scripts (via Wrangler CLI or Drizzle) run cleanly against local Miniflare D1 simulations and cloud D1 instances.
- [x] An edge verification test confirms successful execution of parameterized queries against D1 without SQL injection vulnerabilities or runtime exceptions.
