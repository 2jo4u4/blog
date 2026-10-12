"use client";

import { useState, useEffect } from "react";
import { Moon, Sun, Menu, X, Terminal, ArrowUpRight, Globe } from "lucide-react";
import { useApp } from "@/lib/AppContext";
import { data } from "@/lib/data";

export function Navbar() {
  const { locale, setLocale, theme, toggleTheme, t } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: t.nav.about, href: "#about" },
    { label: t.nav.metrics, href: "#metrics" },
    { label: t.nav.projects, href: "#projects" },
    { label: t.nav.skills, href: "#skills" },
    { label: t.nav.experience, href: "#experience" },
    { label: t.nav.contact, href: "#contact" },
  ];

  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "backdrop-blur-md py-3 shadow-lg border-b theme-border"
          : "bg-transparent py-5"
      }`}
      style={{
        backgroundColor: scrolled ? "var(--nav-bg)" : "transparent",
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* Brand Logo */}
        <a
          href="#about"
          onClick={(e) => handleScrollTo(e, "#about")}
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
              onClick={(e) => handleScrollTo(e, link.href)}
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
            onClick={() => setLocale(locale === "zh" ? "en" : "zh")}
            aria-label="Switch language"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all theme-surface hover:opacity-80"
          >
            <Globe className="w-3.5 h-3.5 text-cyan-500" />
            <span>{locale === "zh" ? "EN" : "繁中"}</span>
          </button>

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-lg transition-all theme-surface hover:opacity-80"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          {/* GitHub Outbound */}
          <a
            href={data.profile.socialLinks.find((s) => s.name === "GitHub")?.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-500 border border-cyan-500/30 transition-all"
          >
            GitHub
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Mobile Buttons */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setLocale(locale === "zh" ? "en" : "zh")}
            className="p-1.5 px-2 rounded-lg text-xs font-mono font-semibold theme-surface"
          >
            {locale === "zh" ? "EN" : "繁中"}
          </button>
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-lg theme-surface"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Open menu"
            className="p-2 rounded-lg theme-surface"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-x-0 top-[60px] py-6 px-6 shadow-2xl border-b theme-border backdrop-blur-xl"
          style={{ backgroundColor: "var(--bg-main)" }}
        >
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleScrollTo(e, link.href)}
                className="text-base font-medium py-1 transition-colors hover:text-cyan-500"
                style={{ color: "var(--text-primary)" }}
              >
                {link.label}
              </a>
            ))}
            <div className="pt-4 border-t theme-border flex items-center justify-between">
              <span className="text-xs font-mono theme-text-secondary">Taipei, Taiwan</span>
              <a
                href={data.profile.socialLinks.find((s) => s.name === "GitHub")?.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs font-mono text-cyan-500"
              >
                github.com/2jo4u4 <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
