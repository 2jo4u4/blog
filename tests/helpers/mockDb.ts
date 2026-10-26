import {
  RawPostRow,
  AdminUser,
  DEFAULT_POST_SLUG,
  DEFAULT_POST_TITLE,
  DEFAULT_POST_SUMMARY,
  DEFAULT_POST_CONTENT,
} from "../../src/lib/db";

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
        slug: DEFAULT_POST_SLUG,
        title: DEFAULT_POST_TITLE,
        summary: DEFAULT_POST_SUMMARY,
        content: DEFAULT_POST_CONTENT,
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
        username: "huangjay_is_admin",
        password_hash: "8afdd9bdf9cff0505fe36b1e36b5587259db7e84d5b87aafc14cbb39f0de04b1",
        created_at: "2026-10-26 12:00:00",
      },
    ];
    this.revisions = [
      {
        id: 1,
        post_slug: DEFAULT_POST_SLUG,
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
