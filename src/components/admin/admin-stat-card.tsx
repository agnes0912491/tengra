import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  value: ReactNode;
  sublabel?: string;
  icon?: ReactNode;
  tone?: "default" | "success" | "warning" | "danger";
};

const toneClasses: Record<NonNullable<Props["tone"]>, string> = {
  default:
    "from-[rgba(8,32,41,0.7)] via-[rgba(6,24,33,0.65)] to-[rgba(2,14,19,0.7)]",
  success:
    "from-[rgba(12,52,40,0.75)] via-[rgba(10,68,56,0.7)] to-[rgba(2,20,18,0.75)]",
  warning:
    "from-[rgba(54,42,22,0.75)] via-[rgba(66,52,28,0.7)] to-[rgba(24,18,10,0.75)]",
  danger:
    "from-[rgba(54,20,24,0.75)] via-[rgba(72,26,30,0.7)] to-[rgba(28,10,12,0.75)]",
};

export default function AdminStatCard({
  label,
  value,
  sublabel,
  icon,
  tone = "default",
}: Props) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl border border-[rgba(110,211,225,0.16)] p-6",
        "shadow-[0_25px_70px_rgba(0,0,0,0.45)] backdrop-blur-xl",
        "bg-gradient-to-br",
        toneClasses[tone]
      )}
    >
      <div className="absolute -left-10 -top-10 h-36 w-36 rounded-full bg-[rgba(0,167,197,0.12)] blur-3xl" />
      <div className="relative flex items-center gap-4">
        {icon ? (
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[rgba(110,211,225,0.35)] bg-[rgba(0,167,197,0.12)] text-[color:var(--color-turkish-blue-300)]">
            {icon}
          </div>
        ) : null}
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-[rgba(255,255,255,0.55)]">{label}</p>
          <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
          {sublabel ? (
            <p className="mt-2 text-xs text-[rgba(255,255,255,0.55)]">{sublabel}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
