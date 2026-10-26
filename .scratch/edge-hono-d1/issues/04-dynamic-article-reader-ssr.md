# 04: Dynamic Edge SSR Article Reader with Syntax Highlighting and SEO at `/blog/:slug`

**What to build:**
Create the dynamic article reader route (`GET /blog/:slug`). Hono retrieves the article matching `:slug` from Cloudflare D1, converts raw Markdown into clean, sanitized HTML at the edge, and injects code syntax highlighting with language labels and a one-click copy button. Automatically generate an anchored Table of Contents (TOC) for articles with multiple headings. Pre-render article-specific dynamic SEO meta tags (title, description, image, canonical) and `TechArticle`/`BlogPosting` JSON-LD structured data directly into the edge response. Increment the view count in D1 asynchronously upon valid user visits without blocking initial response delivery.

**Blocked by:** 03-public-blog-index-and-tags

**Status:** ready-for-agent

- [ ] Hono route `GET /blog/:slug` loads article record from Cloudflare D1 and returns HTTP 404 with custom error page if not found or unpublished.
- [ ] Raw Markdown content is parsed into sanitized HTML on the edge with security safeguards against XSS.
- [ ] Code snippets feature syntax highlighting, language badge, and a client-side one-click copy script.
- [ ] Automatically extracted headings form a jumpable Table of Contents (TOC).
- [ ] Pre-rendered HTML `<head>` contains dynamic OpenGraph tags, Twitter Card tags, and JSON-LD `TechArticle` schema.
- [ ] Article page view count is incremented in D1 upon page visit.
- [ ] Raw HTML response inspected via tests contains full article prose and code before client script execution.
