import { Hono } from "hono";
import { getCookie } from "hono/cookie";
import { LandingPage } from "./components/LandingPage";
import { BlogIndexPage } from "./components/BlogIndexPage";
import { ArticleReaderPage } from "./components/ArticleReaderPage";
import { NotFoundPage } from "./components/NotFoundPage";
import {
  getPublishedPosts,
  getPostBySlug,
  getPostsByTag,
  getAllTags,
  incrementPostViews,
  Post,
} from "./lib/db";
import { extractTocAndParseMarkdown } from "./lib/markdown";
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

export default app;
