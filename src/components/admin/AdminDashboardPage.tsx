import { Terminal, Sparkles, ArrowRight, ArrowUpRight } from "../Icons";
import type { Post } from "../../lib/db";
import { formatTaipeiDate, toTaipeiISO } from "../../lib/date";

export interface AdminDashboardPageProps {
  posts: Post[];
}

export function AdminDashboardPage({ posts }: AdminDashboardPageProps) {
  return (
    <html lang="zh" class="dark">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Admin Dashboard | Portfolio Blog</title>
        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body className="min-h-screen p-4 sm:p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b theme-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-500">
                <Terminal className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                  Admin Workspace
                </h1>
                <p className="text-xs theme-text-secondary">
                  Cloudflare D1 邊緣分散式資料庫即時發布控制台
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <a
                href="/admin/editor"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold bg-cyan-500 hover:bg-cyan-400 text-gray-950 transition-all shadow-md shadow-cyan-500/20"
              >
                <span>+ New Article</span>
              </a>
              <a
                href="/blog"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-mono theme-surface border theme-border hover:opacity-80 transition-all"
                style={{ color: "var(--text-primary)" }}
              >
                <span>Live Blog</span>
                <ArrowUpRight className="w-3 h-3 text-cyan-500" />
              </a>
              <a
                href="/admin/logout"
                className="px-3 py-2 rounded-xl text-xs font-mono theme-text-secondary hover:text-rose-400 transition-colors"
              >
                Logout
              </a>
            </div>
          </div>

          {/* Posts Table */}
          <div className="rounded-2xl theme-surface border theme-border overflow-hidden shadow-xl">
            <div className="p-4 sm:p-6 border-b theme-border flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-500 uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>All Articles ({posts.length})</span>
              </div>
              <span className="text-xs font-mono theme-text-secondary">
                Auto-saved on Cloudflare Edge
              </span>
            </div>

            {posts.length === 0 ? (
              <div className="p-12 text-center theme-text-secondary text-sm">
                目前資料庫中尚未建立任何文章。點擊右上角「+ New Article」開始撰寫！
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="theme-surface-subtle border-b theme-border font-mono theme-text-secondary">
                    <tr>
                      <th className="py-3.5 px-4 sm:px-6">Title & Slug</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Tags</th>
                      <th className="py-3.5 px-4">Views</th>
                      <th className="py-3.5 px-4">Date</th>
                      <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y theme-border">
                    {posts.map((post) => (
                      <tr key={post.slug} className="hover:bg-cyan-500/5 transition-colors">
                        <td className="py-4 px-4 sm:px-6">
                          <div className="font-bold text-sm mb-0.5" style={{ color: "var(--text-primary)" }}>
                            {post.title}
                          </div>
                          <div className="font-mono text-xs text-cyan-500">
                            /blog/{post.slug}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex flex-col gap-1 items-start">
                            <span
                              className={`px-2 py-0.5 rounded-full font-mono font-bold text-[10px] ${
                                post.is_published === 1
                                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                  : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                              }`}
                            >
                              {post.is_published === 1 ? "PUBLISHED" : "DRAFT"}
                            </span>
                            {Boolean(Number(post.is_ai_generated)) && (
                              <span className="px-1.5 py-0.5 rounded-full font-mono font-bold text-[10px] bg-purple-500/20 text-purple-400 border border-purple-500/30">
                                🤖 AI
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex flex-wrap gap-1">
                            {post.tags.map((t) => (
                              <span
                                key={t}
                                className="px-1.5 py-0.5 rounded text-[10px] font-mono theme-surface-subtle border theme-border theme-text-secondary"
                              >
                                #{t}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-4 px-4 font-mono theme-text-secondary">
                          {post.views}
                        </td>
                        <td className="py-4 px-4 font-mono theme-text-secondary">
                          <time dateTime={toTaipeiISO(post.created_at)} data-local-format="date">
                            {formatTaipeiDate(post.created_at)}
                          </time>
                        </td>
                        <td className="py-4 px-4 sm:px-6 text-right">
                          <div className="flex items-center justify-end gap-2 font-mono">
                            <a
                              href={`/blog/${post.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2 py-1 rounded theme-surface-subtle hover:text-cyan-400 transition-colors"
                            >
                              View
                            </a>
                            <a
                              href={`/admin/editor?slug=${post.slug}`}
                              className="px-2.5 py-1 rounded bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition-colors"
                            >
                              Edit
                            </a>
                            <form
                              action="/admin/posts/delete"
                              method="post"
                              onsubmit="return confirm('確定要刪除這篇文章嗎？此動作無法復原。');"
                              className="inline"
                            >
                              <input type="hidden" name="slug" value={post.slug} />
                              <button
                                type="submit"
                                className="px-2 py-1 rounded text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                              >
                                Delete
                              </button>
                            </form>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
