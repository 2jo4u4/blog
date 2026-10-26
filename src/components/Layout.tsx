import type { Child } from "hono/jsx";

export interface LayoutProps {
  title: string;
  description: string;
  locale: "zh" | "en";
  url: string;
  children: Child;
}

export function Layout({ title, description, locale, url, children }: LayoutProps) {
  const canonicalUrl = url.split("?")[0];
  const ogImageUrl = `${new URL(url).origin}/images/projects/dreamcity-hero.png`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "黃冠傑 (Jay)",
    alternateName: "Jay Huang",
    jobTitle: locale === "zh" ? "資深前端工程師 • 全端架構師" : "Senior Frontend Engineer & Fullstack Architect",
    url: canonicalUrl,
    sameAs: [
      "https://github.com/2jo4u4",
      "https://www.linkedin.com/in/huang-jay",
      "https://www.cake.me/me/HuangJay",
    ],
    knowsAbout: [
      "React",
      "TypeScript",
      "HTML5 Canvas API",
      "Web Audio API",
      "Cloudflare Workers",
      "Hono",
      "Edge Computing",
      "AI Agent Workflows",
    ],
  };

  return (
    <html lang={locale} class="dark">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content="黃冠傑, Jay Huang, Frontend Engineer, Senior Frontend Engineer, Fullstack, React, TypeScript, Cloudflare Workers, Hono, Canvas, DreamCity, Portfolio" />
        <link rel="canonical" href={canonicalUrl} />

        {/* OpenGraph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={ogImageUrl} />
        <meta property="og:locale" content={locale === "zh" ? "zh_TW" : "en_US"} />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={ogImageUrl} />

        {/* Favicons */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />

        {/* Stylesheet compiled ahead of time */}
        <link rel="stylesheet" href="/styles.css" />

        {/* Anti-FOUC Theme Init Script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('portfolio-theme');if(t==='light'){document.documentElement.classList.remove('dark');document.documentElement.classList.add('light');}else{document.documentElement.classList.remove('light');document.documentElement.classList.add('dark');}}catch(e){}})();`,
          }}
        />

        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd),
          }}
        />
      </head>
      <body className="min-h-screen relative selection:bg-cyan-500/30 selection:text-cyan-200">
        {children}

        {/* Client Interactive Helper */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              document.addEventListener('DOMContentLoaded', function() {
                // Theme Toggle
                var themeBtn = document.getElementById('theme-toggle-btn');
                var mobileThemeBtn = document.getElementById('mobile-theme-toggle-btn');
                function toggleTheme() {
                  var isLight = document.documentElement.classList.contains('light');
                  if (isLight) {
                    document.documentElement.classList.remove('light');
                    document.documentElement.classList.add('dark');
                    localStorage.setItem('portfolio-theme', 'dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.classList.add('light');
                    localStorage.setItem('portfolio-theme', 'light');
                  }
                }
                if (themeBtn) themeBtn.addEventListener('click', toggleTheme);
                if (mobileThemeBtn) mobileThemeBtn.addEventListener('click', toggleTheme);

                // Language Toggle
                var langBtn = document.getElementById('lang-toggle-btn');
                var mobileLangBtn = document.getElementById('mobile-lang-toggle-btn');
                function toggleLang() {
                  var currentLang = "${locale}";
                  var nextLang = currentLang === 'zh' ? 'en' : 'zh';
                  document.cookie = 'portfolio-locale=' + nextLang + ';path=/;max-age=31536000';
                  var url = new URL(window.location.href);
                  url.searchParams.set('lang', nextLang);
                  window.location.href = url.toString();
                }
                if (langBtn) langBtn.addEventListener('click', toggleLang);
                if (mobileLangBtn) mobileLangBtn.addEventListener('click', toggleLang);

                // Mobile Drawer Toggle
                var menuOpenBtn = document.getElementById('mobile-menu-open-btn');
                var menuCloseBtn = document.getElementById('mobile-menu-close-btn');
                var mobileDrawer = document.getElementById('mobile-drawer');
                if (menuOpenBtn && mobileDrawer) {
                  menuOpenBtn.addEventListener('click', function() {
                    mobileDrawer.classList.remove('hidden');
                  });
                }
                if (menuCloseBtn && mobileDrawer) {
                  menuCloseBtn.addEventListener('click', function() {
                    mobileDrawer.classList.add('hidden');
                  });
                }
                var drawerLinks = document.querySelectorAll('.mobile-drawer-link');
                drawerLinks.forEach(function(l) {
                  l.addEventListener('click', function() {
                    if (mobileDrawer) mobileDrawer.classList.add('hidden');
                  });
                });

                // Navbar Scroll Effect
                var header = document.getElementById('main-navbar');
                window.addEventListener('scroll', function() {
                  if (!header) return;
                  if (window.scrollY > 20) {
                    header.classList.add('backdrop-blur-md', 'py-3', 'shadow-lg', 'border-b', 'theme-border');
                    header.classList.remove('py-5', 'bg-transparent');
                    header.style.backgroundColor = 'var(--nav-bg)';
                  } else {
                    header.classList.remove('backdrop-blur-md', 'py-3', 'shadow-lg', 'border-b', 'theme-border');
                    header.classList.add('py-5', 'bg-transparent');
                    header.style.backgroundColor = 'transparent';
                  }
                });
              });
            `,
          }}
        />
      </body>
    </html>
  );
}
