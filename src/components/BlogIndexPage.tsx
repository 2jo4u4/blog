import { Layout } from "./Layout";
import { Navbar } from "./Navbar";
import { Contact } from "./Contact";
import { Terminal, Calendar, ArrowRight, Layers, Sparkles, Bot } from "./Icons";
import type { Post } from "../lib/db";
import { formatTaipeiDate, toTaipeiISO } from "../lib/date";

export interface BlogIndexPageProps {
  posts: Post[];
  tags: { tag: string; count: number }[];
  currentTag?: string;
  totalPostsCount?: number;
  locale: "zh" | "en";
  t: any;
  url: string;
}

export function BlogIndexPage({
  posts,
  tags,
  currentTag,
  totalPostsCount,
  locale,
  t,
  url,
}: BlogIndexPageProps) {
  const totalCount =
    totalPostsCount !== undefined
      ? totalPostsCount
      : !currentTag
      ? posts.length
      : tags.reduce((acc, curr) => acc + curr.count, 0);
  const title =
    locale === "zh"
      ? "技術隨筆與筆記 | 黃冠傑 (Jay) Blog"
      : "Technical Notes & Articles | Jay Huang Blog";

  const description =
    locale === "zh"
      ? "探索前端工程、全端架構、Canvas 圖形渲染、Web Audio 與邊緣原生 (Edge-Native) 計算的技術隨筆與實踐紀錄。"
      : "Explorations in frontend engineering, fullstack architecture, Canvas graphics rendering, Web Audio, and edge-native computing.";

  return (
    <Layout title={title} description={description} locale={locale} url={url}>
      <Navbar locale={locale} t={t} />

      <main className="pt-32 pb-24 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="space-y-4 mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 text-xs font-mono">
              <Terminal className="w-3.5 h-3.5" />
              <span>{locale === "zh" ? "技術隨筆與架構筆記" : "Engineering Notes"}</span>
            </div>
            <h1
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight"
              style={{ color: "var(--text-primary)" }}
            >
              {locale === "zh" ? "隨筆與心得" : "Notes & Articles"}
            </h1>
            <p className="text-base sm:text-lg theme-text-secondary max-w-2xl leading-relaxed">
              {locale === "zh"
                ? "記錄關於前端底層原理、邊緣運算架構、效能優化與 AI 輔助開發的實戰洞見。"
                : "Hands-on insights on frontend internals, edge architecture, performance optimization, and AI-accelerated workflows."}
            </p>
          </div>

          {/* Tag Filter Bar */}
          {tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-10 pb-6 border-b theme-border">
              <a
                href="/blog"
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                  !currentTag
                    ? "bg-cyan-500 text-gray-950 font-bold shadow-md shadow-cyan-500/20"
                    : "theme-surface border theme-border hover:border-cyan-500/40 theme-text-secondary"
                }`}
              >
                {locale === "zh" ? "全部文章" : "All"} ({totalCount})
              </a>
              {tags.map(({ tag, count }) => {
                const isActive = currentTag === tag;
                return (
                  <a
                    key={tag}
                    href={`/blog?tag=${encodeURIComponent(tag)}`}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                      isActive
                        ? "bg-cyan-500 text-gray-950 font-bold shadow-md shadow-cyan-500/20"
                        : "theme-surface border theme-border hover:border-cyan-500/40 theme-text-secondary"
                    }`}
                  >
                    #{tag} ({count})
                  </a>
                );
              })}
            </div>
          )}

          {/* Posts List */}
          {posts.length === 0 ? (
            <div className="p-12 text-center rounded-2xl theme-surface border theme-border">
              <Sparkles className="w-8 h-8 text-cyan-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold mb-1" style={{ color: "var(--text-primary)" }}>
                {currentTag
                  ? locale === "zh"
                    ? "尚無相關文章"
                    : "No related articles"
                  : locale === "zh"
                  ? "尚無文章發布"
                  : "No articles published"}
              </h3>
              <p className="text-sm theme-text-secondary mb-4">
                {currentTag
                  ? locale === "zh"
                    ? `標籤 #${currentTag} 下目前沒有已發布的文章。`
                    : `No published articles under #${currentTag}.`
                  : locale === "zh"
                  ? "目前尚無文章發布，請稍後再嘗試。"
                  : "No articles published yet. Please check back later."}
              </p>
              {currentTag && (
                <a
                  href="/blog"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-500 hover:opacity-80"
                >
                  <span>{locale === "zh" ? "查看全部文章" : "View all articles"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => {
                const readingMinutes = Math.max(1, Math.ceil(post.content.length / 400));
                return (
                  <article
                    key={post.slug}
                    className="p-6 sm:p-8 rounded-2xl theme-surface border theme-border hover:border-cyan-500/40 transition-all shadow-sm group relative"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-cyan-400">
                        <Calendar className="w-3.5 h-3.5" />
                        <time dateTime={toTaipeiISO(post.created_at)}>
                          {formatTaipeiDate(post.created_at)}
                        </time>
                        {post.updated_at && post.updated_at !== post.created_at && (
                          <span className="text-[11px] text-amber-400 font-mono">
                            (修訂於 {formatTaipeiDate(post.updated_at)})
                          </span>
                        )}
                        <span>•</span>
                        <span>{readingMinutes} min read</span>

                        {Boolean(Number(post.is_ai_generated)) && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30">
                            <Bot className="w-3 h-3" />
                            <span>{locale === "zh" ? "AI 協作/生成" : "AI Generated"}</span>
                          </span>
                        )}
                      </div>

                      {post.views > 0 && (
                        <span className="text-xs font-mono theme-text-secondary">
                          {post.views} views
                        </span>
                      )}
                    </div>

                    <h2
                      className="text-xl sm:text-2xl font-bold mb-2 group-hover:text-cyan-500 transition-colors"
                      style={{ color: "var(--text-primary)" }}
                    >
                      <a href={`/blog/${post.slug}`} className="hover:underline">
                        {post.title}
                      </a>
                    </h2>

                    <p className="text-sm sm:text-base leading-relaxed theme-text-secondary mb-5 line-clamp-3">
                      {post.summary}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                      <div className="flex flex-wrap gap-1.5">
                        {post.tags.map((tag) => (
                          <a
                            key={tag}
                            href={`/blog?tag=${encodeURIComponent(tag)}`}
                            className="px-2.5 py-0.5 rounded-md text-xs font-mono theme-surface-subtle border theme-border hover:border-cyan-500/30 transition-colors"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            #{tag}
                          </a>
                        ))}
                      </div>

                      <a
                        href={`/blog/${post.slug}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-500 group-hover:translate-x-1 transition-transform"
                      >
                        <span>{locale === "zh" ? "閱讀全文" : "Read Article"}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Contact t={t} />
    </Layout>
  );
}
