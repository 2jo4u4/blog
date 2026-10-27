import { Code2, Server, Terminal, Bot } from "./Icons";
import { SectionBadge } from "./SectionBadge";
import { data } from "../lib/data";

export interface SkillsProps {
  t: any;
}

export function Skills({ t }: SkillsProps) {
  const categoryIcons = [Code2, Server, Terminal, Bot];

  return (
    <section id="skills" className="py-20 theme-surface-subtle border-t theme-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="mb-12">
          <SectionBadge icon={Terminal} label={t.skills.badge} className="mb-3" />
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight" style={{ color: "var(--text-primary)" }}>
            {t.skills.title}
          </h2>
          <p className="text-sm mt-2 max-w-xl theme-text-secondary">
            {t.skills.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {data.skillCategories.map((cat, idx) => {
            const Icon = categoryIcons[idx] || Code2;
            return (
              <div
                key={cat.category}
                className="p-6 rounded-2xl theme-surface border theme-border hover:border-cyan-500/40 transition-all flex flex-col justify-between shadow-sm"
              >
                <div>
                  <div className="flex items-center gap-2.5 mb-4 text-cyan-500">
                    <div className="p-2 rounded-lg bg-cyan-500/10">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>
                      {cat.category}
                    </h3>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {cat.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2.5 py-1 rounded-md text-xs font-mono theme-surface-subtle border theme-border hover:border-cyan-500/30 transition-colors"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
