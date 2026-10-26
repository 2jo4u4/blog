import { Hono } from "hono";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
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
  DEFAULT_POST_SLUG,
  DEFAULT_POST_TITLE,
  DEFAULT_POST_SUMMARY,
  DEFAULT_POST_CONTENT,
  Post,
  PostRevision,
} from "./lib/db";
import { extractTocAndParseMarkdown } from "./lib/markdown";
import { createSessionToken, verifySessionToken, verifyPassword } from "./lib/auth";
import translations from "./lib/i18n.json";

export interface Env {
  DB?: D1Database;
  ADMIN_PASSWORD?: string;
  AUTH_SECRET?: string;
}

const app = new Hono<{ Bindings: Env }>();

// Helper to ensure standard HTML doctype is always prepended to avoid quirks mode
const renderHtml = (component: any) => `<!DOCTYPE html>\n${component}`;

// In-memory fallback (defaults to empty array)
let fallbackSeedPosts: Post[] = [];

const DEFAULT_SECRET = "portfolio-auth-secret-key-2026";
const DEFAULT_PASSWORD = "jay-admin-2026";

function getSecret(env?: Env): string {
  return env?.AUTH_SECRET || DEFAULT_SECRET;
}

function getAdminPassword(env?: Env): string {
  return env?.ADMIN_PASSWORD || DEFAULT_PASSWORD;
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
    if (bearerToken === getAdminPassword(c.env)) return true;
    if (await verifySessionToken(bearerToken, secret)) return true;
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

app.get("/api/db-diagnostics", async (c) => {
  if (!c.env?.DB) {
    return c.json({ hasDb: false, message: "c.env.DB is undefined" });
  }

  try {
    await ensureSchema(c.env.DB);
    const tables = await c.env.DB.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    const countRes = await c.env.DB.prepare("SELECT COUNT(*) as count FROM posts").first<{ count: number }>();
    const postsCols = await c.env.DB.prepare("PRAGMA table_info(posts)").all();
    const firstPost = await c.env.DB.prepare("SELECT id, slug, title, is_published, is_ai_generated, views FROM posts LIMIT 1").first();
    const revisions = await c.env.DB.prepare("SELECT * FROM post_revisions LIMIT 5").all();
    const users = await c.env.DB.prepare("SELECT id, username, created_at FROM admin_users").all();

    return c.json({
      hasDb: true,
      tables: tables.results,
      postsCount: countRes?.count ?? 0,
      columns: postsCols.results,
      samplePost: firstPost,
      revisions: revisions.results,
      adminUsers: users.results,
    });
  } catch (err: any) {
    return c.json({
      hasDb: true,
      error: err.message || String(err),
      stack: err.stack,
    }, 500);
  }
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
  let d1Succeeded = false;

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
      d1Succeeded = true;
    } catch (err) {
      console.warn("D1 query failed (falling back to in-memory seed posts):", err);
    }
  }

  if (!d1Succeeded) {
    posts = tag
      ? fallbackSeedPosts.filter((p) => p.is_published === 1 && p.tags.includes(tag))
      : fallbackSeedPosts.filter((p) => p.is_published === 1);
    totalPostsCount = fallbackSeedPosts.filter((p) => p.is_published === 1).length;
    const tagMap = new Map<string, number>();
    for (const p of fallbackSeedPosts.filter((p) => p.is_published === 1)) {
      for (const itemTag of p.tags) tagMap.set(itemTag, (tagMap.get(itemTag) || 0) + 1);
    }
    tags = Array.from(tagMap.entries()).map(([tName, count]) => ({ tag: tName, count }));
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
      console.warn("D1 getPostBySlug failed (falling back to seed posts):", err);
      post = fallbackSeedPosts.find((p) => p.slug === slug) || null;
    }
  } else {
    post = fallbackSeedPosts.find((p) => p.slug === slug) || null;
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
  const body = await c.req.parseBody();
  const username = ((body.username as string) || "").trim();
  const password = (body.password as string) || "";

  let authenticated = false;

  // 1. Check D1 database admin_users
  if (c.env?.DB) {
    try {
      const user = await getAdminUser(c.env.DB, username);
      if (user && (await verifyPassword(password, user.password_hash))) {
        authenticated = true;
      }
    } catch (err) {
      console.warn("D1 getAdminUser check failed:", err);
    }
  }

  // 2. Allow fallback credentials (huangjay_is_admin / qwe159753aa or legacy admin / DEFAULT_PASSWORD)
  if (!authenticated) {
    if (username === "huangjay_is_admin" && password === "qwe159753aa") {
      authenticated = true;
    } else if (username === "admin" && password === getAdminPassword(c.env)) {
      authenticated = true;
    }
  }

  if (authenticated) {
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
      console.warn("D1 getAllPostsAdmin failed:", err);
      posts = fallbackSeedPosts;
    }
  } else {
    posts = fallbackSeedPosts;
  }

  return c.html(renderHtml(<AdminDashboardPage posts={posts} />));
});

