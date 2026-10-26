export interface Post {
  id: number;
  slug: string;
  title: string;
  summary: string;
  content: string;
  tags: string[];
  is_published: number;
  is_ai_generated: number;
  views: number;
  created_at: string;
  updated_at: string;
}

export interface RawPostRow {
  id: number;
  slug: string;
  title: string;
  summary: string;
  content: string;
  tags: string;
  is_published: number;
  is_ai_generated?: number;
  views: number;
  created_at: string;
  updated_at: string;
}

export interface AdminUser {
  id: number;
  username: string;
  password_hash: string;
  created_at: string;
}

export interface PostRevision {
  id: number;
  post_slug: string;
  updated_at: string;
  note: string;
}

function parsePostRow(row: RawPostRow): Post {
  let parsedTags: string[] = [];
  try {
    parsedTags = JSON.parse(row.tags);
  } catch {
    parsedTags = row.tags ? row.tags.split(",").map((s) => s.trim()) : [];
  }

  return {
    ...row,
    tags: Array.isArray(parsedTags) ? parsedTags : [],
    is_ai_generated: Number(row.is_ai_generated || 0),
  };
}

export const DEFAULT_POST_SLUG = "edge-native-hono-d1-architecture";
export const DEFAULT_POST_TITLE = "從 Next.js 遷移至 Cloudflare Workers + Hono Edge SSR + D1 的極速架構實踐";
export const DEFAULT_POST_SUMMARY = "分享如何徹底摒棄肥大的客戶端運行時，改採 Cloudflare Workers 搭配 Hono Edge SSR 與 D1 分散式資料庫，實現毫秒級首屏渲染與 100/100 完整 SEO。";
export const DEFAULT_POST_CONTENT = `## 為什麼需要邊緣原生 (Edge-Native)？

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

export async function ensureSchema(db: D1Database): Promise<void> {
  // 1. Create posts table if not exists
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        slug TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL,
        summary TEXT NOT NULL,
        content TEXT NOT NULL,
        tags TEXT NOT NULL DEFAULT '[]',
        is_published INTEGER NOT NULL DEFAULT 1,
        is_ai_generated INTEGER NOT NULL DEFAULT 0,
        views INTEGER NOT NULL DEFAULT 0,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`
    )
    .run();

  // 2. Create posts indexes
  try {
    await db.prepare("CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts (slug)").run();
    await db.prepare("CREATE INDEX IF NOT EXISTS idx_posts_published_created ON posts (is_published, created_at DESC)").run();
  } catch (err) {
    console.warn("Index creation warning:", err);
  }

  // 3. Create post_revisions table and index
  try {
    await db
      .prepare(
        `CREATE TABLE IF NOT EXISTS post_revisions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          post_slug TEXT NOT NULL,
          updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          note TEXT NOT NULL DEFAULT '內容更新'
        )`
      )
      .run();
    await db.prepare("CREATE INDEX IF NOT EXISTS idx_revisions_slug ON post_revisions (post_slug, updated_at DESC)").run();
  } catch (err) {
    console.warn("Revisions table creation warning:", err);
  }

  // 4. Ensure is_ai_generated column exists in posts table (if table was created before)
  try {
    const tableInfo = await db.prepare("PRAGMA table_info(posts)").all<{ name: string }>();
    const hasAiCol = (tableInfo.results || []).some((col) => col.name === "is_ai_generated");
    if (!hasAiCol) {
      await db.prepare("ALTER TABLE posts ADD COLUMN is_ai_generated INTEGER NOT NULL DEFAULT 0").run();
    }
  } catch (err) {
    console.warn("PRAGMA table_info or ALTER TABLE warning:", err);
  }

  // 5. Seed default article if posts table is empty
  try {
    const countRes = await db.prepare("SELECT COUNT(*) as count FROM posts").first<{ count: number }>();
    if (!countRes || Number(countRes.count) === 0) {
      await db
        .prepare(
          `INSERT INTO posts (slug, title, summary, content, tags, is_published, is_ai_generated, views, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, 1, 0, 42, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
        )
        .bind(
          DEFAULT_POST_SLUG,
          DEFAULT_POST_TITLE,
          DEFAULT_POST_SUMMARY,
          DEFAULT_POST_CONTENT,
          JSON.stringify(["Architecture", "Cloudflare", "Hono", "Edge Computing"])
        )
        .run();
    }
  } catch (err) {
    console.warn("Seed post warning:", err);
  }
}

export async function getPublishedPosts(db: D1Database): Promise<Post[]> {
  const result = await db
    .prepare("SELECT * FROM posts WHERE is_published = 1 ORDER BY created_at DESC")
    .all<RawPostRow>();

  return (result.results || []).map(parsePostRow);
}

export async function getPublishedPostsCount(db: D1Database): Promise<number> {
  const result = await db
    .prepare("SELECT COUNT(*) as count FROM posts WHERE is_published = 1")
    .first<{ count: number }>();

  return Number(result?.count || 0);
}

export async function getAllPostsAdmin(db: D1Database): Promise<Post[]> {
  const result = await db
    .prepare("SELECT * FROM posts ORDER BY created_at DESC")
    .all<RawPostRow>();

  return (result.results || []).map(parsePostRow);
}

export async function getPostBySlug(db: D1Database, slug: string): Promise<Post | null> {
  const row = await db
    .prepare("SELECT * FROM posts WHERE slug = ?")
    .bind(slug)
    .first<RawPostRow>();

  if (!row) return null;
  return parsePostRow(row);
}

export async function getPostsByTag(db: D1Database, tag: string): Promise<Post[]> {
  // Use json_each or LIKE parameterized query for tag filtering
  const result = await db
    .prepare("SELECT * FROM posts WHERE is_published = 1 AND tags LIKE ? ORDER BY created_at DESC")
    .bind(`%"${tag}"%`)
    .all<RawPostRow>();

  return (result.results || []).map(parsePostRow);
}

export async function getAllTags(db: D1Database): Promise<{ tag: string; count: number }[]> {
  const posts = await getPublishedPosts(db);
  const tagCounts = new Map<string, number>();

  for (const post of posts) {
    for (const tag of post.tags) {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    }
  }

  return Array.from(tagCounts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}

export async function incrementPostViews(db: D1Database, slug: string): Promise<void> {
  await db
    .prepare("UPDATE posts SET views = views + 1 WHERE slug = ?")
    .bind(slug)
    .run();
}

export async function getPostRevisions(
  db: D1Database,
  slug: string
): Promise<PostRevision[]> {
  try {
    const result = await db
      .prepare(
        "SELECT * FROM post_revisions WHERE post_slug = ? ORDER BY updated_at DESC"
      )
      .bind(slug)
      .all<PostRevision>();

    return result.results || [];
  } catch {
    return [];
  }
}

export async function addPostRevision(
  db: D1Database,
  slug: string,
  note = "內容更新"
): Promise<void> {
  try {
    await db
      .prepare(
        "INSERT INTO post_revisions (post_slug, updated_at, note) VALUES (?, CURRENT_TIMESTAMP, ?)"
      )
      .bind(slug, note)
      .run();
  } catch {
    // Ignore if table not created yet
  }
}

export async function createPost(
  db: D1Database,
  data: {
    slug: string;
    title: string;
    summary: string;
    content: string;
    tags: string[];
    is_published?: number;
    is_ai_generated?: number;
    revisionNote?: string;
  }
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO posts (slug, title, summary, content, tags, is_published, is_ai_generated, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`
    )
    .bind(
      data.slug,
      data.title,
      data.summary,
      data.content,
      JSON.stringify(data.tags),
      data.is_published ?? 1,
      data.is_ai_generated ?? 0
    )
    .run();

  await addPostRevision(db, data.slug, data.revisionNote || "初版發布");
}

export async function updatePost(
  db: D1Database,
  slug: string,
  data: {
    title?: string;
    summary?: string;
    content?: string;
    tags?: string[];
    is_published?: number;
    is_ai_generated?: number;
    revisionNote?: string;
  }
): Promise<void> {
  const updates: string[] = ["updated_at = CURRENT_TIMESTAMP"];
  const values: any[] = [];

  if (data.title !== undefined) {
    updates.push("title = ?");
    values.push(data.title);
  }
  if (data.summary !== undefined) {
    updates.push("summary = ?");
    values.push(data.summary);
  }
  if (data.content !== undefined) {
    updates.push("content = ?");
    values.push(data.content);
  }
  if (data.tags !== undefined) {
    updates.push("tags = ?");
    values.push(JSON.stringify(data.tags));
  }
  if (data.is_published !== undefined) {
    updates.push("is_published = ?");
    values.push(data.is_published);
  }
  if (data.is_ai_generated !== undefined) {
    updates.push("is_ai_generated = ?");
    values.push(data.is_ai_generated);
  }

  values.push(slug);

  await db
    .prepare(`UPDATE posts SET ${updates.join(", ")} WHERE slug = ?`)
    .bind(...values)
    .run();

  await addPostRevision(db, slug, data.revisionNote || "內容更新");
}

export async function deletePost(db: D1Database, slug: string): Promise<void> {
  await db
    .prepare("DELETE FROM posts WHERE slug = ?")
    .bind(slug)
    .run();
}

export async function getAdminUser(db: D1Database, username: string): Promise<AdminUser | null> {
  return await db
    .prepare("SELECT * FROM admin_users WHERE username = ?")
    .bind(username)
    .first<AdminUser>();
}

export async function createAdminUser(
  db: D1Database,
  username: string,
  passwordHash: string
): Promise<void> {
  await db
    .prepare("INSERT INTO admin_users (username, password_hash) VALUES (?, ?)")
    .bind(username, passwordHash)
    .run();
}
