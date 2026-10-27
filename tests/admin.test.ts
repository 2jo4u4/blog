import { describe, it, expect, beforeEach } from "vitest";
import app from "../src/index";
import { createSessionToken } from "../src/lib/auth";
import { MockD1Database } from "./helpers/mockDb";

describe("Admin Authentication and Publishing Seam", () => {
  const SECRET = "portfolio-auth-secret-key-2026";
  let mockDb: any;

  beforeEach(() => {
    mockDb = new MockD1Database();
  });

  it("redirects unauthenticated /admin requests to /admin/login", async () => {
    const res = await app.request("http://localhost/admin", {
      method: "GET",
      redirect: "manual",
    }, { DB: mockDb });
    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe("/admin/login");
  });

  it("rejects login with invalid password", async () => {
    const formData = new FormData();
    formData.append("username", "admin");
    formData.append("password", "wrong-password");

    const res = await app.request("http://localhost/admin/login", {
      method: "POST",
      body: formData,
    }, { DB: mockDb });
    expect(res.status).toBe(401);
    const html = await res.text();
    expect(html).toContain("帳號或密碼錯誤");
  });

  it("authenticates valid test credentials, sets session cookie, and allows dashboard access", async () => {
    const formData = new FormData();
    formData.append("username", "test_admin");
    formData.append("password", "test_password_123");

    const loginRes = await app.request("http://localhost/admin/login", {
      method: "POST",
      body: formData,
      redirect: "manual",
    }, { DB: mockDb });

    expect(loginRes.status).toBe(302);
    expect(loginRes.headers.get("location")).toBe("/admin");

    const cookieHeader = loginRes.headers.get("set-cookie");
    expect(cookieHeader).toContain("admin_session=");

    // Access /admin with the session cookie
    const sessionCookie = cookieHeader!.split(";")[0];
    const dashboardRes = await app.request("http://localhost/admin", {
      headers: {
        Cookie: sessionCookie,
      },
    }, { DB: mockDb });

    expect(dashboardRes.status).toBe(200);
    const html = await dashboardRes.text();
    expect(html).toContain("Admin Dashboard");
    expect(html).toContain("+ New Article");
    expect(html).toContain('data-local-format="date"');
  });

  it("rejects login when user is not in database (fail closed)", async () => {
    const formData = new FormData();
    formData.append("username", "unknown_user");
    formData.append("password", "any_password");

    const loginRes = await app.request("http://localhost/admin/login", {
      method: "POST",
      body: formData,
    }, { DB: mockDb });

    expect(loginRes.status).toBe(401);
    const html = await loginRes.text();
    expect(html).toContain("帳號或密碼錯誤");
  });

  it("rejects legacy hardcoded credentials without DB account", async () => {
    const formData = new FormData();
    formData.append("username", "admin");
    formData.append("password", "jay-admin-2026");

    const loginRes = await app.request("http://localhost/admin/login", {
      method: "POST",
      body: formData,
    }, { DB: mockDb });

    expect(loginRes.status).toBe(401);
  });

  it("rejects unauthenticated API requests with 401", async () => {
    const res = await app.request("http://localhost/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: "unauthorized-post",
        title: "Test",
        summary: "Test",
        content: "Test",
      }),
    }, { DB: mockDb });
    expect(res.status).toBe(401);
  });

  it("allows instant article publishing via authenticated API and renders live on /blog and /blog/:slug immediately", async () => {
    const validToken = await createSessionToken(SECRET);

    // 1. Publish new article
    const createRes = await app.request("http://localhost/api/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `admin_session=${validToken}`,
      },
      body: JSON.stringify({
        slug: "instant-edge-post",
        title: "即時發布邊緣測試文章",
        summary: "這是一篇透過管理員後台直接寫入並立即生效的文章。",
        content: "## 測試內容\n\n文章已在邊緣節點立即可見！",
        tags: ["LiveDemo", "Edge"],
        is_published: 1,
      }),
    }, { DB: mockDb });

    expect(createRes.status).toBe(201);

    // 2. Query /blog -> article must be listed immediately without rebuild
    const blogRes = await app.request("http://localhost/blog", {}, { DB: mockDb });
    expect(blogRes.status).toBe(200);
    const blogHtml = await blogRes.text();
    expect(blogHtml).toContain("即時發布邊緣測試文章");
    expect(blogHtml).toContain("#LiveDemo");

    // 3. Query /blog/:slug -> article reader renders prose and SEO immediately
    const readerRes = await app.request("http://localhost/blog/instant-edge-post", {}, { DB: mockDb });
    expect(readerRes.status).toBe(200);
    const readerHtml = await readerRes.text();
    expect(readerHtml).toContain("即時發布邊緣測試文章");
    expect(readerHtml).toContain("文章已在邊緣節點立即可見！");
  });

  it("populates existing title, slug, summary, and markdown content when editing an article", async () => {
    const validToken = await createSessionToken(SECRET);

    const res = await app.request("http://localhost/admin/editor?slug=edge-native-hono-d1-architecture", {
      headers: {
        Cookie: `admin_session=${validToken}`,
      },
    }, { DB: mockDb });

    expect(res.status).toBe(200);
    const html = await res.text();

    // Verify title and slug populated in input value
    expect(html).toContain('value="從 Next.js 遷移至 Cloudflare Workers');
    expect(html).toContain('value="edge-native-hono-d1-architecture"');

    // Verify summary and markdown content populated inside textarea children
    expect(html).toContain('>分享如何徹底摒棄肥大的客戶端運行時');
    expect(html).toContain('>## 為什麼需要邊緣原生');
  });

  it("handles AI-generated checkbox flag and renders AI badge on frontend", async () => {
    const validToken = await createSessionToken(SECRET);

    // Create article with is_ai_generated = 1
    const createRes = await app.request("http://localhost/api/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `admin_session=${validToken}`,
      },
      body: JSON.stringify({
        slug: "ai-generated-deep-dive",
        title: "AI 協同程式碼分析報告",
        summary: "這是一篇由 AI 輔助撰寫的技術報告。",
        content: "## 報告正文\n\nAI 生成測試。",
        tags: ["AI", "LLM"],
        is_published: 1,
        is_ai_generated: 1,
      }),
    }, { DB: mockDb });
    expect(createRes.status).toBe(201);

    // Verify blog list displays AI badge
    const blogRes = await app.request("http://localhost/blog", {}, { DB: mockDb });
    expect(blogRes.status).toBe(200);
    const blogHtml = await blogRes.text();
    expect(blogHtml).toContain("AI 協作/生成");

    // Verify article reader displays AI badge
    const articleRes = await app.request("http://localhost/blog/ai-generated-deep-dive", {}, { DB: mockDb });
    expect(articleRes.status).toBe(200);
    const articleHtml = await articleRes.text();
    expect(articleHtml).toContain("AI 協同/生成內容");
  });
});
