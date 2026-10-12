"use client";

import { Mail, ArrowUpRight, Heart } from "lucide-react";
import { useApp } from "@/lib/AppContext";
import { data } from "@/lib/data";

export function Contact() {
  const { t } = useApp();

  return (
    <footer id="contact" className="py-20 border-t theme-border theme-surface-subtle relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-8 relative">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 text-xs font-mono">
            <Mail className="w-3.5 h-3.5" />
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
            href={data.profile.socialLinks.find((s) => s.name === "GitHub")?.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl theme-surface border theme-border hover:border-cyan-500/40 transition-all text-xs font-mono shadow-sm hover:opacity-90"
            style={{ color: "var(--text-primary)" }}
          >
            GitHub Profile
            <ArrowUpRight className="w-3.5 h-3.5 text-cyan-500" />
          </a>

          <a
            href={data.profile.socialLinks.find((s) => s.name === "LinkedIn")?.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl theme-surface border theme-border hover:border-cyan-500/40 transition-all text-xs font-mono shadow-sm hover:opacity-90"
            style={{ color: "var(--text-primary)" }}
          >
            LinkedIn Profile
            <ArrowUpRight className="w-3.5 h-3.5 text-cyan-500" />
          </a>

          <a
            href={data.profile.socialLinks.find((s) => s.name === "CakeResume")?.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl theme-surface border theme-border hover:border-cyan-500/40 transition-all text-xs font-mono shadow-sm hover:opacity-90"
            style={{ color: "var(--text-primary)" }}
          >
            CakeResume
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
