"use client";

import { ApiDoc } from "@/data/api-docs";

interface ApiCardProps {
    api: ApiDoc;
    isActive: boolean;
    onClick: () => void;
}

export function ApiCard({ api, isActive, onClick }: ApiCardProps) {
    return (
        <button
            onClick={onClick}
            className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 ${isActive
                ? "bg-gradient-to-br from-[rgba(30,184,255,0.15)] to-[rgba(139,92,246,0.1)] border-[rgba(72,213,255,0.3)] shadow-[0_0_30px_rgba(30,184,255,0.15)]"
                : "bg-[rgba(2,6,23,0.5)] border-[rgba(72,213,255,0.1)] hover:border-[rgba(72,213,255,0.2)]"
                }`}
        >
            <div className="flex items-center justify-between mb-2">
                <h3 className={`font-semibold ${isActive ? "text-[var(--color-turkish-blue-300)]" : "text-[var(--text-primary)]"}`}>
                    {api.title}
                </h3>
                {isActive && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
            </div>
            <p className="text-sm text-[var(--text-muted)]">{api.subtitle}</p>
        </button>
    );
}
