import { Terminal, ArrowRight } from "../Icons";

export interface AdminLoginPageProps {
  error?: string;
}

export function AdminLoginPage({ error }: AdminLoginPageProps) {
  return (
    <html lang="zh" class="dark">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Admin Login | Portfolio Blog</title>
        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md p-8 rounded-3xl theme-surface border theme-border shadow-2xl space-y-6">
          <div className="space-y-2 text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 text-xs font-mono">
              <Terminal className="w-3.5 h-3.5" />
              <span>AUTHENTICATION</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
              Admin Console
            </h1>
            <p className="text-xs theme-text-secondary">
              請輸入管理員密碼以進入即時 Markdown 發布後台
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs text-center font-mono">
              {error}
            </div>
          )}

          <form action="/admin/login" method="post" className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-medium theme-text-secondary mb-1">
                Username
              </label>
              <input
                type="text"
                name="username"
                value="admin"
                required
                className="w-full px-4 py-2.5 rounded-xl text-sm theme-surface-subtle border theme-border focus:outline-none focus:border-cyan-500"
                style={{ color: "var(--text-primary)" }}
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-medium theme-text-secondary mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                placeholder="••••••••••••"
                required
                className="w-full px-4 py-2.5 rounded-xl text-sm theme-surface-subtle border theme-border focus:outline-none focus:border-cyan-500"
                style={{ color: "var(--text-primary)" }}
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-mono font-bold bg-gradient-to-r from-cyan-500 to-teal-400 text-gray-950 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-lg shadow-cyan-500/20 cursor-pointer"
            >
              <span>Sign In</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="text-center pt-2">
            <a href="/" className="text-xs theme-text-secondary hover:text-cyan-500 transition-colors">
              ← 返回前台首頁
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
