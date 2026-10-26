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
  getAllPostsAdmin,
  getPostBySlug,
  getPostsByTag,
  getAllTags,
  createPost,
  updatePost,
  deletePost,
  incrementPostViews,
  Post,
} from "./lib/db";
import { extractTocAndParseMarkdown } from "./lib/markdown";
import { createSessionToken, verifySessionToken } from "./lib/auth";
import translations from "./lib/i18n.json";

export interface Env {
  DB?: D1Database;
  ADMIN_PASSWORD?: string;
  AUTH_SECRET?: string;
}

const app = new Hono<{ Bindings: Env }>();

// Seed fallback in memory for test runner environments where D1 is mock-injected or optional
let fallbackSeedPosts: Post[] = [
  {
    id: 1,
    slug: "edge-native-hono-d1-architecture",
    title: "從 Next.js 遷移至 Cloudflare Workers + Hono Edge SSR + D1 的極速架構實踐",
    summary:
      "分享如何徹底摒棄肥大的客戶端運行時，改採 Cloudflare Workers 搭配 Hono Edge SSR 與 D1 分散式資料庫，實現毫秒級首屏渲染與 100/100 完整 SEO。",
    content: `## 為什麼需要邊緣原生 (Edge-Native)？

在現代 Web 開發中，傳統全端框架往往夾帶龐大的客戶端 JavaScript runtime 與複雜的水合 (Hydration) 機制。當我們的目標是追求極致的效能、100/100 的 SEO 表現以及極低的邊緣延遲時，**Edge-Native Architecture** 成為了最佳解法。

### 核心技術選型
1. **Cloudflare Workers (V8 Isolates)**：全球超過 300+ 邊緣節點，毫秒級就近回應。
2. **Hono + Hono JSX**：極簡零客戶端開銷的 JSX SSR 引擎，在 Edge 端直接輸出純粹語義化 HTML。
3. **Cloudflare D1**：邊緣原生 SQLite，具備低延遲讀取與強一致性。
4. **Tailwind CSS v4 AOT**：預先編譯並透過 Cloudflare Workers Static Assets 全球快取。

\`\`\`typescript
import { Hono } from 'hono';

const app = new Hono();
app.get('/', (c) => c.text('Hello from the Edge!'));
export default app;
\`\`\`

隨時可以在後台直接以 Markdown 發布新文章，無需漫長的 CI/CD 構建，資料立即可見！`,
    tags: ["Architecture", "Cloudflare", "Hono", "Edge Computing"],
    is_published: 1,
    views: 42,
    created_at: "2026-10-26 12:00:00",
    updated_at: "2026-10-26 12:00:00",
  },
];

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

  return c.html(<LandingPage locale={locale} t={t} url={c.req.url} />);
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

  if (c.env?.DB) {
    posts = tag
      ? await getPostsByTag(c.env.DB, tag)
      : await getPublishedPosts(c.env.DB);
    tags = await getAllTags(c.env.DB);
  } else {
    posts = tag
      ? fallbackSeedPosts.filter((p) => p.is_published === 1 && p.tags.includes(tag))
      : fallbackSeedPosts.filter((p) => p.is_published === 1);
    const tagMap = new Map<string, number>();
    for (const p of fallbackSeedPosts.filter((p) => p.is_published === 1)) {
      for (const itemTag of p.tags) tagMap.set(itemTag, (tagMap.get(itemTag) || 0) + 1);
    }
    tags = Array.from(tagMap.entries()).map(([tName, count]) => ({ tag: tName, count }));
  }

  return c.html(
    <BlogIndexPage
      posts={posts}
      tags={tags}
      currentTag={tag}
      locale={locale}
      t={t}
      url={c.req.url}
    />
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
    post = await getPostBySlug(c.env.DB, slug);
  } else {
    post = fallbackSeedPosts.find((p) => p.slug === slug) || null;
  }

  if (!post || post.is_published === 0) {
    return c.html(<NotFoundPage locale={locale} t={t} url={c.req.url} />, 404);
  }

  // Increment views asynchronously
  if (c.env?.DB) {
    const updateViewsPromise = incrementPostViews(c.env.DB, slug);
    if (c.executionCtx?.waitUntil) {
      c.executionCtx.waitUntil(updateViewsPromise);
    } else {
      await updateViewsPromise;
    }
  } else {
    post.views += 1;
  }

  const { html, toc } = extractTocAndParseMarkdown(post.content);

  return c.html(
    <ArticleReaderPage
      post={post}
      html={html}
      toc={toc}
      locale={locale}
      t={t}
      url={c.req.url}
    />
  );
});

/* =========================================================
   ADMIN WORKSPACE & AUTHENTICATION
   ========================================================= */

app.get("/admin/login", (c) => {
  return c.html(<AdminLoginPage />);
});

app.post("/admin/login", async (c) => {
  const body = await c.req.parseBody();
  const password = body.password as string;

  if (password === getAdminPassword(c.env)) {
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

  return c.html(<AdminLoginPage error="帳號或密碼錯誤，請重新輸入。" />, 401);
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
    posts = await getAllPostsAdmin(c.env.DB);
  } else {
    posts = fallbackSeedPosts;
  }

  return c.html(<AdminDashboardPage posts={posts} />);
});

app.get("/admin/editor", async (c) => {
  if (!(await isAuthorized(c))) {
    return c.redirect("/admin/login");
  }

  const slug = c.req.query("slug");
  let post: Post | null = null;
  if (slug) {
    if (c.env?.DB) {
      post = await getPostBySlug(c.env.DB, slug);
    } else {
      post = fallbackSeedPosts.find((p) => p.slug === slug) || null;
    }
  }

  return c.html(<AdminEditorPage post={post} />);
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

  if (originalSlug) {
    // Update existing
    if (c.env?.DB) {
      await updatePost(c.env.DB, originalSlug, {
        title,
        summary,
        content,
        tags,
        is_published,
      });
    } else {
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
          updated_at: new Date().toISOString(),
        };
      }
    }
  } else {
    // Create new
    if (c.env?.DB) {
      await createPost(c.env.DB, {
        slug,
        title,
        summary,
        content,
        tags,
        is_published,
      });
    } else {
      fallbackSeedPosts.unshift({
        id: Date.now(),
        slug,
        title,
        summary,
        content,
        tags,
        is_published,
        views: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
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
    await deletePost(c.env.DB, slug);
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
  const { slug, title, summary, content, tags = [], is_published = 1 } = body;

  if (!slug || !title || !summary || !content) {
    return c.json({ error: "Missing required fields" }, 400);
  }

  if (c.env?.DB) {
    await createPost(c.env.DB, { slug, title, summary, content, tags, is_published });
  } else {
    fallbackSeedPosts.unshift({
      id: Date.now(),
      slug,
      title,
      summary,
      content,
      tags,
      is_published,
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
    await updatePost(c.env.DB, slug, body);
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
    await deletePost(c.env.DB, slug);
  } else {
    fallbackSeedPosts = fallbackSeedPosts.filter((p) => p.slug !== slug);
  }

  return c.json({ success: true, deleted: slug });
});

export default app;
