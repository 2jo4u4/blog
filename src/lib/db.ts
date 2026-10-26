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

export async function ensureSchema(db: D1Database): Promise<void> {
  try {
    await db.exec(`
      CREATE TABLE IF NOT EXISTS posts (
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
      );
      CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts (slug);
      CREATE INDEX IF NOT EXISTS idx_posts_published_created ON posts (is_published, created_at DESC);

      CREATE TABLE IF NOT EXISTS post_revisions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        post_slug TEXT NOT NULL,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        note TEXT NOT NULL DEFAULT '內容更新'
      );
      CREATE INDEX IF NOT EXISTS idx_revisions_slug ON post_revisions (post_slug, updated_at DESC);
    `);
  } catch (err) {
    console.warn("ensureSchema initial exec warning:", err);
  }

  // Ensure is_ai_generated column exists even if table was created previously without it
  try {
    await db.exec(
      "ALTER TABLE posts ADD COLUMN is_ai_generated INTEGER NOT NULL DEFAULT 0;"
    );
  } catch {
    // Column already exists, safe to ignore
  }
}

export async function getPublishedPosts(db: D1Database): Promise<Post[]> {
  const result = await db
    .prepare("SELECT * FROM posts WHERE is_published = 1 ORDER BY created_at DESC")
    .all<RawPostRow>();

  return (result.results || []).map(parsePostRow);
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
