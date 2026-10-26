-- Migration: 0001_initial.sql
-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT NOT NULL DEFAULT '[]',
  is_published INTEGER NOT NULL DEFAULT 1,
  views INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts (slug);
CREATE INDEX IF NOT EXISTS idx_posts_published_created ON posts (is_published, created_at DESC);

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Seed initial welcome article
INSERT OR IGNORE INTO posts (slug, title, summary, content, tags, is_published, views)
VALUES (
  'edge-native-hono-d1-architecture',
  '從 Next.js 遷移至 Cloudflare Workers + Hono Edge SSR + D1 的極速架構實踐',
  '分享如何徹底摒棄肥大的客戶端運行時，改採 Cloudflare Workers 搭配 Hono Edge SSR 與 D1 分散式資料庫，實現毫秒級首屏渲染與 100/100 完整 SEO。',
  '## 為什麼需要邊緣原生 (Edge-Native)？

在現代 Web 開發中，傳統全端框架往往夾帶龐大的客戶端 JavaScript runtime 與複雜的水合 (Hydration) 機制。當我們的目標是追求極致的效能、100/100 的 SEO 表現以及極低的邊緣延遲時，**Edge-Native Architecture** 成為了最佳解法。

### 核心技術選型
1. **Cloudflare Workers (V8 Isolates)**：全球超過 300+ 邊緣節點，毫秒級就近回應。
2. **Hono + Hono JSX**：極簡零客戶端開銷的 JSX SSR 引擎，在 Edge 端直接輸出純粹語義化 HTML。
3. **Cloudflare D1**：邊緣原生 SQLite，具備低延遲讀取與強一致性。
4. **Tailwind CSS v4 AOT**：預先編譯並透過 Cloudflare Workers Static Assets 全球快取。

隨時可以在後台直接以 Markdown 發布新文章，無需漫長的 CI/CD 構建，資料立即可見！',
  '["Architecture", "Cloudflare", "Hono", "Edge Computing"]',
  1,
  1
);
