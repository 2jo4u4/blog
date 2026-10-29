import { describe, it, expect } from "vitest";
import app from "../src/index";

describe("Landing Page Edge SSR Seam", () => {
  it("renders landing page (zh) with complete SEO metadata and project keywords", async () => {
    const res = await app.request("http://localhost/");
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/html");

    const html = await res.text();

    // Verification of standard HTML doctype
    expect(html).toContain("<!DOCTYPE html>");

    // Verification of SEO meta tags in <head>
    expect(html).toContain("<title>Jay | 前端工程師</title>");
    expect(html).toContain('property="og:title"');
    expect(html).toContain('property="og:description"');
    expect(html).toContain('property="og:image"');
    expect(html).toContain('property="og:url"');
    expect(html).toContain('name="twitter:card"');
    expect(html).toContain('name="twitter:title"');
    expect(html).toContain('rel="canonical"');
    expect(html).toContain('type="application/ld+json"');
    expect(html).toContain("https://schema.org");
    expect(html).toContain("Person");

    // Verification of pre-rendered content without client hydration
    expect(html).toContain("DreamCity");
    expect(html).toContain("多人非對稱對抗");
    expect(html).toContain("Optoma");
    expect(html).toContain("Canvas");
    expect(html).toContain("SoundCraft EQ");
    expect(html).toContain("前往 Chrome 線上商店");
    expect(html).toContain("Firefox AMO 審核中");
    expect(html).toContain("Cloudflare");
    expect(html).toContain("2jo4u4@gmail.com");

    // Theme & stylesheet & client scripts
    expect(html).toContain('href="/styles.css"');
    expect(html).toContain('href="/favicon.ico"');
    expect(html).toContain("data-local-format");
  });

  it("renders English landing page when ?lang=en is requested", async () => {
    const res = await app.request("http://localhost/?lang=en");
    expect(res.status).toBe(200);

    const html = await res.text();
    expect(html).toContain("<title>Jay | Frontend Engineer</title>");
    expect(html).toContain("Jay Huang");
    expect(html).toContain("Senior Frontend Engineer");
    expect(html).toContain("DreamCity");
    expect(html).toContain("SoundCraft EQ");
    expect(html).toContain("View on Chrome Web Store");
    expect(html).toContain("Firefox AMO (Review in Progress)");
  });

  it("responds to /health check endpoint", async () => {
    const res = await app.request("http://localhost/health");
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual({ status: "ok", runtime: "edge-hono" });
  });
});
