import { Terminal, ArrowRight, Calendar, Sparkles, Bot } from "../Icons";
import type { Post } from "../../lib/db";
import { formatTaipeiDateTime, toTaipeiISO } from "../../lib/date";

export interface AdminEditorPageProps {
  post?: Post | null;
  error?: string;
}

export function AdminEditorPage({ post, error }: AdminEditorPageProps) {
  const isEditing = !!post;
  const initialTags = post ? post.tags.join(", ") : "";

  return (
    <html lang="zh" class="dark">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{isEditing ? `Edit: ${post.title}` : "New Article"} | Admin Editor</title>
        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body className="min-h-screen p-4 sm:p-8">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b theme-border">
            <div className="flex items-center gap-3">
              <a
                href="/admin"
                className="p-2 rounded-xl theme-surface border theme-border hover:text-cyan-500 transition-colors"
              >
                ←
              </a>
              <div>
                <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                  {isEditing ? "Edit Article" : "Create New Article"}
                </h1>
                <p className="text-xs theme-text-secondary">
                  {isEditing ? `正在編輯：${post.slug}` : "即時發布至 Cloudflare D1 邊緣分散式資料庫"}
                </p>
              </div>
            </div>

            {isEditing && (
              <div className="flex flex-wrap items-center gap-3 text-xs font-mono theme-text-secondary">
                <div className="flex items-center gap-1 text-cyan-500">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    發布：
                    <time dateTime={toTaipeiISO(post.created_at)} data-local-format="datetime">
                      {formatTaipeiDateTime(post.created_at)}
                    </time>
                  </span>
                </div>
                <span>•</span>
                <span>
                  更新：
                  <time dateTime={toTaipeiISO(post.updated_at)} data-local-format="datetime">
                    {formatTaipeiDateTime(post.updated_at)}
                  </time>
                </span>
              </div>
            )}

            <a
              href="/admin"
              className="text-xs font-mono theme-text-secondary hover:text-cyan-500 transition-colors"
            >
              Cancel & Return
            </a>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono">
              {error}
            </div>
          )}

          {/* Form */}
          <form action="/admin/posts" method="post" className="space-y-6">
            {isEditing && <input type="hidden" name="original_slug" value={post.slug} />}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-medium theme-text-secondary mb-1">
                  Title (文章標題) *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  value={post?.title || ""}
                  placeholder="e.g. 深入解析 Cloudflare Workers 與 Hono SSR"
                  className="w-full px-4 py-2.5 rounded-xl text-sm theme-surface border theme-border focus:outline-none focus:border-cyan-500"
                  style={{ color: "var(--text-primary)" }}
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-medium theme-text-secondary mb-1">
                  URL Slug (網址路徑) *
                </label>
                <input
                  type="text"
                  name="slug"
                  required
                  value={post?.slug || ""}
                  placeholder="e.g. cloudflare-workers-hono-ssr"
                  className="w-full px-4 py-2.5 rounded-xl text-sm font-mono theme-surface border theme-border focus:outline-none focus:border-cyan-500"
                  style={{ color: "var(--text-primary)" }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-medium theme-text-secondary mb-1">
                  Tags (標籤，以逗號分隔)
                </label>
                <input
                  type="text"
                  name="tags"
                  value={initialTags}
                  placeholder="e.g. Architecture, Cloudflare, TypeScript"
                  className="w-full px-4 py-2.5 rounded-xl text-sm font-mono theme-surface border theme-border focus:outline-none focus:border-cyan-500"
                  style={{ color: "var(--text-primary)" }}
                />
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-6">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="is_published"
                    id="is_published"
                    value="1"
                    checked={post ? post.is_published === 1 : true}
                    className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0 bg-gray-900 border-gray-700 cursor-pointer"
                  />
                  <label
                    htmlFor="is_published"
                    className="text-xs font-mono font-bold text-cyan-400 cursor-pointer"
                  >
                    發布此文章 (Published)
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="is_ai_generated"
                    id="is_ai_generated"
                    value="1"
                    checked={post ? Boolean(Number(post.is_ai_generated)) : false}
                    className="w-4 h-4 rounded text-purple-500 focus:ring-purple-500 focus:ring-offset-0 bg-gray-900 border-gray-700 cursor-pointer"
                  />
                  <label
                    htmlFor="is_ai_generated"
                    className="text-xs font-mono font-bold text-purple-400 cursor-pointer flex items-center gap-1.5"
                  >
                    <Bot className="w-3.5 h-3.5" />
                    <span>AI 協同/生成內容 (AI Generated)</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Revision Note (修訂說明) */}
            <div>
              <label className="block text-xs font-mono font-medium theme-text-secondary mb-1">
                Revision Note (本次更新/修訂備註，將記入文章歷史紀錄)
              </label>
              <input
                type="text"
                name="revision_note"
                placeholder={isEditing ? "e.g. 補充效能基準測試數據與圖表" : "初版發布"}
                defaultValue={isEditing ? "內容更新" : "初版發布"}
                className="w-full px-4 py-2.5 rounded-xl text-sm font-mono theme-surface border theme-border focus:outline-none focus:border-cyan-500"
                style={{ color: "var(--text-primary)" }}
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-medium theme-text-secondary mb-1">
                Summary / Excerpt (文章摘要，用於 SEO 與列表預覽) *
              </label>
              <textarea
                name="summary"
                rows={2}
                required
                placeholder="簡短描述文章重點與精要..."
                className="w-full px-4 py-2.5 rounded-xl text-sm theme-surface border theme-border focus:outline-none focus:border-cyan-500 leading-relaxed"
                style={{ color: "var(--text-primary)" }}
              >{post?.summary || ""}</textarea>
            </div>

            {/* Markdown Content Area */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-mono font-medium theme-text-secondary">
                  Markdown Content (文章內容) *
                </label>
                <span className="text-xs font-mono theme-text-secondary">
                  支援標準 Markdown, 程式碼區塊, GFM
                </span>
              </div>
              <textarea
                id="markdown-input"
                name="content"
                rows={18}
                required
                placeholder="在此撰寫 Markdown 內容..."
                className="w-full p-4 rounded-2xl text-xs sm:text-sm font-mono theme-surface border theme-border focus:outline-none focus:border-cyan-500 leading-relaxed"
                style={{ color: "var(--text-primary)" }}
              >{post?.content || ""}</textarea>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end gap-4 pt-4 border-t theme-border">
              <a
                href="/admin"
                className="px-5 py-2.5 rounded-xl text-xs font-mono theme-surface border theme-border hover:opacity-80 transition-all"
                style={{ color: "var(--text-primary)" }}
              >
                Cancel
              </a>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-mono font-bold bg-gradient-to-r from-cyan-500 to-teal-400 text-gray-950 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-cyan-500/20 cursor-pointer"
              >
                <span>{isEditing ? "Save & Update Article" : "Publish to Edge D1"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>
      </body>
    </html>
  );
}
