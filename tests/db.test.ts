import { describe, it, expect, beforeEach } from "vitest";
import {
  getPublishedPosts,
  getPostBySlug,
  getPostsByTag,
  getAllTags,
  createPost,
  updatePost,
  deletePost,
  incrementPostViews,
  createAdminUser,
  getAdminUser,
  RawPostRow,
  AdminUser,
} from "../src/lib/db";

// In-memory mock implementing D1Database interface for unit testing parameterized queries
class MockD1Database implements Partial<D1Database> {
  public posts: RawPostRow[] = [];
  public users: AdminUser[] = [];
  private nextId = 1;

  constructor() {
    this.reset();
  }

  reset() {
    this.posts = [
      {
        id: 1,
        slug: "edge-native-hono-d1-architecture",
        title: "從 Next.js 遷移至 Cloudflare Workers + Hono Edge SSR + D1 的極速架構實踐",
        summary: "分享如何徹底摒棄肥大的客戶端運行時...",
        content: "## 為什麼需要邊緣原生...",
        tags: '["Architecture", "Cloudflare", "Hono"]',
        is_published: 1,
        views: 10,
        created_at: "2026-10-26 12:00:00",
        updated_at: "2026-10-26 12:00:00",
      },
      {
        id: 2,
        slug: "draft-article",
        title: "草稿文章",
        summary: "未發布的筆記",
        content: "草稿內容",
        tags: '["Draft"]',
        is_published: 0,
        views: 0,
        created_at: "2026-10-26 13:00:00",
        updated_at: "2026-10-26 13:00:00",
      },
    ];
    this.users = [];
    this.nextId = 3;
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
            is_published,
            is_ai_generated: is_ai_generated || 0,
            views: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        } else if (query.includes("UPDATE posts SET")) {
          const slug = boundArgs[boundArgs.length - 1];
          const post = db.posts.find((p) => p.slug === slug);
          if (post) {
            // Simplified update handler
            if (query.includes("title = ?")) post.title = boundArgs[0];
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
        }
        return { results: [], success: true, meta: {} as any } as any;
      },
    };

    return stmt as D1PreparedStatement;
  }
}

describe("D1 Database Query Operations", () => {
  let db: D1Database;

  beforeEach(() => {
    db = new MockD1Database() as unknown as D1Database;
  });

  it("fetches published posts and parses tags", async () => {
    const posts = await getPublishedPosts(db);
    expect(posts).toHaveLength(1);
    expect(posts[0].slug).toBe("edge-native-hono-d1-architecture");
    expect(posts[0].tags).toEqual(["Architecture", "Cloudflare", "Hono"]);
  });

  it("fetches post by slug", async () => {
    const post = await getPostBySlug(db, "edge-native-hono-d1-architecture");
    expect(post).not.toBeNull();
    expect(post?.title).toContain("從 Next.js 遷移至 Cloudflare Workers");

    const nonExistent = await getPostBySlug(db, "unknown-slug");
    expect(nonExistent).toBeNull();
  });

  it("filters posts by tag", async () => {
    const results = await getPostsByTag(db, "Cloudflare");
    expect(results).toHaveLength(1);

    const empty = await getPostsByTag(db, "NonExistentTag");
    expect(empty).toHaveLength(0);
  });

  it("aggregates all tags and counts", async () => {
    const tags = await getAllTags(db);
    expect(tags).toEqual([
      { tag: "Architecture", count: 1 },
      { tag: "Cloudflare", count: 1 },
      { tag: "Hono", count: 1 },
    ]);
  });

  it("increments post views safely", async () => {
    await incrementPostViews(db, "edge-native-hono-d1-architecture");
    const post = await getPostBySlug(db, "edge-native-hono-d1-architecture");
    expect(post?.views).toBe(11);
  });

  it("creates, updates, and deletes posts", async () => {
    await createPost(db, {
      slug: "new-tech-post",
      title: "New Post",
      summary: "Summary",
      content: "Content",
      tags: ["TypeScript", "Vitest"],
    });

    let post = await getPostBySlug(db, "new-tech-post");
    expect(post?.title).toBe("New Post");

    await updatePost(db, "new-tech-post", { title: "Updated Title" });
    post = await getPostBySlug(db, "new-tech-post");
    expect(post?.title).toBe("Updated Title");

    await deletePost(db, "new-tech-post");
    post = await getPostBySlug(db, "new-tech-post");
    expect(post).toBeNull();
  });

  it("manages admin users", async () => {
    await createAdminUser(db, "admin", "hashed_secret");
    const user = await getAdminUser(db, "admin");
    expect(user).not.toBeNull();
    expect(user?.username).toBe("admin");
    expect(user?.password_hash).toBe("hashed_secret");
  });
});
