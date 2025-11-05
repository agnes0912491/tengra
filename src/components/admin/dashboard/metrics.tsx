"use client";

import { useEffect, useMemo, useState } from "react";
import { getServerHealth, getTopBlogViews, getTopPages, getTopAgents, getVisits, type ServerHealth } from "@/lib/db";
import Cookies from "js-cookie";
import { ADMIN_SESSION_COOKIE_CANDIDATES } from "@/lib/auth";

type Visit = { date: string; count: number };

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

const formatDuration = (seconds?: number) => {
    if (!seconds || Number.isNaN(seconds)) return "Bilinmiyor";
    const total = Math.floor(seconds);
    const d = Math.floor(total / 86400);
    const h = Math.floor((total % 86400) / 3600);
    const m = Math.floor((total % 3600) / 60);
    const parts = [d ? `${d}g` : null, h ? `${h}s` : null, m ? `${m}d` : null].filter(Boolean);
    return parts.length ? parts.join(" ") : `${total}s`;
};

export default function AdminMetrics() {
    const [health, setHealth] = useState<ServerHealth>({ status: "offline" });
    const [visits, setVisits] = useState<Visit[]>([]);
    const [topBlogs, setTopBlogs] = useState<{ id: string; count: number }[]>([]);
    const [topPages, setTopPages] = useState<{ path: string; count: number }[]>([]);
    const [topAgents, setTopAgents] = useState<{ agent: string; count: number }[]>([]);
    const feUptime = useFrontendUptime();

    const token = useMemo(() => {
        return ADMIN_SESSION_COOKIE_CANDIDATES.map((name) => Cookies.get(name)).find(Boolean) || "";
    }, []);

    useEffect(() => {
        let mounted = true;
        const load = async () => {
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
        };
        load();
        const id = setInterval(load, 15000);
        return () => {
            mounted = false;
            clearInterval(id);
        };
    }, [token]);

    const maxVisit = Math.max(1, ...visits.map((v) => v.count));
    const maxTopPage = Math.max(1, ...topPages.map((p) => p.count));
    const maxTopAgent = Math.max(1, ...topAgents.map((a) => a.count));

    return (
        <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-[rgba(110,211,225,0.16)] bg-[rgba(6,20,27,0.6)]/80 p-6">
                <h3 className="text-base font-semibold text-[color:var(--color-turkish-blue-200)]">Sistem Sağlığı</h3>
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div className="rounded-xl border border-[rgba(110,211,225,0.2)] p-4">
                        <div className="text-[rgba(255,255,255,0.6)]">Sunucu Uptime</div>
                        <div className="mt-1 text-lg text-white">{formatDuration(health.uptimeSeconds)}</div>
                    </div>
                    <div className="rounded-xl border border-[rgba(110,211,225,0.2)] p-4">
                        <div className="text-[rgba(255,255,255,0.6)]">Frontend Uptime</div>
                        <div className="mt-1 text-lg text-white">{formatDuration(feUptime)}</div>
                    </div>
                    <div className="rounded-xl border border-[rgba(110,211,225,0.2)] p-4">
                        <div className="text-[rgba(255,255,255,0.6)]">CPU Yükü</div>
                        <div className="mt-1 text-xs text-white">
                            {health.cpu
                                ? `1m: ${health.cpu.loadAvg1.toFixed(2)} • 5m: ${health.cpu.loadAvg5.toFixed(2)} • 15m: ${health.cpu.loadAvg15.toFixed(2)}`
                                : "Veri yok"}
                        </div>
                    </div>
                    <div className="rounded-xl border border-[rgba(110,211,225,0.2)] p-4">
                        <div className="text-[rgba(255,255,255,0.6)]">RAM Kullanımı</div>
                        <div className="mt-1 text-xs text-white">
                            {health.memory
                                ? `${(health.memory.usedBytes / 1024 / 1024).toFixed(0)}MB / ${(health.memory.totalBytes / 1024 / 1024).toFixed(0)}MB`
                                : "Veri yok"}
                        </div>
                    </div>
                </div>
            </div>

            <div className="rounded-3xl border border-[rgba(110,211,225,0.16)] bg-[rgba(6,20,27,0.6)]/80 p-6">
                <h3 className="text-base font-semibold text-[color:var(--color-turkish-blue-200)]">En Çok Görüntülenen Bloglar</h3>
                <ul className="mt-4 space-y-2 text-sm">
                    {topBlogs.length === 0 && <li className="text-[rgba(255,255,255,0.6)]">Veri yok</li>}
                    {topBlogs.slice(0, 8).map((b) => (
                        <li key={b.id} className="flex items-center justify-between rounded-lg border border-[rgba(110,211,225,0.18)] bg-[rgba(8,28,38,0.6)] px-3 py-2">
                            <span className="text-white">Blog #{b.id}</span>
                            <span className="text-[rgba(255,255,255,0.75)]">{b.count}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="rounded-3xl border border-[rgba(110,211,225,0.16)] bg-[rgba(6,20,27,0.6)]/80 p-6">
                <h3 className="text-base font-semibold text-[color:var(--color-turkish-blue-200)]">En Çok Ziyaret Edilen Sayfalar</h3>
                <ul className="mt-4 space-y-2 text-sm">
                    {topPages.length === 0 && <li className="text-[rgba(255,255,255,0.6)]">Veri yok</li>}
                    {topPages.slice(0, 8).map((p) => {
                        const width = Math.max(4, Math.round((p.count / maxTopPage) * 100));
                        return (
                            <li key={p.path} className="relative overflow-hidden rounded-lg border border-[rgba(110,211,225,0.18)] bg-[rgba(8,28,38,0.6)] px-3 py-2">
                                <div className="absolute inset-y-0 left-0 bg-[rgba(110,211,225,0.15)]" style={{ width: `${width}%` }} />
                                <div className="relative z-10 flex items-center justify-between">
                                    <span className="text-white truncate max-w-[70%]" title={p.path}>{p.path}</span>
                                    <span className="text-[rgba(255,255,255,0.9)]" title={`${p.count}`}>{p.count}</span>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </div>

            <div className="rounded-3xl border border-[rgba(110,211,225,0.16)] bg-[rgba(6,20,27,0.6)]/80 p-6">
                <h3 className="text-base font-semibold text-[color:var(--color-turkish-blue-200)]">Agent / Bot Dağılımı</h3>
                <ul className="mt-4 space-y-2 text-sm">
                    {topAgents.length === 0 && <li className="text-[rgba(255,255,255,0.6)]">Veri yok</li>}
                    {topAgents.slice(0, 8).map((a) => {
                        const width = Math.max(4, Math.round((a.count / maxTopAgent) * 100));
                        return (
                            <li key={a.agent} className="relative overflow-hidden rounded-lg border border-[rgba(110,211,225,0.18)] bg-[rgba(8,28,38,0.6)] px-3 py-2">
                                <div className="absolute inset-y-0 left-0 bg-[rgba(110,211,225,0.15)]" style={{ width: `${width}%` }} />
                                <div className="relative z-10 flex items-center justify-between">
                                    <span className="text-white">{a.agent}</span>
                                    <span className="text-[rgba(255,255,255,0.9)]" title={`${a.count}`}>{a.count}</span>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </div>

            <div className="rounded-3xl border border-[rgba(110,211,225,0.16)] bg-[rgba(6,20,27,0.6)]/80 p-6 lg:col-span-2">
                <h3 className="text-base font-semibold text-[color:var(--color-turkish-blue-200)]">Ziyaretler (Son kayıtlar)</h3>
                <div className="mt-4 flex items-end gap-1 overflow-x-auto">
                    {visits.slice(0, 60).reverse().map((v) => (
                        <div key={v.date} className="flex flex-col items-center text-[10px] text-[rgba(255,255,255,0.6)]">
                            <div
                                className="w-2 rounded bg-[color:var(--color-turkish-blue-400)]"
                                style={{ height: `${Math.max(4, (v.count / maxVisit) * 80)}px` }}
                                title={`${v.date}: ${v.count}`}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
