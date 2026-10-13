"use client";

import { ArrowRight, Sparkles, MapPin, Mail, Layers, Cpu, Zap, Code2 } from "lucide-react";
import { useApp } from "@/lib/AppContext";

export function Hero() {
  const { t } = useApp();

  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const coreTags = [
    "React",
    "TypeScript",
    "HTML5 Canvas OOP",
    "Web Audio API",
    "Turborepo & pnpm",
    "Docker & CI/CD",
    "Web Performance",
    "AI Agent Workflows"
  ];

  return (
    <section id="about" className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-cyan-500/10 blur-[130px] pointer-events-none rounded-full" />
      <div className="absolute top-1/3 right-1/4 w-[350px] h-[350px] bg-emerald-500/10 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative text-center">
        <div className="space-y-6 flex flex-col items-center">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t.hero.badge}</span>
          </div>

          {/* Heading */}
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight" style={{ color: "var(--text-primary)" }}>
              {t.hero.greeting}{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400">
                {t.hero.name}
              </span>
            </h1>
            <p className="text-xl sm:text-2xl font-semibold text-cyan-500 max-w-2xl">
              {t.hero.title}
            </p>
          </div>

          {/* Bio text */}
          <p className="text-base sm:text-lg leading-relaxed theme-text-secondary max-w-2xl">
            {t.hero.bio}
          </p>

          {/* Location pill */}
          <div className="flex items-center gap-2 text-xs font-mono theme-text-secondary">
            <MapPin className="w-3.5 h-3.5 text-cyan-500" />
            <span>{t.hero.location}</span>
          </div>

          {/* Core Tech Stack Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-2xl pt-2">
            {coreTags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-lg text-xs font-mono theme-surface border theme-border shadow-sm hover:border-cyan-500/40 transition-colors"
                style={{ color: "var(--text-secondary)" }}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* CTA Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <a
              href="#projects"
              onClick={(e) => handleScrollTo(e, "#projects")}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-gray-950 shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {t.hero.exploreProjects}
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="#contact"
              onClick={(e) => handleScrollTo(e, "#contact")}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm theme-surface hover:opacity-80 transition-all border theme-border shadow-sm"
              style={{ color: "var(--text-primary)" }}
            >
              <Mail className="w-4 h-4 text-cyan-500" />
              {t.hero.contactMe}
            </a>
          </div>

        </div>
      </div>
    </section>
  );
}
