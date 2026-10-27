import { describe, it, expect, beforeEach } from "vitest";
import app from "../src/index";
import { MockD1Database } from "./helpers/mockDb";

describe("Dynamic Article Reader Edge SSR Seam", () => {
  let mockDb: any;

  beforeEach(() => {
    mockDb = new MockD1Database();
  });

  it("renders published article by slug with full SEO and parsed Markdown", async () => {
    const res = await app.request(
      "http://localhost/blog/edge-native-hono-d1-architecture",
      {},
      { DB: mockDb }
    );
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

    // Table of contents & Unified Sticky Sidebar
    expect(html).toContain("Table of Contents");
    expect(html).toContain("sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto");

    // Publication date & Revision history with local timezone attributes
    expect(html).toContain("發布：");
    expect(html).toContain('dateTime="2026-10-26T20:00:00+08:00"');
    expect(html).toContain('data-local-format="date"');
    expect(html).toContain("文章歷史紀錄");
    expect(html).toContain("初版發布");
    expect(html).toContain('data-local-format="datetime"');
    expect(html).toContain("2026-10-26 20:00:00");

    // Author card
    expect(html).toContain("黃冠傑 (Jay Huang)");
  });

  it("returns HTTP 404 with custom error page when slug is not found", async () => {
    const res = await app.request(
      "http://localhost/blog/non-existent-article-slug",
      {},
      { DB: mockDb }
    );
    expect(res.status).toBe(404);

    const html = await res.text();
    expect(html).toContain("404 Not Found");
    expect(html).toContain("抱歉，您所尋找的文章或頁面不存在");
  });
});
