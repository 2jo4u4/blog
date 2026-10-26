import { RawPostRow, AdminUser } from "../../src/lib/db";

export const MOCK_SEED_SLUG = "edge-native-hono-d1-architecture";
export const MOCK_SEED_TITLE = "從 Next.js 遷移至 Cloudflare Workers + Hono Edge SSR + D1 的極速架構實踐";
export const MOCK_SEED_SUMMARY = "分享如何徹底摒棄肥大的客戶端運行時，改採 Cloudflare Workers 搭配 Hono Edge SSR 與 D1 分散式資料庫，實現毫秒級首屏渲染與 100/100 完整 SEO。";
export const MOCK_SEED_CONTENT = `## 為什麼需要邊緣原生 (Edge-Native)？

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

隨時可以在後台直接以 Markdown 發布新文章，無需漫長的 CI/CD 構建，資料立即可見！`;

export class MockD1Database implements Partial<D1Database> {
  public posts: RawPostRow[] = [];
  public users: AdminUser[] = [];
  public revisions: any[] = [];
  private nextId = 1;

  constructor() {
    this.reset();
  }

  reset() {
    this.posts = [
      {
        id: 1,
        slug: MOCK_SEED_SLUG,
        title: MOCK_SEED_TITLE,
        summary: MOCK_SEED_SUMMARY,
        content: MOCK_SEED_CONTENT,
        tags: '["Architecture", "Cloudflare", "Hono", "Edge Computing"]',
        is_published: 1,
        is_ai_generated: 0,
        views: 10,
        created_at: "2026-10-26 12:00:00",
        updated_at: "2026-10-26 12:00:00",
      },
    ];
    this.users = [
      {
        id: 1,
        username: "test_admin",
        password_hash: "67dafc9ecaa7d08d35bc0ab67dde6ac29aec6faf70c17266be868f097d262dc1",
        created_at: "2026-10-26 12:00:00",
      },
    ];
    this.revisions = [
      {
        id: 1,
        post_slug: MOCK_SEED_SLUG,
        updated_at: "2026-10-26 12:00:00",
        note: "初版發布",
      },
    ];
    this.nextId = 2;
  }

  async exec(query: string): Promise<D1ExecResult> {
    return { count: 0, duration: 0 };
  }

  prepare(query: string): D1PreparedStatement {
    const db = this;
    let boundArgs: any[] = [];

    const stmt: Partial<D1PreparedStatement> = {
      bind(...values: any[]) {
        boundArgs = values;
        return stmt as D1PreparedStatement;
      },
      async first<T = unknown>(colName?: string): Promise<T | null> {
        if (query.includes("COUNT(*) as count FROM posts WHERE is_published = 1")) {
          const count = db.posts.filter((p) => p.is_published === 1).length;
          return { count } as unknown as T;
        }
        if (query.includes("COUNT(*) as count FROM posts")) {
          return { count: db.posts.length } as unknown as T;
        }
        if (query.includes("FROM posts WHERE slug = ?")) {
          const slug = boundArgs[0];
          const post = db.posts.find((p) => p.slug === slug);
          return (post || null) as unknown as T;
        }
        if (query.includes("FROM admin_users WHERE username = ?")) {
          const username = boundArgs[0];
          const user = db.users.find((u) => u.username === username);
          return (user || null) as unknown as T;
        }
        return null;
      },
      async all<T = unknown>(): Promise<D1Result<T>> {
        if (query.includes("PRAGMA table_info(posts)")) {
          return {
            results: [
              { name: "id" },
              { name: "slug" },
              { name: "title" },
              { name: "summary" },
              { name: "content" },
              { name: "tags" },
              { name: "is_published" },
              { name: "is_ai_generated" },
              { name: "views" },
              { name: "created_at" },
              { name: "updated_at" },
            ] as unknown as T[],
            success: true,
            meta: {} as any,
          };
        }
        if (query.includes("SELECT * FROM post_revisions WHERE post_slug = ?")) {
          const slug = boundArgs[0];
          const revs = db.revisions.filter((r) => r.post_slug === slug);
          return { results: revs as unknown as T[], success: true, meta: {} as any };
        }
        if (query.includes("FROM posts WHERE is_published = 1 AND tags LIKE ?")) {
          const rawPattern = boundArgs[0] as string; // %"tag"%
          const tag = rawPattern.replace(/%/g, "").replace(/"/g, "");
          const filtered = db.posts.filter(
            (p) => p.is_published === 1 && p.tags.includes(`"${tag}"`)
          );
          return {
            results: filtered as unknown as T[],
            success: true,
            meta: {} as any,
          };
        }
        if (query.includes("FROM posts WHERE is_published = 1")) {
          const published = db.posts.filter((p) => p.is_published === 1);
          return {
            results: published as unknown as T[],
            success: true,
            meta: {} as any,
          };
        }
        if (query.includes("FROM posts ORDER BY created_at DESC")) {
          return {
            results: db.posts as unknown as T[],
            success: true,
            meta: {} as any,
          };
        }
        return { results: [], success: true, meta: {} as any };
      },
      async run(): Promise<any> {
        if (query.includes("UPDATE posts SET views = views + 1 WHERE slug = ?")) {
          const slug = boundArgs[0];
          const post = db.posts.find((p) => p.slug === slug);
          if (post) post.views += 1;
        } else if (query.includes("INSERT INTO posts")) {
          const [slug, title, summary, content, tags, is_published, is_ai_generated] = boundArgs;
          db.posts.push({
            id: db.nextId++,
            slug,
            title,
            summary,
            content,
            tags,
            is_published: is_published ?? 1,
            is_ai_generated: is_ai_generated || 0,
            views: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        } else if (query.includes("UPDATE posts SET")) {
          const slug = boundArgs[boundArgs.length - 1];
          const post = db.posts.find((p) => p.slug === slug);
          if (post) {
            if (query.includes("title = ?")) post.title = boundArgs[0];
            if (query.includes("is_ai_generated = ?")) {
              const aiIdx = boundArgs.length - 2;
              post.is_ai_generated = boundArgs[aiIdx];
            }
          }
        } else if (query.includes("DELETE FROM posts WHERE slug = ?")) {
          const slug = boundArgs[0];
          db.posts = db.posts.filter((p) => p.slug !== slug);
        } else if (query.includes("INSERT INTO admin_users")) {
          const [username, password_hash] = boundArgs;
          db.users.push({
            id: db.nextId++,
            username,
            password_hash,
            created_at: new Date().toISOString(),
          });
        } else if (query.includes("INSERT INTO post_revisions")) {
          const [slug, note] = boundArgs;
          db.revisions.push({
            id: db.revisions.length + 1,
            post_slug: slug,
            updated_at: new Date().toISOString(),
            note,
          });
        }
        return { results: [], success: true, meta: {} as any } as any;
      },
    };

    return stmt as D1PreparedStatement;
  }
}
