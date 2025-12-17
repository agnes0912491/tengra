"use client";

import { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, forwardRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

// Input
interface AdminInputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    hint?: string;
    icon?: ReactNode;
}

export const AdminInput = forwardRef<HTMLInputElement, AdminInputProps>(
    ({ label, error, hint, icon, className, ...props }, ref) => {
        return (
            <div className="space-y-1.5">
                {label && (
                    <label className="block text-xs font-medium text-[rgba(255,255,255,0.6)] ml-0.5">
                        {label}
                    </label>
                )}
                <div className="relative">
                    {icon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgba(255,255,255,0.4)]">
                            {icon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        className={cn(
                            "w-full rounded-xl border bg-[rgba(8,18,26,0.8)] px-4 py-2.5 text-sm text-white",
                            "placeholder:text-[rgba(255,255,255,0.35)]",
                            "border-[rgba(72,213,255,0.15)] focus:border-[rgba(72,213,255,0.4)] focus:ring-1 focus:ring-[rgba(72,213,255,0.2)]",
                            "transition-all outline-none",
                            error && "border-red-500/50 focus:border-red-500/70 focus:ring-red-500/20",
                            icon && "pl-10",
                            className
                        )}
                        {...props}
                    />
                </div>
                {error && <p className="text-xs text-red-400 ml-0.5">{error}</p>}
                {hint && !error && <p className="text-xs text-[rgba(255,255,255,0.4)] ml-0.5">{hint}</p>}
            </div>
        );
    }
);
AdminInput.displayName = "AdminInput";

// Textarea
interface AdminTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    hint?: string;
}

export const AdminTextarea = forwardRef<HTMLTextAreaElement, AdminTextareaProps>(
    ({ label, error, hint, className, ...props }, ref) => {
        return (
            <div className="space-y-1.5">
                {label && (
                    <label className="block text-xs font-medium text-[rgba(255,255,255,0.6)] ml-0.5">
                        {label}
                    </label>
                )}
                <textarea
                    ref={ref}
                    className={cn(
                        "w-full rounded-xl border bg-[rgba(8,18,26,0.8)] px-4 py-3 text-sm text-white resize-y min-h-[100px]",
                        "placeholder:text-[rgba(255,255,255,0.35)]",
                        "border-[rgba(72,213,255,0.15)] focus:border-[rgba(72,213,255,0.4)] focus:ring-1 focus:ring-[rgba(72,213,255,0.2)]",
                        "transition-all outline-none",
                        error && "border-red-500/50 focus:border-red-500/70 focus:ring-red-500/20",
                        className
                    )}
                    {...props}
                />
                {error && <p className="text-xs text-red-400 ml-0.5">{error}</p>}
                {hint && !error && <p className="text-xs text-[rgba(255,255,255,0.4)] ml-0.5">{hint}</p>}
            </div>
        );
    }
);
AdminTextarea.displayName = "AdminTextarea";

// Select
interface AdminSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options: { value: string; label: string }[];
    placeholder?: string;
}

export const AdminSelect = forwardRef<HTMLSelectElement, AdminSelectProps>(
    ({ label, error, options, placeholder, className, ...props }, ref) => {
        return (
            <div className="space-y-1.5">
                {label && (
                    <label className="block text-xs font-medium text-[rgba(255,255,255,0.6)] ml-0.5">
                        {label}
                    </label>
                )}
                <select
                    ref={ref}
                    className={cn(
                        "w-full rounded-xl border bg-[rgba(8,18,26,0.8)] px-4 py-2.5 text-sm text-white",
                        "border-[rgba(72,213,255,0.15)] focus:border-[rgba(72,213,255,0.4)] focus:ring-1 focus:ring-[rgba(72,213,255,0.2)]",
                        "transition-all outline-none appearance-none cursor-pointer",
                        "bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23999%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22M6%209l6%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px] bg-[right_12px_center] bg-no-repeat pr-10",
                        error && "border-red-500/50",
                        className
                    )}
                    {...props}
                >
                    {placeholder && (
                        <option value="" disabled>
                            {placeholder}
                        </option>
                    )}
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
                {error && <p className="text-xs text-red-400 ml-0.5">{error}</p>}
            </div>
        );
    }
);
AdminSelect.displayName = "AdminSelect";

// Switch/Toggle
interface AdminSwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label?: string;
    disabled?: boolean;
}

export function AdminSwitch({ checked, onChange, label, disabled }: AdminSwitchProps) {
    return (
        <label
            className={cn(
                "inline-flex items-center gap-3 cursor-pointer",
                disabled && "opacity-50 cursor-not-allowed"
            )}
        >
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                disabled={disabled}
                onClick={() => !disabled && onChange(!checked)}
                className={cn(
                    "relative w-11 h-6 rounded-full transition-colors",
                    checked ? "bg-[rgba(72,213,255,0.5)]" : "bg-[rgba(255,255,255,0.15)]"
                )}
            >
                <span
                    className={cn(
                        "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform",
                        checked && "translate-x-5"
                    )}
                />
            </button>
            {label && <span className="text-sm text-[rgba(255,255,255,0.8)]">{label}</span>}
        </label>
    );
}

// Checkbox
interface AdminCheckboxProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label?: string;
    disabled?: boolean;
}

export function AdminCheckbox({ checked, onChange, label, disabled }: AdminCheckboxProps) {
    return (
        <label
            className={cn(
                "inline-flex items-center gap-2.5 cursor-pointer",
                disabled && "opacity-50 cursor-not-allowed"
            )}
        >
            <button
                type="button"
                role="checkbox"
                aria-checked={checked}
                disabled={disabled}
                onClick={() => !disabled && onChange(!checked)}
                className={cn(
                    "w-5 h-5 rounded-md border flex items-center justify-center transition-all",
                    checked
                        ? "bg-[rgba(72,213,255,0.6)] border-[rgba(72,213,255,0.8)]"
                        : "bg-transparent border-[rgba(255,255,255,0.25)] hover:border-[rgba(255,255,255,0.4)]"
                )}
            >
                {checked && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                )}
            </button>
            {label && <span className="text-sm text-[rgba(255,255,255,0.8)]">{label}</span>}
        </label>
    );
}

// Badge / Tag
interface AdminBadgeProps {
    children: ReactNode;
    variant?: "default" | "success" | "warning" | "danger" | "info";
    size?: "sm" | "md";
    className?: string;
}

const badgeVariants = {
    default: "bg-[rgba(255,255,255,0.08)] text-[rgba(255,255,255,0.7)] border-[rgba(255,255,255,0.12)]",
    success: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
    warning: "bg-amber-500/15 text-amber-300 border-amber-500/25",
    danger: "bg-red-500/15 text-red-300 border-red-500/25",
    info: "bg-[rgba(72,213,255,0.15)] text-[rgba(130,226,255,0.95)] border-[rgba(72,213,255,0.25)]",
};

export function AdminBadge({ children, variant = "default", size = "sm", className }: AdminBadgeProps) {
    return (
        <span
            className={cn(
                "inline-flex items-center gap-1 rounded-full border font-medium",
                size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs",
                badgeVariants[variant],
                className
            )}
        >
            {children}
        </span>
    );
}
