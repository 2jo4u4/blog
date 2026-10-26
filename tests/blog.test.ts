import { describe, it, expect } from "vitest";
import app from "../src/index";

describe("Technical Blog Index Edge SSR Seam", () => {
  it("renders /blog with HTTP 200, SEO metadata, and published posts", async () => {
    const res = await app.request("http://localhost/blog");
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
  });

  it("filters articles by tag parameter /blog?tag=Cloudflare", async () => {
    const res = await app.request("http://localhost/blog?tag=Cloudflare");
    expect(res.status).toBe(200);

    const html = await res.text();
    expect(html).toContain("從 Next.js 遷移至 Cloudflare Workers");
  });

  it("renders empty state gracefully for non-existent tag", async () => {
    const res = await app.request("http://localhost/blog?tag=NonExistent123");
    expect(res.status).toBe(200);

    const html = await res.text();
    expect(html).toContain("尚無相關文章");
  });
});
