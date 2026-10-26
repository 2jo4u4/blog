import { describe, it, expect, beforeEach } from "vitest";
import app from "../src/index";
import { MockD1Database } from "./helpers/mockDb";

describe("Technical Blog Index Edge SSR Seam", () => {
  let mockDb: any;

  beforeEach(() => {
    mockDb = new MockD1Database();
  });

  it("renders /blog with HTTP 200, SEO metadata, and published posts with correct total count", async () => {
    const res = await app.request("http://localhost/blog", {}, { DB: mockDb });
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/html");

    const html = await res.text();

    // SEO checks
    expect(html).toContain("<title>");
    expect(html).toContain("技術隨筆");
    expect(html).toContain('property="og:title"');
    expect(html).toContain('property="og:description"');
    expect(html).toContain('rel="canonical"');
    expect(html).toContain("/blog");

    // Semantic HTML tags
    expect(html).toContain("<article");
    expect(html).toContain("<time");

    // Content checks
    expect(html).toContain("從 Next.js 遷移至 Cloudflare Workers");
    expect(html).toContain("#Architecture");
    expect(html).toContain("#Cloudflare");

    // Total posts count (should be 1 article, NOT sum of tags)
    expect(html).toContain("全部文章 (1)");
  });

  it("filters articles by tag parameter /blog?tag=Cloudflare", async () => {
    const res = await app.request("http://localhost/blog?tag=Cloudflare", {}, { DB: mockDb });
    expect(res.status).toBe(200);

    const html = await res.text();
    expect(html).toContain("從 Next.js 遷移至 Cloudflare Workers");
    expect(html).toContain("全部文章 (1)");
  });

  it("renders empty state gracefully for non-existent tag", async () => {
    const res = await app.request("http://localhost/blog?tag=NonExistent123", {}, { DB: mockDb });
    expect(res.status).toBe(200);

    const html = await res.text();
    expect(html).toContain("尚無相關文章");
    expect(html).toContain("標籤 #NonExistent123 下目前沒有已發布的文章");
  });

  it("renders empty state when there are no published articles", async () => {
    mockDb.posts = [];
    const res = await app.request("http://localhost/blog", {}, { DB: mockDb });
    expect(res.status).toBe(200);

    const html = await res.text();
    expect(html).toContain("尚無文章發布");
    expect(html).toContain("目前尚無文章發布，請稍後再嘗試。");
  });
});
