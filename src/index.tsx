import { Hono } from "hono";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import { secureHeaders } from "hono/secure-headers";
import { LandingPage } from "./components/LandingPage";
import { BlogIndexPage } from "./components/BlogIndexPage";
import { ArticleReaderPage } from "./components/ArticleReaderPage";
import { NotFoundPage } from "./components/NotFoundPage";
import { AdminLoginPage } from "./components/admin/AdminLoginPage";
import { AdminDashboardPage } from "./components/admin/AdminDashboardPage";
import { AdminEditorPage } from "./components/admin/AdminEditorPage";
import {
  getPublishedPosts,
  getPublishedPostsCount,
  getAllPostsAdmin,
  getPostBySlug,
  getPostsByTag,
  getAllTags,
  getPostRevisions,
  createPost,
  updatePost,
  deletePost,
  incrementPostViews,
  ensureSchema,
  getAdminUser,
  Post,
  PostRevision,
} from "./lib/db";
import { extractTocAndParseMarkdown } from "./lib/markdown";
import { createSessionToken, verifySessionToken, verifyPassword } from "./lib/auth";
import { LoginRateLimiter } from "./lib/rateLimit";
import translations from "./lib/i18n.json";

export interface Env {
  DB?: D1Database;
  AUTH_SECRET?: string;
}

export const loginRateLimiter = new LoginRateLimiter();

const app = new Hono<{ Bindings: Env }>();

// Mount comprehensive defensive HTTP security headers
app.use(
  "*",
  secureHeaders({
    xFrameOptions: "DENY",
    xContentTypeOptions: "nosniff",
    strictTransportSecurity: "max-age=31536000; includeSubDomains",
    referrerPolicy: "strict-origin-when-cross-origin",
    contentSecurityPolicy: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
    },
  })
);

// Helper to ensure standard HTML doctype is always prepended to avoid quirks mode
const renderHtml = (component: any) => `<!DOCTYPE html>\n${component}`;

const DEFAULT_SECRET = "portfolio-auth-secret-key-2026";

function getSecret(env?: Env): string {
  return env?.AUTH_SECRET || DEFAULT_SECRET;
}

async function isAuthorized(c: any): Promise<boolean> {
  const secret = getSecret(c.env);
  const cookieToken = getCookie(c, "admin_session");
  if (cookieToken && (await verifySessionToken(cookieToken, secret))) {
    return true;
  }
  const authHeader = c.req.header("Authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const bearerToken = authHeader.slice(7);
    if (await verifySessionToken(bearerToken, secret)) {
      return true;
    }
  }
  return false;
}

let schemaInitialized = false;
async function ensureDb(db?: D1Database) {
  if (!db || schemaInitialized) return;
  try {
    await ensureSchema(db);
    schemaInitialized = true;
  } catch (err) {
    console.error("ensureDb error:", err);
  }
}

app.use("*", async (c, next) => {
  if (c.env?.DB) {
    await ensureDb(c.env.DB);
  }
  await next();
});

/* =========================================================
   PUBLIC ROUTES
   ========================================================= */

app.get("/health", (c) => {
  return c.json({ status: "ok", runtime: "edge-hono" });
});

app.get("/", (c) => {
  const queryLang = c.req.query("lang");
  const cookieLang = getCookie(c, "portfolio-locale");

  let locale: "zh" | "en" = "zh";
  if (queryLang === "en" || (!queryLang && cookieLang === "en")) {
    locale = "en";
  }

  const t = locale === "en" ? translations.en : translations.zh;

  return c.html(renderHtml(<LandingPage locale={locale} t={t} url={c.req.url} />));
});

app.get("/blog", async (c) => {
  const queryLang = c.req.query("lang");
  const cookieLang = getCookie(c, "portfolio-locale");
  const tag = c.req.query("tag");

  let locale: "zh" | "en" = "zh";
  if (queryLang === "en" || (!queryLang && cookieLang === "en")) {
    locale = "en";
  }

  const t = locale === "en" ? translations.en : translations.zh;

  let posts: Post[] = [];
  let tags: { tag: string; count: number }[] = [];
  let totalPostsCount = 0;

  if (c.env?.DB) {
    try {
      if (tag) {
        posts = await getPostsByTag(c.env.DB, tag);
        totalPostsCount = await getPublishedPostsCount(c.env.DB);
      } else {
        posts = await getPublishedPosts(c.env.DB);
        totalPostsCount = posts.length;
      }
      tags = await getAllTags(c.env.DB);
    } catch (err) {
      console.error("D1 query failed:", err);
    }
  }

  return c.html(
    renderHtml(
      <BlogIndexPage
        posts={posts}
        tags={tags}
        currentTag={tag}
        totalPostsCount={totalPostsCount}
        locale={locale}
        t={t}
        url={c.req.url}
      />
    )
  );
});

