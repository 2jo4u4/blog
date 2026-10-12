"use client";

import { Zap, Cpu, History, Users } from "lucide-react";
import { useApp } from "@/lib/AppContext";

export function Metrics() {
  const { t } = useApp();
  const icons = [Zap, Cpu, History, Users];

  return (
    <section id="metrics" className="py-12 border-y theme-border theme-surface-subtle">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {t.metrics.items.map((metric, idx) => {
            const Icon = icons[idx] || Zap;
            return (
              <div
                key={metric.label}
                className="relative p-6 rounded-2xl theme-surface border theme-border hover:border-cyan-500/40 transition-all group shadow-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono theme-text-secondary">{metric.label}</span>
                  <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-500 group-hover:scale-110 transition-transform">
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                <div className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 mb-2">
                  {metric.value}
                </div>

                <p className="text-xs theme-text-secondary leading-normal">
                  {metric.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
