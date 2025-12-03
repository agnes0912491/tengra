"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import type React from "react";

export type NavItem = {
  href: string;
  label: string;
  description?: string;
  Icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

export default function SidebarItem({ item, isActive }: { item: NavItem; isActive: boolean }) {
  const Icon = item.Icon;
  return (
    <Link
      href={item.href}
      className={cn(
        "group relative flex flex-col rounded-xl border border-transparent px-3 py-2 transition",
        isActive
          ? "border-[rgba(110,211,225,0.35)] bg-[rgba(8,28,38,0.75)]"
          : "hover:border-[rgba(110,211,225,0.22)] hover:bg-[rgba(8,28,38,0.5)]"
      )}
      aria-current={isActive ? "page" : undefined}
    >
      <div className="relative">
        <div className="flex items-start gap-3">
          <div className={cn(
            "mt-0.5 flex h-8 w-8 items-center justify-center",
            isActive ? "bg-[rgba(0,167,197,0.12)] shadow-[0_0_14px_rgba(0,167,197,0.35)]" : "bg-transparent"
          )}>
            {Icon ? <Icon className="h-4 w-4 text-[color:var(--color-turkish-blue-200)]" /> : null}
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-medium text-white">
              {item.label}
            </span>
            {item.description ? (
              <span className="mt-0.5 text-[11px] text-[rgba(255,255,255,0.65)]">
                {item.description}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </Link>
  );
}