app.get("/blog/:slug", async (c) => {
  const slug = c.req.param("slug");
  const queryLang = c.req.query("lang");
  const cookieLang = getCookie(c, "portfolio-locale");

  let locale: "zh" | "en" = "zh";
  if (queryLang === "en" || (!queryLang && cookieLang === "en")) {
    locale = "en";
  }

  const t = locale === "en" ? translations.en : translations.zh;

  let post: Post | null = null;
  if (c.env?.DB) {
    try {
      post = await getPostBySlug(c.env.DB, slug);
    } catch (err) {
      console.error("D1 getPostBySlug failed:", err);
    }
  }

  if (!post || post.is_published === 0) {
    return c.html(renderHtml(<NotFoundPage locale={locale} t={t} url={c.req.url} />), 404);
  }

  // Increment views asynchronously
  if (c.env?.DB) {
    try {
      const updateViewsPromise = incrementPostViews(c.env.DB, slug);
      let hasExecutionCtx = false;
      try {
        if (c.executionCtx && typeof c.executionCtx.waitUntil === "function") {
          c.executionCtx.waitUntil(updateViewsPromise);
          hasExecutionCtx = true;
        }
      } catch {
        // No execution context in synthetic testing environment
      }
      if (!hasExecutionCtx) {
        await updateViewsPromise;
      }
    } catch (err) {
      console.warn("Failed to increment views:", err);
    }
  } else {
    post.views += 1;
  }

  const { html, toc } = extractTocAndParseMarkdown(post.content);

  let revisions: PostRevision[] = [];
  if (c.env?.DB) {
    try {
      revisions = await getPostRevisions(c.env.DB, slug);
    } catch (err) {
      console.warn("getPostRevisions failed:", err);
    }
  }

  return c.html(
    renderHtml(
      <ArticleReaderPage
        post={post}
        revisions={revisions}
        html={html}
        toc={toc}
        locale={locale}
        t={t}
        url={c.req.url}
      />
    )
  );
});

/* =========================================================
   ADMIN WORKSPACE & AUTHENTICATION
   ========================================================= */

app.get("/admin/login", (c) => {
  return c.html(renderHtml(<AdminLoginPage />));
});

