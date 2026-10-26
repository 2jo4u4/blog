import { Hono } from "hono";
import { getCookie } from "hono/cookie";
import { LandingPage } from "./components/LandingPage";
import { BlogIndexPage } from "./components/BlogIndexPage";
import { getPublishedPosts, getPostsByTag, getAllTags, Post } from "./lib/db";
import translations from "./lib/i18n.json";

export interface Env {
  DB?: D1Database;
}

const app = new Hono<{ Bindings: Env }>();

// Seed fallback in memory for test runner environments where D1 is mock-injected or optional
const fallbackSeedPosts: Post[] = [
  {
    id: 1,
    slug: "edge-native-hono-d1-architecture",
    title: "從 Next.js 遷移至 Cloudflare Workers + Hono Edge SSR + D1 的極速架構實踐",
    summary:
      "分享如何徹底摒棄肥大的客戶端運行時，改採 Cloudflare Workers 搭配 Hono Edge SSR 與 D1 分散式資料庫，實現毫秒級首屏渲染與 100/100 完整 SEO。",
    content: "## 為什麼需要邊緣原生...",
    tags: ["Architecture", "Cloudflare", "Hono", "Edge Computing"],
    is_published: 1,
    views: 42,
    created_at: "2026-10-26 12:00:00",
    updated_at: "2026-10-26 12:00:00",
  },
];

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
      ? fallbackSeedPosts.filter((p) => p.tags.includes(tag))
      : fallbackSeedPosts;
    const tagMap = new Map<string, number>();
    for (const p of fallbackSeedPosts) {
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

export default app;
