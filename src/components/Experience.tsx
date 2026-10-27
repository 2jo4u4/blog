import { Briefcase, Calendar, GraduationCap, Building2 } from "./Icons";
import { SectionBadge } from "./SectionBadge";

export interface ExperienceProps {
  t: any;
}

export function Experience({ t }: ExperienceProps) {
  return (
    <section id="experience" className="py-20 md:py-28 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="mb-14 text-center">
          <SectionBadge icon={Briefcase} label={t.experience.badge} className="mb-3" />
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight" style={{ color: "var(--text-primary)" }}>
            {t.experience.title}
          </h2>
          <p className="text-sm mt-2 theme-text-secondary">
            {t.experience.subtitle}
          </p>
        </div>

        {/* Timeline */}
        <div className="relative border-l border-cyan-500/30 ml-4 sm:ml-8 space-y-10">
          {t.experience.items.map((exp: any, idx: number) => {
            const isRecent = idx < 2;
            return (
              <div key={idx} className="relative pl-6 sm:pl-8 group">
                {/* Timeline Dot */}
                <div
                  className={`absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-2 transition-all ${
                    isRecent
                      ? "bg-cyan-500 border-cyan-300 shadow-md shadow-cyan-500/50"
                      : "bg-gray-800 border-gray-600 group-hover:border-cyan-400"
                  }`}
                />

                {/* Experience Card */}
                <div
                  className={`p-6 rounded-2xl transition-all ${
                    isRecent
                      ? "theme-surface border border-cyan-500/30 shadow-xl"
                      : "theme-surface-subtle border theme-border hover:border-cyan-500/30"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                    <h3 className="text-lg font-bold group-hover:text-cyan-500 transition-colors" style={{ color: "var(--text-primary)" }}>
                      {exp.role}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs font-mono text-cyan-500">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{exp.period}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-medium theme-text-secondary mb-3">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>{exp.company}</span>
                  </div>

                  <p className="text-sm leading-relaxed theme-text-secondary">
                    {exp.summary}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Education Box */}
        <div className="mt-14 p-6 rounded-2xl theme-surface border theme-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-500">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>
                {t.experience.education.school}
              </h4>
              <p className="text-xs theme-text-secondary">
                {t.experience.education.department}
              </p>
            </div>
          </div>
          <div className="text-xs font-mono text-cyan-500">
            {t.experience.education.period}
          </div>
        </div>
      </div>
    </section>
  );
}
