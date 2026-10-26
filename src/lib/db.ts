export interface Post {
  id: number;
  slug: string;
  title: string;
  summary: string;
  content: string;
  tags: string[];
  is_published: number;
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
  };
}

export async function getPublishedPosts(db: D1Database): Promise<Post[]> {
  const result = await db
    .prepare("SELECT * FROM posts WHERE is_published = 1 ORDER BY created_at DESC")
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

export async function createPost(
  db: D1Database,
  data: {
    slug: string;
    title: string;
    summary: string;
    content: string;
    tags: string[];
    is_published?: number;
  }
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO posts (slug, title, summary, content, tags, is_published, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`
    )
    .bind(
      data.slug,
      data.title,
      data.summary,
      data.content,
      JSON.stringify(data.tags),
      data.is_published ?? 1
    )
    .run();
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

  values.push(slug);

  await db
    .prepare(`UPDATE posts SET ${updates.join(", ")} WHERE slug = ?`)
    .bind(...values)
    .run();
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