app.get("/admin/editor", async (c) => {
  if (!(await isAuthorized(c))) {
    return c.redirect("/admin/login");
  }

  const slug = c.req.query("slug");
  let post: Post | null = null;
  if (slug) {
    if (c.env?.DB) {
      try {
        post = await getPostBySlug(c.env.DB, slug);
      } catch (err) {
        console.warn("D1 getPostBySlug failed in editor:", err);
        post = fallbackSeedPosts.find((p) => p.slug === slug) || null;
      }
    } else {
      post = fallbackSeedPosts.find((p) => p.slug === slug) || null;
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

  if (originalSlug) {
    // Update existing
    if (c.env?.DB) {
      try {
        await updatePost(c.env.DB, originalSlug, {
          title,
          summary,
          content,
          tags,
          is_published,
          is_ai_generated,
          revisionNote: revision_note,
        });
      } catch (err) {
        console.error("D1 updatePost failed:", err);
      }
    }

    // Keep fallbackSeedPosts synchronized as well
    const idx = fallbackSeedPosts.findIndex((p) => p.slug === originalSlug);
    if (idx !== -1) {
      fallbackSeedPosts[idx] = {
        ...fallbackSeedPosts[idx],
        slug,
        title,
        summary,
        content,
        tags,
        is_published,
        is_ai_generated,
        updated_at: new Date().toISOString(),
      };
    }
  } else {
    // Create new
    if (c.env?.DB) {
      try {
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
      } catch (err) {
        console.error("D1 createPost failed:", err);
      }
    }

    fallbackSeedPosts.unshift({
      id: Date.now(),
      slug,
      title,
      summary,
      content,
      tags,
      is_published,
      is_ai_generated,
      views: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  return c.redirect("/admin");
});

app.post("/admin/posts/delete", async (c) => {
  if (!(await isAuthorized(c))) {
    return c.redirect("/admin/login");
  }

  const body = await c.req.parseBody();
  const slug = body.slug as string;

  if (c.env?.DB) {
    try {
      await deletePost(c.env.DB, slug);
    } catch (err) {
      console.warn("D1 deletePost failed:", err);
    }
  } else {
    fallbackSeedPosts = fallbackSeedPosts.filter((p) => p.slug !== slug);
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

  if (c.env?.DB) {
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
    } catch (err) {
      console.warn("D1 createPost API failed:", err);
    }
  } else {
    fallbackSeedPosts.unshift({
      id: Date.now(),
      slug,
      title,
      summary,
      content,
      tags,
      is_published,
      is_ai_generated,
      views: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  return c.json({ success: true, slug }, 201);
});

app.put("/api/posts/:slug", async (c) => {
  if (!(await isAuthorized(c))) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const slug = c.req.param("slug");
  const body = await c.req.json();

  if (c.env?.DB) {
    try {
      await updatePost(c.env.DB, slug, body);
    } catch (err) {
      console.warn("D1 updatePost API failed:", err);
    }
  } else {
    const idx = fallbackSeedPosts.findIndex((p) => p.slug === slug);
    if (idx !== -1) {
      fallbackSeedPosts[idx] = {
        ...fallbackSeedPosts[idx],
        ...body,
        updated_at: new Date().toISOString(),
      };
    }
  }

  return c.json({ success: true, slug });
});

app.delete("/api/posts/:slug", async (c) => {
  if (!(await isAuthorized(c))) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const slug = c.req.param("slug");

  if (c.env?.DB) {
    try {
      await deletePost(c.env.DB, slug);
    } catch (err) {
      console.warn("D1 deletePost API failed:", err);
    }
  } else {
    fallbackSeedPosts = fallbackSeedPosts.filter((p) => p.slug !== slug);
  }

  return c.json({ success: true, deleted: slug });
});

export default app;
