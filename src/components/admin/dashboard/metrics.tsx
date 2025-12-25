"use client";

import { useEffect, useMemo, useState } from "react";
import { getServerHealth, getTopBlogViews, getTopPages, getTopAgents, getVisits, type ServerHealth } from "@/lib/db";
import StatCard from "@/components/admin/ui/stat-card";
import ChartCard from "@/components/admin/ui/chart-card";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useAdminToken } from "@/hooks/use-admin-token";
import { useTranslation } from "@tengra/language";

type Visit = { date: string; count: number };
type RangeKey = "daily" | "weekly" | "monthly";

const RANGE_LIMITS: Record<RangeKey, number> = {
    daily: 1,
    weekly: 7,
    monthly: 30,
};

const EXCLUDED_ROUTE_PREFIXES = [
    "/api",
    "/admin",
    "/_next",
    "/favicon",
    "/robots",
    "/sitemap",
    "/favicon.ico",
];

// Capture the frontend start time at module load (client only)
const FE_START_MS = typeof window !== "undefined" ? Date.now() : 0;

const useFrontendUptime = () => {
    const [now, setNow] = useState<number>(() => (typeof window !== "undefined" ? Date.now() : 0));
    useEffect(() => {
        const id = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(id);
    }, []);
    if (FE_START_MS === 0 || now === 0) return 0;
    return Math.max(0, Math.floor((now - FE_START_MS) / 1000));
};


