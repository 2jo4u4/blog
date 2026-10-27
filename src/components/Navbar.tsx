import { Terminal, Globe, Sun, Moon, Menu, X, ArrowUpRight, Github } from "./Icons";
import { data } from "../lib/data";

export interface NavbarProps {
  locale: "zh" | "en";
  t: any;
}

export function Navbar({ locale, t }: NavbarProps) {
  const navLinks = [
    { label: t.nav.about, href: "/#about" },
    { label: t.nav.metrics, href: "/#metrics" },
    { label: t.nav.projects, href: "/#projects" },
    { label: t.nav.skills, href: "/#skills" },
    { label: t.nav.experience, href: "/#experience" },
    { label: locale === "zh" ? "技術隨筆" : "Blog", href: "/blog" },
    { label: t.nav.contact, href: "/#contact" },
  ];

  const githubLink = data.profile.socialLinks.find((s) => s.name === "GitHub")?.url || "https://github.com/2jo4u4";

  return (
    <header
      id="main-navbar"
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-transparent py-5 border-b border-transparent"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* Brand Logo */}
        <a
          href="#about"
          className="flex items-center gap-2 font-mono font-bold text-lg tracking-tight hover:opacity-80 transition-opacity"
          style={{ color: "var(--text-primary)" }}
        >
          <Terminal className="w-5 h-5 text-cyan-500" />
          <span>
            jay.huang<span className="text-cyan-500 animate-pulse">_</span>
          </span>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium transition-colors hover:text-cyan-500"
              style={{ color: "var(--text-secondary)" }}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop Controls (i18n + Theme + GitHub) */}
        <div className="hidden md:flex items-center gap-2.5">
          {/* Language Switcher */}
          <button
            id="lang-toggle-btn"
            type="button"
            aria-label="Switch language"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all theme-surface border theme-border hover:opacity-80 cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-cyan-500" />
            <span>{locale === "zh" ? "EN" : "繁中"}</span>
          </button>

          {/* Theme Switcher */}
          <button
            id="theme-toggle-btn"
            type="button"
            aria-label="Toggle theme"
            className="p-2 rounded-lg transition-all theme-surface border theme-border hover:opacity-80 cursor-pointer"
          >
            <Sun className="w-4 h-4 text-amber-400 block dark:hidden" />
            <Moon className="w-4 h-4 text-cyan-400 hidden dark:block" />
          </button>

          {/* GitHub CTA */}
          <a
            href={githubLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold bg-cyan-500 hover:bg-cyan-400 text-gray-950 transition-all shadow-sm"
          >
            <Github className="w-3.5 h-3.5" />
            <span>GitHub</span>
            <ArrowUpRight className="w-3 h-3" />
          </a>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            id="mobile-menu-open-btn"
            type="button"
            aria-label="Open mobile menu"
            className="p-2 rounded-lg theme-surface border theme-border"
          >
            <Menu className="w-5 h-5 text-cyan-500" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div
        id="mobile-drawer"
        className="hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-md md:hidden"
      >
        <div className="absolute right-0 top-0 bottom-0 w-3/4 max-w-xs theme-surface border-l theme-border p-6 flex flex-col justify-between shadow-2xl">
          <div>
            <div className="flex items-center justify-between pb-6 border-b theme-border">
              <span className="font-mono font-bold text-sm text-cyan-500">NAVIGATION</span>
              <button
                id="mobile-menu-close-btn"
                type="button"
                aria-label="Close mobile menu"
                className="p-1.5 rounded-lg theme-surface-subtle"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-4 pt-6">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="mobile-drawer-link text-base font-medium transition-colors hover:text-cyan-500 py-1"
                  style={{ color: "var(--text-primary)" }}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          <div className="space-y-4 pt-6 border-t theme-border">
            <div className="flex items-center gap-3">
              <button
                id="mobile-lang-toggle-btn"
                type="button"
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-mono font-semibold theme-surface-subtle border theme-border"
              >
                <Globe className="w-4 h-4 text-cyan-500" />
                <span>{locale === "zh" ? "Switch to EN" : "切換至繁中"}</span>
              </button>

              <button
                id="mobile-theme-toggle-btn"
                type="button"
                className="p-2 rounded-lg theme-surface-subtle border theme-border"
              >
                <Sun className="w-4 h-4 text-amber-400 block dark:hidden" />
                <Moon className="w-4 h-4 text-cyan-400 hidden dark:block" />
              </button>
            </div>

            <a
              href={githubLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-xs font-mono font-semibold bg-cyan-500 text-gray-950 shadow-sm"
            >
              <Github className="w-4 h-4" />
              <span>GitHub Profile</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
