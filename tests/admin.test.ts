import { describe, it, expect } from "vitest";
import app from "../src/index";
import { createSessionToken } from "../src/lib/auth";

describe("Admin Authentication and Publishing Seam", () => {
  const SECRET = "portfolio-auth-secret-key-2026";
  const PASSWORD = "jay-admin-2026";

  it("redirects unauthenticated /admin requests to /admin/login", async () => {
    const res = await app.request("http://localhost/admin", {
      method: "GET",
      redirect: "manual",
    });
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
    });
    expect(res.status).toBe(401);
    const html = await res.text();
    expect(html).toContain("帳號或密碼錯誤");
  });

  it("authenticates valid credentials, sets session cookie, and allows dashboard access", async () => {
    const formData = new FormData();
    formData.append("username", "admin");
    formData.append("password", PASSWORD);

    const loginRes = await app.request("http://localhost/admin/login", {
      method: "POST",
      body: formData,
      redirect: "manual",
    });

    expect(loginRes.status).toBe(302);
    expect(loginRes.headers.get("location")).toBe("/admin");

    const cookieHeader = loginRes.headers.get("set-cookie");
    expect(cookieHeader).toContain("admin_session=");

    // Access /admin with the session cookie
    const sessionCookie = cookieHeader!.split(";")[0];
    const adminRes = await app.request("http://localhost/admin", {
      headers: {
        Cookie: sessionCookie,
      },
    });

    expect(adminRes.status).toBe(200);
    const html = await adminRes.text();
    expect(html).toContain("Admin Workspace");
    expect(html).toContain("+ New Article");
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
    });
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
    });

    expect(createRes.status).toBe(201);

    // 2. Query /blog -> article must be listed immediately without rebuild
    const blogRes = await app.request("http://localhost/blog");
    expect(blogRes.status).toBe(200);
    const blogHtml = await blogRes.text();
    expect(blogHtml).toContain("即時發布邊緣測試文章");
    expect(blogHtml).toContain("#LiveDemo");

    // 3. Query /blog/:slug -> article reader renders prose and SEO immediately
    const readerRes = await app.request("http://localhost/blog/instant-edge-post");
    expect(readerRes.status).toBe(200);
    const readerHtml = await readerRes.text();
    expect(readerHtml).toContain("即時發布邊緣測試文章");
    expect(readerHtml).toContain("文章已在邊緣節點立即可見！");
  });
});