app.post("/admin/login", async (c) => {
  const clientIp =
    c.req.header("cf-connecting-ip") ||
    c.req.header("x-forwarded-for")?.split(",")[0].trim() ||
    "127.0.0.1";

  // Rate Limiting Guardrail: Short-circuit on excessive failed attempts
  if (loginRateLimiter.isBlocked(clientIp)) {
    return c.html(
      renderHtml(
        <AdminLoginPage
          error="嘗試登入失敗次數過多，請稍後再試 (Too many failed login attempts)。"
          initialUsername=""
        />
      ),
      429
    );
  }

  const body = await c.req.parseBody();
  const username = ((body.username as string) || "").trim();
  const password = (body.password as string) || "";

  let authenticated = false;

  // Strict database authentication via Cloudflare D1
  if (username && password && c.env?.DB) {
    try {
      const user = await getAdminUser(c.env.DB, username);
      if (user && (await verifyPassword(password, user.password_hash))) {
        authenticated = true;
      }
    } catch (err) {
      console.error("D1 getAdminUser check failed:", err);
    }
  }

  if (authenticated) {
    loginRateLimiter.reset(clientIp);
    const token = await createSessionToken(getSecret(c.env));
    setCookie(c, "admin_session", token, {
      path: "/",
      httpOnly: true,
      secure: false, // works locally and over edge HTTPS
      sameSite: "Lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    return c.redirect("/admin");
  }

  loginRateLimiter.recordFailure(clientIp);
  return c.html(
    renderHtml(<AdminLoginPage error="帳號或密碼錯誤，請重新輸入。" initialUsername={username} />),
    401
  );
});

app.get("/admin/logout", (c) => {
  deleteCookie(c, "admin_session", { path: "/" });
  return c.redirect("/admin/login");
});

app.get("/admin", async (c) => {
  if (!(await isAuthorized(c))) {
    return c.redirect("/admin/login");
  }

  let posts: Post[] = [];
  if (c.env?.DB) {
    try {
      posts = await getAllPostsAdmin(c.env.DB);
    } catch (err) {
      console.error("D1 getAllPostsAdmin failed:", err);
    }
  }

  return c.html(renderHtml(<AdminDashboardPage posts={posts} />));
});

app.get("/admin/editor", async (c) => {
  if (!(await isAuthorized(c))) {
    return c.redirect("/admin/login");
  }

  const slug = c.req.query("slug");
  let post: Post | null = null;
  if (slug && c.env?.DB) {
    try {
      post = await getPostBySlug(c.env.DB, slug);
    } catch (err) {
      console.error("D1 getPostBySlug failed in editor:", err);
    }
  }

  return c.html(renderHtml(<AdminEditorPage post={post} />));
});

app.post("/admin/posts", async (c) => {
  if (!(await isAuthorized(c))) {
    return c.redirect("/admin/login");
  }

  const body = await c.req.parseBody();
  const originalSlug = body.original_slug as string | undefined;
  const slug = (body.slug as string).trim();
  const title = (body.title as string).trim();
  const summary = (body.summary as string).trim();
  const content = body.content as string;
  const rawTags = (body.tags as string) || "";
  const tags = rawTags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  const is_published = body.is_published === "1" ? 1 : 0;
  const is_ai_generated = body.is_ai_generated === "1" ? 1 : 0;
  const revision_note =
    ((body.revision_note as string) || "").trim() ||
    (originalSlug ? "內容更新" : "初版發布");

  if (!c.env?.DB) {
    return c.text("Database connection unavailable", 500);
  }

  try {
    if (originalSlug) {
      await updatePost(c.env.DB, originalSlug, {
        title,
        summary,
        content,
        tags,
        is_published,
        is_ai_generated,
        revisionNote: revision_note,
      });
    } else {
      await createPost(c.env.DB, {
        slug,
        title,
        summary,
        content,
        tags,
        is_published,
        is_ai_generated,
        revisionNote: revision_note,
      });
    }
  } catch (err) {
    console.error("D1 save post failed:", err);
  }

  return c.redirect("/admin");
});

app.post("/admin/posts/delete", async (c) => {
  if (!(await isAuthorized(c))) {
    return c.redirect("/admin/login");
  }

  const body = await c.req.parseBody();
  const slug = body.slug as string;

  if (slug && c.env?.DB) {
    try {
      await deletePost(c.env.DB, slug);
    } catch (err) {
      console.error("D1 deletePost failed:", err);
    }
  }

  return c.redirect("/admin");
});

/* =========================================================
   PROTECTED API ROUTES FOR POSTS
   ========================================================= */

app.post("/api/posts", async (c) => {
  if (!(await isAuthorized(c))) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const body = await c.req.json();
  const { slug, title, summary, content, tags = [], is_published = 1, is_ai_generated = 0 } = body;

  if (!slug || !title || !summary || !content) {
    return c.json({ error: "Missing required fields" }, 400);
  }

  if (!c.env?.DB) {
    return c.json({ error: "Database connection unavailable" }, 500);
  }

  try {
    await createPost(c.env.DB, {
      slug,
      title,
      summary,
      content,
      tags,
      is_published,
      is_ai_generated,
    });
    return c.json({ success: true, slug }, 201);
  } catch (err: any) {
    console.error("D1 createPost API failed:", err);
    return c.json({ error: err.message || "Failed to create post" }, 500);
  }
});

app.put("/api/posts/:slug", async (c) => {
  if (!(await isAuthorized(c))) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const slug = c.req.param("slug");
  const body = await c.req.json();

  if (!c.env?.DB) {
    return c.json({ error: "Database connection unavailable" }, 500);
  }

  try {
    await updatePost(c.env.DB, slug, body);
    return c.json({ success: true, slug });
  } catch (err: any) {
    console.error("D1 updatePost API failed:", err);
    return c.json({ error: err.message || "Failed to update post" }, 500);
  }
});

app.delete("/api/posts/:slug", async (c) => {
  if (!(await isAuthorized(c))) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const slug = c.req.param("slug");

  if (!c.env?.DB) {
    return c.json({ error: "Database connection unavailable" }, 500);
  }

  try {
    await deletePost(c.env.DB, slug);
    return c.json({ success: true, deleted: slug });
  } catch (err: any) {
    console.error("D1 deletePost API failed:", err);
    return c.json({ error: err.message || "Failed to delete post" }, 500);
  }
});

export default app;
