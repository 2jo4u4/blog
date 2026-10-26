-- Migration: 0002_post_revisions.sql
CREATE TABLE IF NOT EXISTS post_revisions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_slug TEXT NOT NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  note TEXT NOT NULL DEFAULT '內容更新'
);

CREATE INDEX IF NOT EXISTS idx_revisions_slug ON post_revisions (post_slug, updated_at DESC);

-- Seed initial revision for existing posts
INSERT INTO post_revisions (post_slug, updated_at, note)
SELECT slug, created_at, '初版發布' FROM posts;
