import { describe, it, expect } from "vitest";
import app from "../src/index";

describe("Dynamic Article Reader Edge SSR Seam", () => {
  it("renders published article by slug with full SEO and parsed Markdown", async () => {
    const res = await app.request("http://localhost/blog/edge-native-hono-d1-architecture");
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/html");

    const html = await res.text();

    // SEO checks
    expect(html).toContain("<title>");
    expect(html).toContain("從 Next.js 遷移至 Cloudflare Workers");
    expect(html).toContain('property="og:title"');
    expect(html).toContain('rel="canonical"');
    expect(html).toContain("/blog/edge-native-hono-d1-architecture");
    expect(html).toContain('type="application/ld+json"');
    expect(html).toContain("TechArticle");

    // Markdown conversion checks
    expect(html).toContain("<h2");
    expect(html).toContain("為什麼需要邊緣原生");
    expect(html).toContain("<code");
    expect(html).toContain("language-typescript");
    expect(html).toContain("copy-btn");

    // Table of contents
    expect(html).toContain("Table of Contents");

    // Author card
    expect(html).toContain("黃冠傑 (Jay Huang)");
  });

  it("returns HTTP 404 with custom error page when slug is not found", async () => {
    const res = await app.request("http://localhost/blog/non-existent-article-slug");
    expect(res.status).toBe(404);

    const html = await res.text();
    expect(html).toContain("404 Not Found");
    expect(html).toContain("抱歉，您所尋找的文章或頁面不存在");
  });
});
