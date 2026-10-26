import { Layout } from "./Layout";
import { Navbar } from "./Navbar";
import { Contact } from "./Contact";
import { Terminal, ArrowRight } from "./Icons";

export interface NotFoundPageProps {
  locale: "zh" | "en";
  t: any;
  url: string;
}

export function NotFoundPage({ locale, t, url }: NotFoundPageProps) {
  return (
    <Layout
      title="404 Page Not Found | 黃冠傑 (Jay)"
      description="The requested page could not be found."
      locale={locale}
      url={url}
    >
      <Navbar locale={locale} t={t} />

      <main className="pt-36 pb-28 min-h-[70vh] flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 text-center space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 text-xs font-mono">
            <Terminal className="w-3.5 h-3.5" />
            <span>404 ERROR</span>
          </div>

          <h1
            className="text-4xl sm:text-5xl font-extrabold tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            404 Not Found
          </h1>

          <p className="text-sm sm:text-base theme-text-secondary leading-relaxed">
            {locale === "zh"
              ? "抱歉，您所尋找的文章或頁面不存在，或者已經被作者隱藏。"
              : "Sorry, the article or page you are looking for does not exist or has been unpublished."}
          </p>

          <div className="pt-4 flex items-center justify-center gap-4">
            <a
              href="/blog"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-xs bg-cyan-500 hover:bg-cyan-400 text-gray-950 transition-all shadow-md"
            >
              <span>{locale === "zh" ? "返回技術隨筆" : "Back to Blog"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>

            <a
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-xs theme-surface border theme-border hover:opacity-80 transition-all"
              style={{ color: "var(--text-primary)" }}
            >
              <span>{locale === "zh" ? "回到首頁" : "Go Home"}</span>
            </a>
          </div>
        </div>
      </main>

      <Contact t={t} />
    </Layout>
  );
}
