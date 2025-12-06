import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  value: ReactNode;
  sublabel?: string;
  icon?: ReactNode;
  tone?: "default" | "success" | "warning" | "danger";
};

const toneClasses: Record<NonNullable<Props["tone"]>, { bg: string; border: string; glow: string }> = {
  default: {
    bg: "bg-[rgba(15,31,54,0.6)]",
    border: "border-[rgba(72,213,255,0.12)]",
    glow: "bg-[radial-gradient(circle,rgba(30,184,255,0.15)_0%,transparent_70%)]",
  },
  success: {
    bg: "bg-[rgba(15,54,40,0.6)]",
    border: "border-[rgba(34,197,94,0.2)]",
    glow: "bg-[radial-gradient(circle,rgba(34,197,94,0.15)_0%,transparent_70%)]",
  },
  warning: {
    bg: "bg-[rgba(54,42,22,0.6)]",
    border: "border-[rgba(234,179,8,0.2)]",
    glow: "bg-[radial-gradient(circle,rgba(234,179,8,0.15)_0%,transparent_70%)]",
  },
  danger: {
    bg: "bg-[rgba(54,20,24,0.6)]",
    border: "border-[rgba(239,68,68,0.2)]",
    glow: "bg-[radial-gradient(circle,rgba(239,68,68,0.15)_0%,transparent_70%)]",
  },
};

const valueColors: Record<NonNullable<Props["tone"]>, string> = {
  default: "text-[var(--color-turkish-blue-300)]",
  success: "text-emerald-400",
  warning: "text-amber-400",
  danger: "text-red-400",
};

export default function AdminStatCard({
  label,
  value,
  sublabel,
  icon,
  tone = "default",
}: Props) {
  const { bg, border, glow } = toneClasses[tone];

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl p-6 backdrop-blur-xl",
        "shadow-[0_20px_50px_rgba(0,0,0,0.3),0_0_20px_rgba(30,184,255,0.05)]",
        "hover:shadow-[0_25px_60px_rgba(0,0,0,0.4),0_0_30px_rgba(30,184,255,0.08)]",
        "hover:-translate-y-0.5 transition-all duration-300",
        bg,
        border,
        "border"
      )}
    >
      {/* Glow effect */}
      <div className={cn("absolute -left-10 -top-10 h-32 w-32 rounded-full blur-3xl opacity-60", glow)} />

      <div className="relative flex items-start gap-4">
        {icon ? (
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[rgba(30,184,255,0.1)] border border-[rgba(72,213,255,0.2)] text-[var(--color-turkish-blue-300)]">
            {icon}
          </div>
        ) : null}
        <div className="flex-1">
          <p className="text-[11px] uppercase tracking-[0.15em] text-[var(--text-muted)] font-medium">
            {label}
          </p>
          <p className={cn("mt-2 text-3xl font-bold", valueColors[tone])}>
            {value}
          </p>
          {sublabel ? (
            <p className="mt-2 text-xs text-[var(--text-muted)] leading-relaxed">{sublabel}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
