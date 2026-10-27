import { Mail, ArrowUpRight, Heart } from "./Icons";
import { data } from "../lib/data";

export interface ContactProps {
  t: any;
}

export function Contact({ t }: ContactProps) {
  const githubLink = data.profile.socialLinks.find((s) => s.name === "GitHub")?.url || "https://github.com/2jo4u4";
  const linkedInLink = data.profile.socialLinks.find((s) => s.name === "LinkedIn")?.url || "https://www.linkedin.com/in/huang-jay";
  const cakeLink = data.profile.socialLinks.find((s) => s.name === "CakeResume")?.url || "https://www.cake.me/me/HuangJay";

  return (
    <footer id="contact" className="py-20 border-t theme-border theme-surface-subtle relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-8 relative">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50/80 border border-cyan-200 text-cyan-800 dark:bg-cyan-500/10 dark:border-cyan-500/20 dark:text-cyan-400 text-xs font-mono">
            <Mail className="w-3.5 h-3.5 text-cyan-700 dark:text-cyan-400" />
            <span>{t.contact.badge}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight" style={{ color: "var(--text-primary)" }}>
            {t.contact.title}
          </h2>
          <p className="text-sm sm:text-base max-w-lg mx-auto theme-text-secondary">
            {t.contact.subtitle}
          </p>
        </div>

        {/* Email Big Button */}
        <div>
          <a
            href="mailto:2jo4u4@gmail.com"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-base sm:text-lg bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 text-gray-950 shadow-xl shadow-cyan-500/20 hover:scale-105 active:scale-95 transition-all"
          >
            <Mail className="w-5 h-5" />
            <span>2jo4u4@gmail.com</span>
          </a>
        </div>

        {/* Social Links Grid */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <a
            href={githubLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl theme-surface border theme-border hover:border-cyan-500/40 transition-all text-xs font-mono shadow-sm hover:opacity-90"
            style={{ color: "var(--text-primary)" }}
          >
            <span>GitHub Profile</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-cyan-500" />
          </a>

          <a
            href={linkedInLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl theme-surface border theme-border hover:border-cyan-500/40 transition-all text-xs font-mono shadow-sm hover:opacity-90"
            style={{ color: "var(--text-primary)" }}
          >
            <span>LinkedIn Profile</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-cyan-500" />
          </a>

          <a
            href={cakeLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl theme-surface border theme-border hover:border-cyan-500/40 transition-all text-xs font-mono shadow-sm hover:opacity-90"
            style={{ color: "var(--text-primary)" }}
          >
            <span>CakeResume</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-cyan-500" />
          </a>
        </div>

        {/* Copyright */}
        <div className="pt-12 text-xs font-mono theme-text-secondary flex items-center justify-center gap-1">
          <span>{t.contact.designedWith}</span>
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
          <span>{t.contact.by}</span>
        </div>
      </div>
    </footer>
  );
}
