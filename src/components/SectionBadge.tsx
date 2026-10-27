import type { IconProps } from "./Icons";

export interface SectionBadgeProps {
  icon: (props: IconProps) => any;
  label: string;
  className?: string;
}

export function SectionBadge({ icon: Icon, label, className = "" }: SectionBadgeProps) {
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50/80 border border-cyan-200 text-cyan-900 dark:bg-cyan-500/10 dark:border-cyan-500/20 dark:text-cyan-400 text-xs font-mono font-medium shadow-2xs ${className}`}
    >
      <Icon className="w-3.5 h-3.5 text-cyan-700 dark:text-cyan-400 shrink-0" />
      <span>{label}</span>
    </div>
  );
}
