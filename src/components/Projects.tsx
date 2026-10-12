"use client";

import Image from "next/image";
import { ExternalLink, CheckCircle2, Layers, Cpu, Sparkles } from "lucide-react";
import { useApp } from "@/lib/AppContext";
import { data } from "@/lib/data";

export function Projects() {
  const { t } = useApp();
  const rawProjects = data.projects;

  return (
    <section id="projects" className="py-20 md:py-28 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 text-xs font-mono mb-3">
              <Layers className="w-3.5 h-3.5" />
              <span>{t.projects.badge}</span>
            </div>
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
          
          {/* Bento Item 1: Optoma Whiteboard */}
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
                        {item.company} • {item.period}
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
                      {item.highlights.map((h, i) => (
                        <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm theme-text-secondary">
                          <CheckCircle2 className="w-4 h-4 text-cyan-500 mt-0.5 shrink-0" />
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 pt-2">
                      {raw.tags.map((tag) => (
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
                          {t.projects.viewLive}
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Screenshot */}
                  <div className="lg:col-span-5">
                    <div className="relative rounded-2xl overflow-hidden border theme-border shadow-2xl bg-gray-900 group-hover:scale-[1.02] transition-transform">
                      <Image
                        src="/images/projects/creative-board.png"
                        alt={item.title}
                        width={1280}
                        height={800}
                        className="w-full h-auto object-cover"
                      />
                    </div>
                  </div>

                </div>
              </div>
            );
          })()}

          {/* Bento Item 2: Infrastructure & Performance */}
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
                    {item.highlights.map((h, i) => (
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
                    {raw.tags.map((tag) => (
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

          {/* Bento Item 3: Web Audio Equalizer */}
          {(() => {
            const raw = rawProjects.find((item) => item.id === "web-audio-equalizer");
            const item = t.projects.items.equalizer;
            if (!raw || !item) return null;
            return (
              <div className="lg:col-span-6 rounded-3xl theme-surface border theme-border hover:border-cyan-500/30 transition-all p-6 sm:p-8 shadow-xl flex flex-col justify-between group">
                <div className="space-y-4">
                  <div className="relative rounded-xl overflow-hidden border theme-border bg-gray-900 mb-4">
                    <Image
                      src="/images/projects/equalizer.png"
                      alt={item.title}
                      width={1280}
                      height={800}
                      className="w-full h-48 object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono text-cyan-500">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{t.projects.sideProjectBadge}</span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold group-hover:text-cyan-500 transition-colors" style={{ color: "var(--text-primary)" }}>
                    {item.title}
                  </h3>

                  <p className="text-xs sm:text-sm leading-relaxed theme-text-secondary">
                    {item.summary}
                  </p>

                  <div className="space-y-2 pt-1">
                    {item.highlights.map((h, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs theme-text-secondary">
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-500 mt-0.5 shrink-0" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 space-y-4">
                  <div className="flex flex-wrap gap-1.5">
                    {raw.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded text-[11px] font-mono theme-surface-subtle border theme-border"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {raw.links?.store && (
                    <a
                      href={raw.links.store}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-500 hover:opacity-80 transition-opacity"
                    >
                      {t.projects.viewStore}
                    </a>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Bento Item 4: Vegeking E-commerce */}
          {(() => {
            const raw = rawProjects.find((item) => item.id === "vegeking-ecommerce");
            const item = t.projects.items.vegeking;
            if (!raw || !item) return null;
            return (
              <div className="lg:col-span-6 rounded-3xl theme-surface border theme-border hover:border-cyan-500/30 transition-all p-6 sm:p-8 shadow-xl flex flex-col justify-between group">
                <div className="space-y-4">
                  <div className="relative rounded-xl overflow-hidden border theme-border bg-gray-900 mb-4">
                    <Image
                      src="/images/projects/vegeking.png"
                      alt={item.title}
                      width={1280}
                      height={800}
                      className="w-full h-48 object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono text-cyan-500">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{t.projects.commercialBadge}</span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold group-hover:text-cyan-500 transition-colors" style={{ color: "var(--text-primary)" }}>
                    {item.title}
                  </h3>

                  <p className="text-xs sm:text-sm leading-relaxed theme-text-secondary">
                    {item.summary}
                  </p>

                  <div className="space-y-2 pt-1">
                    {item.highlights.map((h, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs theme-text-secondary">
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-500 mt-0.5 shrink-0" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 space-y-4">
                  <div className="flex flex-wrap gap-1.5">
                    {raw.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded text-[11px] font-mono theme-surface-subtle border theme-border"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {raw.links?.live && (
                    <a
                      href={raw.links.live}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-500 hover:opacity-80 transition-opacity"
                    >
                      {t.projects.viewShop}
                    </a>
                  )}
                </div>
              </div>
            );
          })()}

        </div>
      </div>
    </section>
  );
}
