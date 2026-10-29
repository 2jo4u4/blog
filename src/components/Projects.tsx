import { Layers, CheckCircle2, Cpu, Sparkles, Bot, Gamepad2, ExternalLink, Database } from "./Icons";
import { SectionBadge } from "./SectionBadge";
import { data } from "../lib/data";

export interface ProjectsProps {
  t: any;
}

export function Projects({ t }: ProjectsProps) {
  const rawProjects = data.projects;

  return (
    <section id="projects" className="py-20 md:py-28 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <SectionBadge icon={Layers} label={t.projects.badge} className="mb-3" />
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight" style={{ color: "var(--text-primary)" }}>
              {t.projects.title}
            </h2>
          </div>
          <p className="text-sm max-w-md theme-text-secondary">
            {t.projects.subtitle}
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Bento Item 1: SoundCraft EQ (Web Audio Equalizer) (Span 12) */}
          {(() => {
            const raw = rawProjects.find((item) => item.id === "soundcraft-eq" || item.id === "web-audio-equalizer");
            const item = t.projects.items.equalizer;
            if (!raw || !item) return null;
            return (
              <div className="lg:col-span-12 rounded-3xl theme-surface border theme-border hover:border-cyan-500/40 transition-all p-6 sm:p-8 lg:p-10 shadow-2xl relative overflow-hidden group">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  
                  {/* Left Column: Details */}
                  <div className="lg:col-span-7 space-y-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-cyan-500/20 text-cyan-800 dark:text-cyan-400 border border-cyan-500/40 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-cyan-700 dark:text-cyan-400" />
                        {t.projects.sideProjectBadge}
                      </span>
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20">
                        {t.projects.dualPlatformBadge}
                      </span>
                      <span className="text-xs font-mono theme-text-secondary">
                        {item.period}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-2xl sm:text-3xl font-bold mb-1 group-hover:text-cyan-700 dark:group-hover:text-cyan-400 transition-colors" style={{ color: "var(--text-primary)" }}>
                        {item.title}
                      </h3>
                      <p className="text-cyan-800 dark:text-cyan-400 font-medium text-sm sm:text-base">
                        {item.subtitle}
                      </p>
                    </div>

                    <p className="text-sm sm:text-base leading-relaxed theme-text-secondary">
                      {item.summary}
                    </p>

                    {/* Highlights */}
                    <div className="space-y-2.5 pt-2">
                      {item.highlights.map((h: string, i: number) => (
                        <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm theme-text-secondary">
                          <CheckCircle2 className="w-4 h-4 text-cyan-700 dark:text-cyan-400 mt-0.5 shrink-0" />
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 pt-2">
                      {raw.tags.map((tag: string) => (
                        <span
                          key={tag}
                          className="px-2.5 py-1 rounded-lg text-xs font-mono theme-surface-subtle border theme-border"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Action CTAs */}
                    <div className="flex flex-wrap items-center gap-3 pt-3">
                      {raw.links?.chrome && (
                        <a
                          href={raw.links.chrome}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 hover:from-cyan-700 hover:via-teal-700 hover:to-emerald-700 text-white dark:from-cyan-500 dark:via-teal-400 dark:to-emerald-400 dark:text-gray-950 hover:scale-105 active:scale-95 transition-all shadow-md shadow-slate-900/10 dark:shadow-cyan-500/25"
                        >
                          {t.projects.viewStoreChrome}
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      <div className="inline-flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-mono font-medium theme-surface border theme-border text-slate-700 dark:text-slate-300">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                        <span>{t.projects.viewStoreFirefox}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Screenshot Showcase */}
                  <div className="lg:col-span-5 space-y-4">
                    <div className="relative rounded-2xl overflow-hidden border theme-border shadow-2xl bg-gray-900 group-hover:scale-[1.02] transition-transform">
                      <img
                        src={raw.image || "/images/projects/soundcraft-eq.png"}
                        alt={item.title}
                        width={1280}
                        height={800}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-auto object-cover"
                      />
                    </div>
                    <div className="relative rounded-xl overflow-hidden border theme-border shadow-md bg-gray-900 opacity-90 hover:opacity-100 transition-opacity">
                      <img
                        src="/images/projects/03_inpage_picker_overlay.png"
                        alt="SoundCraft EQ In-Page Media Picker"
                        width={1280}
                        height={800}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-auto object-cover"
                      />
                    </div>
                  </div>

                </div>
              </div>
            );
          })()}

          {/* Bento Item 2: DreamCity (多人非對稱對抗 - 旗艦主打, Span 12) */}
          {(() => {
            const raw = rawProjects.find((item) => item.id === "dreamcity");
            const item = t.projects.items.dreamcity;
            if (!raw || !item) return null;
            return (
              <div className="lg:col-span-12 rounded-3xl theme-surface border border-cyan-500/30 hover:border-cyan-400/60 transition-all p-6 sm:p-8 lg:p-10 shadow-2xl relative overflow-hidden group">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  
                  {/* Left Column: Details */}
                  <div className="lg:col-span-7 space-y-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center gap-1">
                        <Gamepad2 className="w-3.5 h-3.5" />
                        {t.projects.featuredBadge}
                      </span>
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
                        <Bot className="w-3.5 h-3.5" />
                        {t.projects.aiAgentBadge}
                      </span>
                      <span className="text-xs font-mono theme-text-secondary">
                        {item.role} • {item.period}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-2xl sm:text-3xl font-bold mb-1 group-hover:text-cyan-400 transition-colors" style={{ color: "var(--text-primary)" }}>
                        {item.title}
                      </h3>
                      <p className="text-cyan-400 font-medium text-sm sm:text-base">
                        {item.subtitle}
                      </p>
                    </div>

                    <p className="text-sm sm:text-base leading-relaxed theme-text-secondary">
                      {item.summary}
                    </p>

                    {/* Highlights */}
                    <div className="space-y-2.5 pt-2">
                      {item.highlights.map((h: string, i: number) => (
                        <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm theme-text-secondary">
                          <CheckCircle2 className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 pt-2">
                      {raw.tags.map((tag: string) => (
                        <span
                          key={tag}
                          className="px-2.5 py-1 rounded-lg text-xs font-mono theme-surface-subtle border theme-border"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Live Play CTA */}
                    {raw.links?.live && (
                      <div className="pt-2">
                        <a
                          href={raw.links.live}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 hover:from-cyan-700 hover:via-teal-700 hover:to-emerald-700 text-white dark:from-cyan-500 dark:via-teal-400 dark:to-emerald-400 dark:text-gray-950 hover:scale-105 active:scale-95 transition-all shadow-md shadow-slate-900/10 dark:shadow-cyan-500/25"
                        >
                          {t.projects.viewLive}
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Screenshot */}
                  <div className="lg:col-span-5">
                    <div className="relative rounded-2xl overflow-hidden border theme-border shadow-2xl bg-gray-900 group-hover:scale-[1.02] transition-transform">
                      <img
                        src="/images/projects/dreamcity.png"
                        alt={item.title}
                        width={1280}
                        height={800}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-auto object-cover"
                      />
                    </div>
                  </div>

                </div>
              </div>
            );
          })()}

          {/* Bento Item 3: Infrastructure & Performance (Span 12) */}
          {(() => {
            const raw = rawProjects.find((item) => item.id === "infra-performance");
            const item = t.projects.items.infra;
            if (!raw || !item) return null;
            return (
              <div className="lg:col-span-12 rounded-3xl theme-surface border theme-border hover:border-emerald-500/40 transition-all p-6 sm:p-8 lg:p-10 shadow-2xl relative overflow-hidden group">
                <div className="space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold bg-emerald-500/20 text-emerald-500 border border-emerald-500/30">
                        {t.projects.infraBadge}
                      </span>
                      <span className="text-xs font-mono theme-text-secondary">
                        {item.period}
                      </span>
                    </div>
                    <span className="text-xs font-mono text-emerald-500">
                      {t.projects.infraTagline}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-2xl sm:text-3xl font-bold mb-1 group-hover:text-emerald-500 transition-colors" style={{ color: "var(--text-primary)" }}>
                      {item.title}
                    </h3>
                    <p className="font-medium text-sm sm:text-base theme-text-secondary">
                      {item.subtitle}
                    </p>
                  </div>

                  <p className="text-sm sm:text-base leading-relaxed theme-text-secondary">
                    {item.summary}
                  </p>

                  {/* 4 Performance Metric Pillars */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    {item.highlights.map((h: string, i: number) => (
                      <div
                        key={i}
                        className="p-4 rounded-xl theme-surface-subtle border theme-border hover:border-emerald-500/30 transition-colors space-y-1"
                      >
                        <div className="flex items-center gap-2 text-emerald-500 font-semibold text-xs font-mono">
                          <Cpu className="w-3.5 h-3.5" />
                          <span>Pillar {i + 1}</span>
                        </div>
                        <p className="text-xs sm:text-sm theme-text-secondary leading-relaxed">
                          {h}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {raw.tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 rounded-lg text-xs font-mono theme-surface-subtle border theme-border"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Bento Item 4: Optoma Whiteboard (Span 12) */}
          {(() => {
            const raw = rawProjects.find((item) => item.id === "creative-board");
            const item = t.projects.items.creativeBoard;
            if (!raw || !item) return null;
            return (
              <div className="lg:col-span-12 rounded-3xl theme-surface border theme-border hover:border-cyan-500/40 transition-all p-6 sm:p-8 lg:p-10 shadow-2xl relative overflow-hidden group">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  
                  {/* Left Column: Details */}
                  <div className="lg:col-span-7 space-y-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold bg-cyan-500/20 text-cyan-500 border border-cyan-500/30">
                        {t.projects.featuredBadge}
                      </span>
                      <span className="text-xs font-mono theme-text-secondary">
                        {item.period}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-2xl sm:text-3xl font-bold mb-1 group-hover:text-cyan-500 transition-colors" style={{ color: "var(--text-primary)" }}>
                        {item.title}
                      </h3>
                      <p className="text-cyan-500 font-medium text-sm sm:text-base">
                        {item.subtitle}
                      </p>
                    </div>

                    <p className="text-sm sm:text-base leading-relaxed theme-text-secondary">
                      {item.summary}
                    </p>

                    {/* Highlights */}
                    <div className="space-y-2.5 pt-2">
                      {item.highlights.map((h: string, i: number) => (
                        <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm theme-text-secondary">
                          <CheckCircle2 className="w-4 h-4 text-cyan-500 mt-0.5 shrink-0" />
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 pt-2">
                      {raw.tags.map((tag: string) => (
                        <span
                          key={tag}
                          className="px-2.5 py-1 rounded-lg text-xs font-mono theme-surface-subtle border theme-border"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Link */}
                    {raw.links?.live && (
                      <div className="pt-2">
                        <a
                          href={raw.links.live}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-gray-950 transition-all shadow-lg shadow-cyan-500/20"
                        >
                          {t.projects.viewLiveAuth}
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Screenshot */}
                  <div className="lg:col-span-5">
                    <div className="relative rounded-2xl overflow-hidden border theme-border shadow-2xl bg-gray-900 group-hover:scale-[1.02] transition-transform">
                      <img
                        src="/images/projects/creative-board.png"
                        alt={item.title}
                        width={1280}
                        height={800}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-auto object-cover"
                      />
                    </div>
                  </div>

                </div>
              </div>
            );
          })()}

          {/* Bento Item 5: Vegeking E-commerce (Span 12) */}
          {(() => {
            const raw = rawProjects.find((item) => item.id === "vegeking-ecommerce");
            const item = t.projects.items.vegeking;
            if (!raw || !item) return null;
            return (
              <div className="lg:col-span-12 rounded-3xl theme-surface border theme-border hover:border-cyan-500/30 transition-all p-6 sm:p-8 lg:p-10 shadow-2xl relative overflow-hidden group">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  
                  {/* Left Column: Details */}
                  <div className="lg:col-span-7 space-y-5">
                    <div className="flex items-center gap-2 text-xs font-mono text-cyan-700 dark:text-cyan-400">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{t.projects.commercialBadge}</span>
                    </div>

                    <div>
                      <h3 className="text-2xl sm:text-3xl font-bold mb-1 group-hover:text-cyan-700 dark:group-hover:text-cyan-400 transition-colors" style={{ color: "var(--text-primary)" }}>
                        {item.title}
                      </h3>
                      <p className="text-sm sm:text-base font-medium theme-text-secondary">
                        {item.subtitle}
                      </p>
                    </div>

                    <p className="text-sm sm:text-base leading-relaxed theme-text-secondary">
                      {item.summary}
                    </p>

                    <div className="space-y-2.5 pt-2">
                      {item.highlights.map((h: string, i: number) => (
                        <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm theme-text-secondary">
                          <CheckCircle2 className="w-4 h-4 text-cyan-700 dark:text-cyan-400 mt-0.5 shrink-0" />
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                      {raw.tags.map((tag: string) => (
                        <span
                          key={tag}
                          className="px-2.5 py-1 rounded-lg text-xs font-mono theme-surface-subtle border theme-border"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {raw.links?.live && (
                      <div className="pt-3">
                        <a
                          href={raw.links.live}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs sm:text-sm font-semibold theme-surface border theme-border hover:border-cyan-500/50 shadow-sm transition-all"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {t.projects.viewShop}
                          <ExternalLink className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Screenshot */}
                  <div className="lg:col-span-5">
                    <div className="relative rounded-2xl overflow-hidden border theme-border shadow-2xl bg-gray-900 group-hover:scale-[1.02] transition-transform">
                      <img
                        src="/images/projects/vegeking.png"
                        alt={item.title}
                        width={1280}
                        height={800}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-auto object-cover"
                      />
                    </div>
                  </div>

                </div>
              </div>
            );
          })()}

          {/* Bento Item 6: Retail Database & SQL Analytics (Span 12) */}
          {(() => {
            const raw = rawProjects.find((item) => item.id === "retail-db-analytics");
            const item = t.projects.items.retailDb;
            if (!raw || !item) return null;
            return (
              <div className="lg:col-span-12 rounded-3xl theme-surface border theme-border hover:border-cyan-500/30 transition-all p-6 sm:p-8 lg:p-10 shadow-2xl relative overflow-hidden group">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  
                  {/* Left Column: Details */}
                  <div className="lg:col-span-7 space-y-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-cyan-500/15 text-cyan-800 dark:text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5 shadow-2xs">
                        <Database className="w-3.5 h-3.5 text-cyan-700 dark:text-cyan-400" />
                        {t.projects.dbBadge || "Database Architecture"}
                      </span>
                      {item.period && (
                        <span className="text-xs font-mono theme-text-secondary">
                          {item.period}
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-2xl sm:text-3xl font-bold mb-1 group-hover:text-cyan-700 dark:group-hover:text-cyan-400 transition-colors" style={{ color: "var(--text-primary)" }}>
                        {item.title}
                      </h3>
                      <p className="text-sm sm:text-base font-medium theme-text-secondary">
                        {item.subtitle}
                      </p>
                    </div>

                    <p className="text-sm sm:text-base leading-relaxed theme-text-secondary">
                      {item.summary}
                    </p>

                    <div className="space-y-2.5 pt-2">
                      {item.highlights.map((h: string, i: number) => (
                        <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm theme-text-secondary">
                          <CheckCircle2 className="w-4 h-4 text-cyan-700 dark:text-cyan-400 mt-0.5 shrink-0" />
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                      {raw.tags.map((tag: string) => (
                        <span
                          key={tag}
                          className="px-2.5 py-1 rounded-lg text-xs font-mono theme-surface-subtle border theme-border"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Right Column: Schema Diagram & SQL Showcase */}
                  <div className="lg:col-span-5">
                    <div className="relative rounded-2xl overflow-hidden border theme-border shadow-2xl bg-gray-900 group-hover:scale-[1.02] transition-transform">
                      <img
                        src={raw.image || "/images/projects/retail-db-schema.png"}
                        alt={item.title}
                        width={1280}
                        height={800}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-auto object-cover"
                      />
                    </div>
                  </div>

                </div>
              </div>
            );
          })()}

        </div>
      </div>
    </section>
  );
}
