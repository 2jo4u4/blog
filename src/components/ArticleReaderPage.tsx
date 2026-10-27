import { Layout } from "./Layout";
import { Navbar } from "./Navbar";
import { Contact } from "./Contact";
import { Calendar, ArrowRight, ArrowUpRight, Github, Sparkles, Terminal, History, Bot } from "./Icons";
import type { Post, PostRevision } from "../lib/db";
import type { TocItem } from "../lib/markdown";
import { formatTaipeiDateTime, formatTaipeiDate, toTaipeiISO } from "../lib/date";

export interface ArticleReaderPageProps {
  post: Post;
  revisions?: PostRevision[];
  html: string;
  toc: TocItem[];
  locale: "zh" | "en";
  t: any;
  url: string;
}

export function ArticleReaderPage({
  post,
  revisions = [],
  html,
  toc,
  locale,
  t,
  url,
}: ArticleReaderPageProps) {
  const canonicalUrl = url.split("?")[0];
  const readingMinutes = Math.max(1, Math.ceil(post.content.length / 400));
  const isEdited = post.updated_at && post.updated_at !== post.created_at;

  // Fallback revision timeline if no separate revisions table records exist yet
  const displayRevisions: { updated_at: string; note: string }[] =
    revisions.length > 0
      ? revisions
      : [
          ...(isEdited
            ? [{ updated_at: post.updated_at, note: locale === "zh" ? "最新修訂" : "Latest Update" }]
            : []),
          { updated_at: post.created_at, note: locale === "zh" ? "初版發布" : "Initial Publication" },
        ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: post.title,
    description: post.summary,
    datePublished: toTaipeiISO(post.created_at),
    dateModified: toTaipeiISO(post.updated_at),
    url: canonicalUrl,
    author: {
      "@type": "Person",
      name: "黃冠傑 (Jay)",
      url: "https://blog.2jo4u4.workers.dev",
    },
    publisher: {
      "@type": "Person",
      name: "黃冠傑 (Jay)",
    },
    keywords: post.tags.join(", "),
  };

  return (
    <Layout
      title={`${post.title} | 黃冠傑 (Jay) Blog`}
      description={post.summary}
      locale={locale}
      url={url}
    >
      {/* Additional Article JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />

      <Navbar locale={locale} t={t} />

      <main className="pt-28 pb-24 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex items-center gap-2 text-xs font-mono theme-text-secondary">
              <li>
                <a href="/" className="hover:text-cyan-500 transition-colors">
                  {locale === "zh" ? "首頁" : "Home"}
                </a>
              </li>
              <li>/</li>
              <li>
                <a href="/blog" className="hover:text-cyan-500 transition-colors">
                  {locale === "zh" ? "技術隨筆" : "Blog"}
                </a>
              </li>
              <li>/</li>
              <li className="text-cyan-500 truncate max-w-[200px] sm:max-w-xs">
                {post.slug}
              </li>
            </ol>
          </nav>

          {/* Article Header */}
          <header className="max-w-3xl mb-12 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              {Boolean(Number(post.is_ai_generated)) && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-mono font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30">
                  <Bot className="w-3.5 h-3.5" />
                  <span>{locale === "zh" ? "AI 協同/生成內容" : "AI Generated"}</span>
                </span>
              )}
              {post.tags.map((tag) => (
                <a
                  key={tag}
                  href={`/blog?tag=${encodeURIComponent(tag)}`}
                  className="px-2.5 py-0.5 rounded-md text-xs font-mono font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:border-cyan-400 transition-colors"
                >
                  #{tag}
                </a>
              ))}
            </div>

            <h1
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight"
              style={{ color: "var(--text-primary)" }}
            >
              {post.title}
            </h1>

            {/* Date & Meta Information */}
            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs font-mono theme-text-secondary pt-2 border-b theme-border pb-6">
              <div className="flex items-center gap-1.5 text-cyan-400">
                <Calendar className="w-3.5 h-3.5" />
                <span>{locale === "zh" ? "發布：" : "Published: "}</span>
                <time dateTime={toTaipeiISO(post.created_at)} data-local-format="date">{formatTaipeiDate(post.created_at)}</time>
              </div>

              {isEdited && (
                <div className="flex items-center gap-1.5 text-amber-400">
                  <History className="w-3.5 h-3.5" />
                  <span>{locale === "zh" ? "修訂：" : "Updated: "}</span>
                  <time dateTime={toTaipeiISO(post.updated_at)} data-local-format="date">{formatTaipeiDate(post.updated_at)}</time>
                </div>
              )}

              <span>•</span>
              <span>{readingMinutes} min read</span>
              <span>•</span>
              <span>{post.views} views</span>
            </div>

            <p className="text-base sm:text-lg leading-relaxed theme-text-secondary font-medium italic border-l-2 border-cyan-500 pl-4 py-1">
              {post.summary}
            </p>
          </header>

          {/* Content & Sidebar Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Article Prose */}
            <div className="lg:col-span-8">
              <article
                className="article-prose"
                dangerouslySetInnerHTML={{ __html: html }}
              />

              {/* Bottom Back Button */}
              <div className="mt-14 pt-8 border-t theme-border flex items-center justify-between">
                <a
                  href="/blog"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-mono font-semibold theme-surface border theme-border hover:border-cyan-500/40 transition-all"
                  style={{ color: "var(--text-primary)" }}
                >
                  <span>←</span>
                  <span>{locale === "zh" ? "返回全部文章" : "Back to Blog"}</span>
                </a>

                <a
                  href="/#projects"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:opacity-80"
                >
                  <span>{locale === "zh" ? "探索專案作品集" : "Explore Portfolio"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Sidebar: Table of Contents, Revision History, Author */}
            <aside className="lg:col-span-4">
              <div className="sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto space-y-6 pr-2 custom-scrollbar">
                {/* Table of Contents */}
                {toc.length > 0 && (
                  <div className="p-6 rounded-2xl theme-surface border theme-border shadow-sm">
                    <div className="flex items-center gap-2 font-mono text-xs font-bold text-cyan-400 uppercase tracking-wider mb-4 pb-2 border-b theme-border">
                      <Terminal className="w-3.5 h-3.5" />
                      <span>Table of Contents</span>
                    </div>
                    <nav className="space-y-2 text-xs font-mono max-h-[40vh] overflow-y-auto">
                      {toc.map((item) => (
                        <a
                          key={item.id}
                          href={`#${item.id}`}
                          className={`block transition-colors hover:text-cyan-400 leading-snug ${
                            item.level === 3 ? "pl-3 theme-text-secondary" : "font-medium"
                          }`}
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {item.text}
                        </a>
                      ))}
                    </nav>
                  </div>
                )}

                {/* Revision / Edit History Card */}
                <div className="p-6 rounded-2xl theme-surface border theme-border shadow-sm space-y-4">
                  <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider pb-2 border-b theme-border">
                    <History className="w-3.5 h-3.5" />
                    <span>{locale === "zh" ? "文章歷史紀錄" : "Revision History"}</span>
                  </div>

                  <div className="relative pl-4 border-l border-cyan-500/30 space-y-3 font-mono text-xs">
                    {displayRevisions.map((rev, idx) => (
                      <div key={idx} className="relative group">
                        <div
                          className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full border-2 ${
                            idx === 0
                              ? "bg-cyan-500 border-cyan-300 shadow-sm shadow-cyan-500/50"
                              : "bg-gray-700 border-gray-600"
                          }`}
                        />
                        <div className="font-semibold text-cyan-400 mb-0.5">
                          {rev.note}
                        </div>
                        <time
                          dateTime={toTaipeiISO(rev.updated_at)}
                          data-local-format="datetime"
                          className="text-[11px] theme-text-secondary block"
                        >
                          {formatTaipeiDateTime(rev.updated_at)}
                        </time>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Author Card */}
                <div className="p-6 rounded-2xl theme-surface-subtle border theme-border space-y-3">
                  <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Author</span>
                  </div>
                  <h4 className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>
                    黃冠傑 (Jay Huang)
                  </h4>
                  <p className="text-xs theme-text-secondary leading-relaxed">
                    資深前端工程師與全端架構師，專注於 React、TypeScript、Canvas 圖形引擎與邊緣原生 Cloudflare Workers 架構。
                  </p>
                  <div className="pt-2">
                    <a
                      href="https://github.com/2jo4u4"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-mono text-cyan-400 hover:underline"
                    >
                      <span>GitHub Profile</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      {/* Code Copy Interactive Script */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            document.addEventListener('DOMContentLoaded', function() {
              document.querySelectorAll('.copy-btn').forEach(function(btn) {
                btn.addEventListener('click', function() {
                  var rawCode = decodeURIComponent(btn.getAttribute('data-code') || '');
                  navigator.clipboard.writeText(rawCode).then(function() {
                    var originalText = btn.textContent;
                    btn.textContent = 'Copied!';
                    btn.classList.add('text-emerald-400');
                    setTimeout(function() {
                      btn.textContent = originalText;
                      btn.classList.remove('text-emerald-400');
                    }, 2000);
                  });
                });
              });
            });
          `,
        }}
      />

      <Contact t={t} />
    </Layout>
  );
}
