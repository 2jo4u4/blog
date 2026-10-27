import { Sparkles, MapPin, ArrowRight, Mail } from "./Icons";

export interface HeroProps {
  t: any;
}

export function Hero({ t }: HeroProps) {
  const coreTags = [
    "React",
    "TypeScript",
    "HTML5 Canvas OOP",
    "Web Audio API",
    "Turborepo & pnpm",
    "Docker & CI/CD",
    "Web Performance",
    "AI Agent Workflows",
  ];

  return (
    <section id="about" className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-cyan-500/10 blur-[130px] pointer-events-none rounded-full opacity-20 dark:opacity-100" />
      <div className="absolute top-1/3 right-1/4 w-[350px] h-[350px] bg-emerald-500/10 blur-[120px] pointer-events-none rounded-full opacity-20 dark:opacity-100" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative text-center">
        <div className="space-y-6 flex flex-col items-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-50/80 border border-cyan-200 text-cyan-800 dark:bg-cyan-500/10 dark:border-cyan-500/20 dark:text-cyan-400 text-xs font-mono shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-cyan-700 dark:text-cyan-400" />
            <span>{t.hero.badge}</span>
          </div>

          {/* Heading */}
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight" style={{ color: "var(--text-primary)" }}>
              {t.hero.greeting}{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-700 via-teal-700 to-emerald-700 dark:from-cyan-400 dark:via-teal-400 dark:to-emerald-400">
                {t.hero.name}
              </span>
            </h1>
            <p className="text-xl sm:text-2xl font-semibold text-cyan-800 dark:text-cyan-400 max-w-2xl">
              {t.hero.title}
            </p>
          </div>

          {/* Bio text */}
          <p className="text-base sm:text-lg leading-relaxed theme-text-secondary max-w-2xl">
            {t.hero.bio}
          </p>

          {/* Location pill */}
          <div className="flex items-center gap-2 text-xs font-mono theme-text-secondary">
            <MapPin className="w-3.5 h-3.5 text-cyan-700 dark:text-cyan-400" />
            <span>{t.hero.location}</span>
          </div>

          {/* Core Tech Stack Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-2xl pt-2">
            {coreTags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-lg text-xs font-mono theme-surface border theme-border shadow-xs hover:border-cyan-500/40 transition-colors text-slate-700 dark:text-slate-300"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* CTA Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <a
              href="#projects"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white dark:from-cyan-500 dark:to-teal-500 dark:text-gray-950 shadow-md shadow-cyan-600/15 dark:shadow-cyan-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {t.hero.exploreProjects}
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm theme-surface hover:opacity-80 transition-all border theme-border shadow-sm"
              style={{ color: "var(--text-primary)" }}
            >
              <Mail className="w-4 h-4 text-cyan-700 dark:text-cyan-400" />
              {t.hero.contactMe}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