export default function AdminMetrics() {
    const { t } = useTranslation("AdminDashboard");
    const [health, setHealth] = useState<ServerHealth>({ status: "offline" });
    const [visits, setVisits] = useState<Visit[]>([]);
    const [topBlogs, setTopBlogs] = useState<{ id: string; count: number }[]>([]);
    const [topPages, setTopPages] = useState<{ path: string; count: number }[]>([]);
    const [topAgents, setTopAgents] = useState<{ agent: string; count: number }[]>([]);
    const [range, setRange] = useState<RangeKey>("weekly");
    const [pagePage, setPagePage] = useState(0);
    const [agentPage, setAgentPage] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [adblockEnabled, setAdblockEnabled] = useState<"true" | "false" | "unknown">("unknown");
    const [reloadAt, setReloadAt] = useState<number>(0);
    const feUptime = useFrontendUptime();

    const { token, refresh } = useAdminToken();

    const formatDuration = (seconds?: number) => {
        if (!seconds || Number.isNaN(seconds)) return t("metrics.unknown");
        const total = Math.floor(seconds);
        const d = Math.floor(total / 86400);
        const h = Math.floor((total % 86400) / 3600);
        const m = Math.floor((total % 3600) / 60);
        const parts = [
            d ? t("metrics.duration.days", { days: d }) : null,
            h ? t("metrics.duration.hours", { hours: h }) : null,
            m ? t("metrics.duration.minutes", { minutes: m }) : null,
        ].filter(Boolean);
        return parts.length ? parts.join(" ") : t("metrics.duration.seconds", { seconds: total });
    };

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            setError(null);
            try {
                const [h, v, t, p, a] = await Promise.all([
                    getServerHealth(token).catch(() => ({ status: "offline" as const })),
                    token ? getVisits(token).catch(() => []) : Promise.resolve([]),
                    token ? getTopBlogViews(token).catch(() => []) : Promise.resolve([]),
                    token ? getTopPages(token).catch(() => []) : Promise.resolve([]),
                    token ? getTopAgents(token).catch(() => []) : Promise.resolve([]),
                ]);
                if (!mounted) return;
                setHealth(h);
                setVisits(v);
                setTopBlogs(t);
                setTopPages(p);
                setTopAgents(a);
                if (!token) setError(t("metrics.authorizationMissing"));
            } catch {
                if (!mounted) return;
                setError(t("metrics.fetchError"));
            }
        };
        load();
        const id = setInterval(load, 30000);
        return () => {
            mounted = false;
            clearInterval(id);
        };
    }, [token, reloadAt, t]);

    const filteredVisits = useMemo(() => {
        if (!visits.length) return [];
        const limitDays = RANGE_LIMITS[range];
        const today = new Date();
        return visits.filter((v) => {
            const d = new Date(v.date);
            const diff = Math.floor((today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
            return diff >= 0 && diff < limitDays;
        });
    }, [visits, range]);

    const pageSize = 10;

    const filteredPages = useMemo(() => {
        const shouldExclude = (path: string) =>
            EXCLUDED_ROUTE_PREFIXES.some((prefix) => path.startsWith(prefix));
        return topPages.filter((p) => !shouldExclude(p.path));
    }, [topPages]);

    const paginatedPages = useMemo(() => {
        const start = pagePage * pageSize;
        return filteredPages.slice(start, start + pageSize);
    }, [filteredPages, pagePage]);

    const paginatedAgents = useMemo(() => {
        const start = agentPage * pageSize;
        return topAgents.slice(start, start + pageSize);
    }, [topAgents, agentPage]);

    const visitData = useMemo(() => {
        const base = (filteredVisits.length ? filteredVisits : visits)
            .slice(0, 60)
            .map((v) => ({ date: v.date, count: v.count }))
            .sort((a, b) => a.date.localeCompare(b.date));
        return base;
    }, [filteredVisits, visits]);

    const formatXAxisDate = (value: string) => {
        if (!value) return "";
        // show MM-DD
        const parts = value.split("-");
        if (parts.length === 3) return `${parts[1]}-${parts[2]}`;
        return value;
    };

    useEffect(() => {
        const read = () => {
            if (typeof document === "undefined") return;
            const flag = document.documentElement.dataset.adblock;
            if (flag === "true" || flag === "false") {
                setAdblockEnabled(flag);
            } else {
                setAdblockEnabled("unknown");
            }
        };
        read();
        const handler = (e: Event) => {
            const detail = (e as CustomEvent<{ enabled?: boolean }>).detail;
            if (detail && typeof detail.enabled === "boolean") {
                setAdblockEnabled(detail.enabled ? "true" : "false");
            } else {
                read();
            }
        };
        window.addEventListener("tengra:adblock-detected", handler);
        return () => window.removeEventListener("tengra:adblock-detected", handler);
    }, []);

    const handleRefresh = () => {
        refresh();
        setReloadAt(Date.now());
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[rgba(110,211,225,0.2)] bg-[rgba(6,18,26,0.75)] px-4 py-3 text-sm text-[rgba(255,255,255,0.8)]">
                <div className="flex items-center gap-3">
                    <span className="text-[rgba(255,255,255,0.6)]">{t("metrics.adblock.label")}</span>
                    <span className="rounded-full border border-[rgba(110,211,225,0.35)] bg-[rgba(8,24,32,0.8)] px-3 py-1 text-xs uppercase tracking-[0.2em]">
                        {adblockEnabled === "unknown"
                            ? t("metrics.adblock.unknown")
                            : adblockEnabled === "true"
                                ? t("metrics.adblock.enabled")
                                : t("metrics.adblock.disabled")}
                    </span>
                    {error ? <span className="text-[rgba(255,150,150,0.85)]">{error}</span> : null}
                </div>
                <button
                    type="button"
                    onClick={handleRefresh}
                    className="rounded-full border border-[rgba(110,211,225,0.35)] px-3 py-1 text-xs uppercase tracking-[0.25em] text-[rgba(255,255,255,0.9)] hover:border-[rgba(110,211,225,0.6)]"
                >
                    {t("metrics.adblock.refresh")}
                </button>
            </div>
            {/* Sistem Sağlığı */}
            <StatCard title={t("metrics.systemHealth")}>
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div className="rounded-xl border border-[rgba(110,211,225,0.2)] p-4">
                        <div className="text-[rgba(255,255,255,0.6)]">{t("metrics.serverUptime")}</div>
                        <div className="mt-1 text-lg text-white">{formatDuration(health.uptimeSeconds)}</div>
                    </div>
                    <div className="rounded-xl border border-[rgba(110,211,225,0.2)] p-4">
                        <div className="text-[rgba(255,255,255,0.6)]">{t("metrics.frontendUptime")}</div>
                        <div className="mt-1 text-lg text-white">{formatDuration(feUptime)}</div>
                    </div>
                    <div className="rounded-xl border border-[rgba(110,211,225,0.2)] p-4">
                        <div className="text-[rgba(255,255,255,0.6)]">{t("metrics.cpuLoad")}</div>
                        <div className="mt-1 text-xs text-white">
                            {health.cpu
                                ? t("metrics.cpuLoadDetails", {
                                    one: health.cpu.loadAvg1.toFixed(2),
                                    five: health.cpu.loadAvg5.toFixed(2),
                                    fifteen: health.cpu.loadAvg15.toFixed(2),
                                })
                                : t("metrics.noData")}
                        </div>
                    </div>
                    <div className="rounded-xl border border-[rgba(110,211,225,0.2)] p-4">
                        <div className="text-[rgba(255,255,255,0.6)]">{t("metrics.ramUsage")}</div>
                        <div className="mt-1 text-xs text-white">
                            {health.memory
                                ? t("metrics.memoryUsage", {
                                    used: (health.memory.usedBytes / 1024 / 1024).toFixed(0),
                                    total: (health.memory.totalBytes / 1024 / 1024).toFixed(0),
                                })
                                : t("metrics.noData")}
                        </div>
                    </div>
                </div>
            </StatCard>

            {/* En Çok Görüntülenen Bloglar */}
            <div className="relative rounded-3xl p-[1px] bg-gradient-to-br from-[rgba(110,211,225,0.25)]/30 via-transparent to-transparent">
                <div className="rounded-[calc(1.5rem-1px)] border border-[rgba(110,211,225,0.18)] bg-[rgba(6,20,27,0.65)]/80 p-6 shadow-[0_25px_70px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                    <h3 className="text-base font-semibold text-[color:var(--color-turkish-blue-200)]">{t("metrics.topBlogs")}</h3>
                    <ul className="mt-4 space-y-2 text-sm">
                        {topBlogs.length === 0 && <li className="text-[rgba(255,255,255,0.6)]">{t("metrics.noData")}</li>}
                        {topBlogs.slice(0, 8).map((b) => (
                            <li key={b.id} className="flex items-center justify-between rounded-lg border border-[rgba(110,211,225,0.18)] bg-[rgba(8,28,38,0.6)] px-3 py-2">
                                <span className="text-white">{t("metrics.blogId", { id: b.id })}</span>
                                <span className="text-[rgba(255,255,255,0.75)]">{b.count}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* En Çok Ziyaret Edilen Sayfalar */}
            <ChartCard title={t("metrics.topPages")}>
                <div className="overflow-hidden rounded-2xl border border-[rgba(110,211,225,0.18)] bg-[rgba(8,24,32,0.6)]">
                    <table className="min-w-full divide-y divide-[rgba(110,211,225,0.12)] text-sm text-[rgba(255,255,255,0.82)]">
                        <thead className="bg-[rgba(8,24,32,0.9)] text-[rgba(255,255,255,0.75)]">
                            <tr>
                                <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.18em]">{t("metrics.table.route")}</th>
                                <th className="px-4 py-3 text-right text-[11px] uppercase tracking-[0.18em]">{t("metrics.table.requests")}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[rgba(110,211,225,0.08)]">
                            {paginatedPages.map((p) => (
                                <tr key={p.path}>
                                    <td className="px-4 py-3">{p.path}</td>
                                    <td className="px-4 py-3 text-right font-semibold text-white">{p.count}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="mt-3 flex items-center justify-end gap-2 text-xs text-[rgba(255,255,255,0.65)]">
                    <span>
                        {t("metrics.pagination", { page: pagePage + 1, total: Math.max(1, Math.ceil(filteredPages.length / pageSize)) })}
                    </span>
                    <button
                        onClick={() => setPagePage((p) => Math.max(0, p - 1))}
                        className="rounded-full border border-[rgba(110,211,225,0.3)] px-3 py-1 hover:border-[rgba(110,211,225,0.5)]"
                        disabled={pagePage === 0}
                    >
                        {t("metrics.previous")}
                    </button>
                    <button
                        onClick={() => {
                            const maxPage = Math.max(0, Math.ceil(filteredPages.length / pageSize) - 1);
                            setPagePage((p) => Math.min(maxPage, p + 1));
                        }}
                        className="rounded-full border border-[rgba(110,211,225,0.3)] px-3 py-1 hover:border-[rgba(110,211,225,0.5)]"
                        disabled={(pagePage + 1) * pageSize >= filteredPages.length}
                    >
                        {t("metrics.next")}
                    </button>
                </div>
            </ChartCard>

            {/* Agent / Bot Dağılımı */}
            <ChartCard title={t("metrics.agentBreakdown")}>
                <div className="overflow-hidden rounded-2xl border border-[rgba(110,211,225,0.18)] bg-[rgba(8,24,32,0.6)]">
                    <table className="min-w-full divide-y divide-[rgba(110,211,225,0.12)] text-sm text-[rgba(255,255,255,0.82)]">
                        <thead className="bg-[rgba(8,24,32,0.9)] text-[rgba(255,255,255,0.75)]">
                            <tr>
                                <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.18em]">{t("metrics.agentTable.agent")}</th>
                                <th className="px-4 py-3 text-right text-[11px] uppercase tracking-[0.18em]">{t("metrics.agentTable.incoming")}</th>
                                <th className="px-4 py-3 text-right text-[11px] uppercase tracking-[0.18em]">{t("metrics.agentTable.accepted")}</th>
                                <th className="px-4 py-3 text-right text-[11px] uppercase tracking-[0.18em]">{t("metrics.agentTable.declined")}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[rgba(110,211,225,0.08)]">
                            {paginatedAgents.map((a) => (
                                <tr key={a.agent}>
                                    <td className="px-4 py-3">{a.agent}</td>
                                    <td className="px-4 py-3 text-right font-semibold text-white">{a.count}</td>
                                    <td className="px-4 py-3 text-right text-[rgba(255,255,255,0.85)]">{a.count}</td>
                                    <td className="px-4 py-3 text-right text-[rgba(255,255,255,0.65)]">0</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="mt-3 flex items-center justify-end gap-2 text-xs text-[rgba(255,255,255,0.65)]">
                    <span>
                        {t("metrics.pagination", { page: agentPage + 1, total: Math.max(1, Math.ceil(topAgents.length / pageSize)) })}
                    </span>
                    <button
                        onClick={() => setAgentPage((p) => Math.max(0, p - 1))}
                        className="rounded-full border border-[rgba(110,211,225,0.3)] px-3 py-1 hover:border-[rgba(110,211,225,0.5)]"
                        disabled={agentPage === 0}
                    >
                        {t("metrics.previous")}
                    </button>
                    <button
                        onClick={() => {
                            const maxPage = Math.max(0, Math.ceil(topAgents.length / pageSize) - 1);
                            setAgentPage((p) => Math.min(maxPage, p + 1));
                        }}
                        className="rounded-full border border-[rgba(110,211,225,0.3)] px-3 py-1 hover:border-[rgba(110,211,225,0.5)]"
                        disabled={(agentPage + 1) * pageSize >= topAgents.length}
                    >
                        {t("metrics.next")}
                    </button>
                </div>
            </ChartCard>

            {/** Ziyaretçi Ülke Dağılımı kaldırıldı (istek üzerine). */}

            {/* Ziyaretler */}
            <ChartCard
                title={t("metrics.visits.title")}
                className="xl:col-span-2 2xl:col-span-3"
                right={
                    <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(110,211,225,0.25)] bg-[rgba(8,24,32,0.65)] px-2 py-1 text-xs text-[rgba(255,255,255,0.75)]">
                        {(["daily", "weekly", "monthly"] as RangeKey[]).map((key) => (
                            <button
                                key={key}
                                onClick={() => setRange(key)}
                                className={`rounded-full px-3 py-1 transition ${range === key
                                    ? "bg-[rgba(110,211,225,0.25)] text-white"
                                    : "text-[rgba(255,255,255,0.7)] hover:text-white"
                                    }`}
                            >
                                {key === "daily" ? t("metrics.visits.daily") : key === "weekly" ? t("metrics.visits.weekly") : t("metrics.visits.monthly")}
                            </button>
                        ))}
                    </div>
                }
            >
                {visitData.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-[rgba(110,211,225,0.2)] bg-[rgba(8,24,32,0.5)] p-6 text-sm text-[rgba(255,255,255,0.75)]">
                        {t("metrics.visits.empty")}
                    </div>
                ) : (
                    <div className="mt-4 h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={visitData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <CartesianGrid stroke="rgba(110,211,225,0.08)" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    stroke="rgba(255,255,255,0.55)"
                                    tick={{ fill: "rgba(255,255,255,0.65)", fontSize: 10 }}
                                    interval={0}
                                    tickFormatter={formatXAxisDate}
                                />
                                <YAxis
                                    stroke="rgba(255,255,255,0.55)"
                                    tick={{ fill: "rgba(255,255,255,0.65)", fontSize: 10 }}
                                    width={50}
                                    allowDecimals={false}
                                />
                                <Tooltip
                                    contentStyle={{
                                        background: "rgba(6,18,26,0.92)",
                                        border: "1px solid rgba(110,211,225,0.25)",
                                        borderRadius: "12px",
                                        color: "white",
                                    }}
                                    formatter={(value: number, _name, item) => [value, item.payload?.date || t("metrics.visits.tooltip")]}
                                />
                                <Bar dataKey="count" fill="rgba(110,211,225,0.7)" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </ChartCard>
        </div>
    );
}
