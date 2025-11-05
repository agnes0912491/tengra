"use client";

import { useEffect, useMemo, useState } from "react";
import { getServerHealth, getTopBlogViews, getTopPages, getTopAgents, getVisits, type ServerHealth } from "@/lib/db";
import Cookies from "js-cookie";
import { ADMIN_SESSION_COOKIE_CANDIDATES } from "@/lib/auth";
import StatCard from "@/components/admin/ui/stat-card";
import ChartCard from "@/components/admin/ui/chart-card";
import BarList from "@/components/admin/ui/bar-list";
import MiniBars from "@/components/admin/ui/mini-bars";

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

    return (
        <div className="grid gap-6 xl:grid-cols-2 2xl:grid-cols-3">
            {/* Sistem Sağlığı */}
            <StatCard title="Sistem Sağlığı">
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
            </StatCard>

            {/* En Çok Görüntülenen Bloglar */}
            <div className="relative rounded-3xl p-[1px] bg-gradient-to-br from-[rgba(110,211,225,0.25)]/30 via-transparent to-transparent">
                <div className="rounded-[calc(1.5rem-1px)] border border-[rgba(110,211,225,0.18)] bg-[rgba(6,20,27,0.65)]/80 p-6 shadow-[0_25px_70px_rgba(0,0,0,0.45)] backdrop-blur-xl">
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
            </div>

            {/* En Çok Ziyaret Edilen Sayfalar */}
            <ChartCard title="En Çok Ziyaret Edilen Sayfalar">
                    <BarList items={topPages.slice(0, 8).map((p) => ({ id: p.path, label: p.path, value: p.count }))} />
            </ChartCard>

            {/* Agent / Bot Dağılımı */}
            <ChartCard title="Agent / Bot Dağılımı">
                    <BarList items={topAgents.slice(0, 8).map((a) => ({ id: a.agent, label: a.agent, value: a.count }))} />
            </ChartCard>

            {/** Ziyaretçi Ülke Dağılımı kaldırıldı (istek üzerine). */}

            {/* Ziyaretler */}
            <ChartCard title="Ziyaretler (Son kayıtlar)" className="xl:col-span-2 2xl:col-span-3">
                    <MiniBars items={visits.slice(0, 60).reverse().map((v) => ({ label: v.date, value: v.count }))} />
            </ChartCard>
        </div>
    );
}
