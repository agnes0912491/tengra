"use client";

import type { ReactNode } from "react";

type Props = {
  title: string;
  right?: ReactNode;
  children: ReactNode;
  className?: string;
};

export default function ChartCard({ title, right, children, className }: Props) {
  return (
    <div className={["relative rounded-3xl p-[1px] bg-gradient-to-br from-[rgba(110,211,225,0.25)]/30 via-transparent to-transparent", className].filter(Boolean).join(" ")}> 
      <div className="rounded-[calc(1.5rem-1px)] border border-[rgba(110,211,225,0.18)] bg-[rgba(6,20,27,0.65)]/80 p-6 shadow-[0_25px_70px_rgba(0,0,0,0.45)] backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-[color:var(--color-turkish-blue-200)]">{title}</h3>
          {right}
        </div>
        {children}
      </div>
    </div>
  );
}
