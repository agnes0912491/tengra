"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type AdminCardVariant = "default" | "elevated" | "bordered" | "glass";

interface AdminCardProps {
    children: ReactNode;
    variant?: AdminCardVariant;
    className?: string;
    padding?: "none" | "sm" | "md" | "lg";
    hover?: boolean;
}

const variantStyles: Record<AdminCardVariant, string> = {
    default: "bg-[rgba(12,24,36,0.8)] border-[rgba(72,213,255,0.08)]",
    elevated: "bg-[rgba(15,31,54,0.9)] border-[rgba(72,213,255,0.12)] shadow-[0_8px_32px_rgba(0,0,0,0.4)]",
    bordered: "bg-transparent border-[rgba(72,213,255,0.2)]",
    glass: "bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)] backdrop-blur-xl",
};

const paddingStyles = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
};

export function AdminCard({
    children,
    variant = "default",
    className,
    padding = "md",
    hover = false,
}: AdminCardProps) {
    return (
        <div
            className={cn(
                "rounded-2xl border transition-all duration-200",
                variantStyles[variant],
                paddingStyles[padding],
                hover && "hover:border-[rgba(72,213,255,0.25)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.5)]",
                className
            )}
        >
            {children}
        </div>
    );
}

interface AdminCardHeaderProps {
    title: string;
    description?: string;
    action?: ReactNode;
    className?: string;
}

export function AdminCardHeader({ title, description, action, className }: AdminCardHeaderProps) {
    return (
        <div className={cn("flex items-start justify-between gap-4 mb-4", className)}>
            <div>
                <h3 className="text-lg font-semibold text-white">{title}</h3>
                {description && (
                    <p className="text-sm text-[rgba(255,255,255,0.5)] mt-0.5">{description}</p>
                )}
            </div>
            {action && <div className="shrink-0">{action}</div>}
        </div>
    );
}

interface AdminCardContentProps {
    children: ReactNode;
    className?: string;
}

export function AdminCardContent({ children, className }: AdminCardContentProps) {
    return <div className={cn("text-[rgba(255,255,255,0.85)]", className)}>{children}</div>;
}

// Stat Card variant
interface AdminStatCardProps {
    label: string;
    value: string | number;
    sublabel?: string;
    icon?: ReactNode;
    trend?: { value: number; positive: boolean };
    tone?: "default" | "success" | "warning" | "danger" | "info";
}

const toneColors = {
    default: "text-white",
    success: "text-emerald-400",
    warning: "text-amber-400",
    danger: "text-red-400",
    info: "text-[rgba(130,226,255,0.95)]",
};

const toneGlow = {
    default: "",
    success: "shadow-[0_0_20px_rgba(16,185,129,0.15)]",
    warning: "shadow-[0_0_20px_rgba(245,158,11,0.15)]",
    danger: "shadow-[0_0_20px_rgba(239,68,68,0.15)]",
    info: "shadow-[0_0_20px_rgba(72,213,255,0.15)]",
};

export function AdminStatCard({
    label,
    value,
    sublabel,
    icon,
    trend,
    tone = "default",
}: AdminStatCardProps) {
    return (
        <AdminCard variant="elevated" className={cn("relative overflow-hidden", toneGlow[tone])}>
            <div className="flex items-start justify-between">
                <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.2em] text-[rgba(255,255,255,0.5)]">{label}</p>
                    <p className={cn("text-3xl font-bold", toneColors[tone])}>{value}</p>
                    {sublabel && (
                        <p className="text-xs text-[rgba(255,255,255,0.45)] line-clamp-1">{sublabel}</p>
                    )}
                    {trend && (
                        <p
                            className={cn(
                                "text-xs font-medium flex items-center gap-1",
                                trend.positive ? "text-emerald-400" : "text-red-400"
                            )}
                        >
                            <span>{trend.positive ? "↑" : "↓"}</span>
                            {Math.abs(trend.value)}%
                        </p>
                    )}
                </div>
                {icon && (
                    <div className="p-3 rounded-xl bg-[rgba(72,213,255,0.08)] text-[rgba(130,226,255,0.8)]">
                        {icon}
                    </div>
                )}
            </div>
            {/* Decorative gradient */}
            <div className="absolute -bottom-8 -right-8 w-24 h-24 rounded-full bg-gradient-to-br from-[rgba(72,213,255,0.1)] to-transparent blur-2xl pointer-events-none" />
        </AdminCard>
    );
}
