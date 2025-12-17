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

export default function SidebarItem({ item, isActive, collapsed = false }: { item: NavItem; isActive: boolean; collapsed?: boolean }) {
  const Icon = item.Icon;
  return (
    <Link
      href={item.href}
      className={cn(
        "group relative flex items-center rounded-xl transition-all duration-200",
        collapsed ? "justify-center p-2.5" : "gap-3 px-4 py-3",
        isActive
          ? "bg-gradient-to-r from-[rgba(30,184,255,0.15)] to-[rgba(30,184,255,0.05)] border border-[rgba(72,213,255,0.25)] shadow-[0_4px_15px_rgba(30,184,255,0.1)]"
          : "border border-transparent hover:bg-[rgba(30,184,255,0.08)] hover:border-[rgba(72,213,255,0.15)]"
      )}
      aria-current={isActive ? "page" : undefined}
      title={collapsed ? item.label : undefined}
    >
      <div
        className={cn(
          "flex items-center justify-center rounded-lg transition-all duration-200",
          collapsed ? "h-10 w-10" : "h-9 w-9",
          isActive
            ? "bg-gradient-to-br from-[var(--color-turkish-blue-500)] to-[var(--color-turkish-blue-600)] shadow-[0_4px_12px_rgba(30,184,255,0.3)]"
            : "bg-[rgba(30,184,255,0.1)] group-hover:bg-[rgba(30,184,255,0.15)]"
        )}
      >
        {Icon ? (
          <Icon
            className={cn(
              "transition-colors",
              collapsed ? "h-5 w-5" : "h-4 w-4",
              isActive ? "text-white" : "text-[var(--color-turkish-blue-300)]"
            )}
          />
        ) : null}
      </div>
      {!collapsed && (
        <div className="flex min-w-0 flex-col">
          <span
            className={cn(
              "truncate text-sm font-medium transition-colors",
              isActive ? "text-[var(--color-turkish-blue-300)]" : "text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]"
            )}
          >
            {item.label}
          </span>
          {item.description ? (
            <span className="mt-0.5 truncate text-[11px] text-[var(--text-muted)]">
              {item.description}
            </span>
          ) : null}
        </div>
      )}

      {/* Active indicator */}
      {isActive && !collapsed && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-gradient-to-b from-[var(--color-turkish-blue-400)] to-[var(--color-turkish-blue-500)]" />
      )}
    </Link>
  );
}
