"use client";

import { useEffect, useMemo, useState } from "react";
import type { Project } from "@/types/project";
import { getProjectStats, type ProjectStat } from "@/lib/db";
import Cookies from "js-cookie";
import { ADMIN_SESSION_COOKIE_CANDIDATES } from "@/lib/auth";
import { useTranslation } from "@tengra/language";
// glass select

type Props = {
    initialProjects: Project[];
};

export default function ProjectStatsViewer({ initialProjects }: Props) {
    const { t } = useTranslation("AdminProjects");
    const { language: locale } = useTranslation();
    const [selectedId, setSelectedId] = useState<string>(initialProjects[0]?.id || "");
    const [stats, setStats] = useState<ProjectStat[]>([]);
    const formatDate = (d: string) => {
        try {
            const date = new Date(d);
            return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(date);
        } catch {
            return d;
        }
    };

    const token = useMemo(() => {
        return ADMIN_SESSION_COOKIE_CANDIDATES.map((name) => Cookies.get(name)).find(Boolean) || "";
    }, []);

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            if (!selectedId) return;
            const s = await getProjectStats(selectedId, token).catch(() => []);
            if (!mounted) return;
            setStats(s);
        };
        load();
        const id = setInterval(load, 15000);
        return () => {
            mounted = false;
            clearInterval(id);
        };
    }, [selectedId, token]);

    const metrics = useMemo(() => {
        const m = new Set(stats.map((s) => s.metric));
        return Array.from(m.values());
    }, [stats]);

    const grouped = useMemo(() => {
        const map: Record<string, ProjectStat[]> = {};
        for (const s of stats) {
            if (!map[s.metric]) map[s.metric] = [];
            map[s.metric].push(s);
        }
        for (const k of Object.keys(map)) {
            map[k].sort((a, b) => a.day.localeCompare(b.day));
        }
        return map;
    }, [stats]);

    const maxValue = Math.max(1, ...stats.map((s) => s.value));

    return (
        <div className="rounded-3xl border border-[rgba(110,211,225,0.16)] bg-[rgba(6,20,27,0.6)]/80 p-6">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className="text-base font-semibold text-[color:var(--color-turkish-blue-200)]">{t("stats.selectProject")}</h3>
                    <p className="text-xs text-[rgba(255,255,255,0.6)]">{t("stats.subtitle")}</p>
                </div>
                <div className="max-w-xs">
                    <select
                        value={selectedId}
                        onChange={(e) => setSelectedId(e.target.value)}
                        className="w-full rounded-lg border border-[rgba(110,211,225,0.24)] bg-[rgba(8,28,38,0.7)] p-2 text-white"
                    >
                        {initialProjects.map((p) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {metrics.length === 0 ? (
                <div className="text-sm text-[rgba(255,255,255,0.7)]">{t("stats.empty")}</div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {metrics.map((metric) => {
                        const series = grouped[metric] || [];
                        return (
                            <div key={metric} className="rounded-xl border border-[rgba(110,211,225,0.18)] bg-[rgba(8,28,38,0.6)] p-4">
                                <div className="mb-2 text-sm font-semibold text-white">{metric}</div>
                                <div className="flex items-end gap-1 overflow-x-auto">
                                    {series.map((s) => (
                                        <div key={s.day} className="flex flex-col items-center text-[10px] text-[rgba(255,255,255,0.6)]">
                                            <div
                                                className="w-2 rounded bg-[color:var(--color-turkish-blue-400)]"
                                                style={{ height: `${Math.max(4, (s.value / maxValue) * 80)}px` }}
                                                title={`${formatDate(s.day)}: ${s.value}`}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
