import type { Child } from "hono/jsx";
import { X } from "./Icons";

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

        {/* Global Image Lightbox Modal */}
        <div
          id="global-lightbox"
          className="fixed inset-0 z-50 hidden opacity-0 transition-opacity duration-200 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-8"
          style={{ touchAction: "none" }}
          role="dialog"
          aria-modal="true"
          aria-label="Image Lightbox"
        >
          <button
            id="lightbox-close-btn"
            type="button"
            aria-label="Close Lightbox"
            className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer z-10"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="relative max-w-[90vw] max-h-[85vh] flex flex-col items-center justify-center pointer-events-none">
            <img
              id="lightbox-img"
              src=""
              alt=""
              className="max-w-full max-h-[75vh] sm:max-h-[80vh] object-contain rounded-xl shadow-2xl transition-transform duration-200 transform scale-95 pointer-events-auto"
            />
            <div
              id="lightbox-caption"
              className="mt-3 px-4 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/60 text-slate-200 text-xs sm:text-sm font-mono tracking-wide hidden max-w-[85vw] text-center truncate shadow-lg pointer-events-auto"
            />
          </div>
        </div>

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
                function updateNavbar() {
                  if (!header) return;
                  if (window.scrollY > 20) {
                    header.classList.add('backdrop-blur-md', 'py-3', 'shadow-sm', 'theme-border');
                    header.classList.remove('py-5', 'bg-transparent', 'border-transparent');
                    header.style.backgroundColor = 'var(--nav-bg)';
                  } else {
                    header.classList.remove('backdrop-blur-md', 'py-3', 'shadow-sm', 'theme-border');
                    header.classList.add('py-5', 'bg-transparent', 'border-transparent');
                    header.style.backgroundColor = 'transparent';
                  }
                }
                window.addEventListener('scroll', updateNavbar);
                updateNavbar();

                // Browser Local Timezone Progressive Enhancement
                try {
                  var timeElements = document.querySelectorAll('time[datetime][data-local-format]');
                  if (timeElements.length > 0 && typeof Intl !== 'undefined' && Intl.DateTimeFormat) {
                    var dateFormatter = new Intl.DateTimeFormat(undefined, {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      calendar: 'gregory',
                      numberingSystem: 'latn',
                    });
                    var dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      hourCycle: 'h23',
                      calendar: 'gregory',
                      numberingSystem: 'latn',
                    });

                    function extractParts(formatter, dateObj) {
                      var parts = formatter.formatToParts(dateObj);
                      var map = {};
                      for (var i = 0; i < parts.length; i++) {
                        if (parts[i].type !== 'literal') map[parts[i].type] = parts[i].value;
                      }
                      return map;
                    }

                    timeElements.forEach(function(el) {
                      var raw = el.getAttribute('datetime');
                      if (!raw) return;
                      var dateObj = new Date(raw);
                      if (isNaN(dateObj.getTime())) return;
                      var formatType = el.getAttribute('data-local-format');
                      var dateParts = extractParts(dateFormatter, dateObj);
                      var dateString = dateParts.year + '-' + dateParts.month + '-' + dateParts.day;

                      if (formatType === 'datetime') {
                        var dtParts = extractParts(dateTimeFormatter, dateObj);
                        el.textContent = dateString + ' ' + (dtParts.hour || '00') + ':' + dtParts.minute + ':' + dtParts.second;
                      } else {
                        el.textContent = dateString;
                      }
                    });
                  }
                } catch (e) {}

                // Global Image Lightbox Handler
                try {
                  var lightbox = document.getElementById('global-lightbox');
                  var lightboxImg = document.getElementById('lightbox-img');
                  var lightboxCaption = document.getElementById('lightbox-caption');
                  var lightboxCloseBtn = document.getElementById('lightbox-close-btn');

                  function openLightbox(src, alt) {
                    if (!lightbox || !lightboxImg) return;
                    lightboxImg.src = src;
                    lightboxImg.alt = alt || '';
                    if (alt && alt.trim() && lightboxCaption) {
                      lightboxCaption.textContent = alt.trim();
                      lightboxCaption.classList.remove('hidden');
                    } else if (lightboxCaption) {
                      lightboxCaption.classList.add('hidden');
                    }
                    lightbox.classList.remove('hidden');
                    setTimeout(function() {
                      lightbox.classList.remove('opacity-0');
                      lightboxImg.classList.remove('scale-95');
                      lightboxImg.classList.add('scale-100');
                    }, 10);
                    document.body.style.overflow = 'hidden';
                  }

                  function closeLightbox() {
                    if (!lightbox || !lightboxImg) return;
                    lightbox.classList.add('opacity-0');
                    lightboxImg.classList.remove('scale-100');
                    lightboxImg.classList.add('scale-95');
                    setTimeout(function() {
                      lightbox.classList.add('hidden');
                      lightboxImg.src = '';
                      lightboxImg.alt = '';
                      document.body.style.overflow = '';
                    }, 200);
                  }

                  if (lightboxCloseBtn) {
                    lightboxCloseBtn.addEventListener('click', closeLightbox);
                  }

                  if (lightbox) {
                    lightbox.addEventListener('click', function(e) {
                      if (e.target === lightbox) {
                        closeLightbox();
                      }
                    });
                  }

                  document.addEventListener('keydown', function(e) {
                    if (e.key === 'Escape' && lightbox && !lightbox.classList.contains('hidden')) {
                      closeLightbox();
                    }
                  });

                  // Event delegation on zoomable images
                  document.addEventListener('click', function(e) {
                    var target = e.target;
                    if (!target || target.tagName !== 'IMG') return;
                    if (target.id === 'lightbox-img') return;
                    if (
                      target.classList.contains('zoomable-img') ||
                      target.closest('#projects') ||
                      target.closest('.article-prose') ||
                      target.hasAttribute('data-zoomable')
                    ) {
                      e.preventDefault();
                      openLightbox(target.currentSrc || target.src, target.alt);
                    }
                  });
                } catch (err) {}
              });
            `,
          }}
        />
      </body>
    </html>
  );
}
