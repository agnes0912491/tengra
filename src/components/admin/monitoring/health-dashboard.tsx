"use client";

import { useEffect, useState, useCallback } from "react";
import { useAdminToken } from "@/hooks/use-admin-token";
import {
    Activity,
    Server,
    Database,
    Cpu,
    MemoryStick,
    WifiOff,
    RefreshCw,
    AlertCircle,
    CheckCircle,
    Clock,
    Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocale, useTranslations } from "next-intl";

interface ServiceHealth {
    name: string;
    kind?: "frontend" | "lovaBackend" | "mainBackend" | "database" | "cache";
    status: "online" | "offline" | "degraded";
    responseTime?: number;
    lastCheck: string;
    version?: string;
    details?: Record<string, unknown>;
}

interface SystemMetrics {
    cpu: {
        usage: number;
        cores: number;
    };
    memory: {
        used: number;
        total: number;
        percentage: number;
    };
    disk: {
        used: number;
        total: number;
        percentage: number;
    };
    uptime: number;
}

interface HealthData {
    services: ServiceHealth[];
    system?: SystemMetrics;
    timestamp: string;
}

const STATUS_COLORS = {
    online: "text-green-400 bg-green-400/10 border-green-400/30",
    offline: "text-red-400 bg-red-400/10 border-red-400/30",
    degraded: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
};

const STATUS_ICONS = {
    online: CheckCircle,
    offline: WifiOff,
    degraded: AlertCircle,
};

const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export default function HealthCheckDashboard() {
    const { token } = useAdminToken();
    const t = useTranslations("AdminMonitoring");
    const locale = useLocale();
    const [data, setData] = useState<HealthData | null>(null);
    const [loading, setLoading] = useState(true);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
    const formatUptime = (seconds: number) => {
        const d = Math.floor(seconds / 86400);
        const h = Math.floor((seconds % 86400) / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const parts = [
            d ? t("uptime.days", { count: d }) : null,
            h ? t("uptime.hours", { count: h }) : null,
            m ? t("uptime.minutes", { count: m }) : null,
        ].filter(Boolean);
        return parts.length ? parts.join(" ") : t("uptime.minutes", { count: 0 });
    };

    const fetchHealth = useCallback(async () => {
        if (!token) return;

        setLoading(true);
        try {
            // Fetch from multiple health endpoints
            const [apiHealth, backendHealth] = await Promise.all([
                fetch("/api/health").then((r) => r.json()).catch(() => ({ status: "offline" })),
                fetch("https://api.tengra.studio/health").then((r) => r.json()).catch(() => ({ status: "offline" })),
            ]);

            const services: ServiceHealth[] = [
                {
                    name: t("services.frontend"),
                    kind: "frontend",
                    status: "online",
                    responseTime: 0,
                    lastCheck: new Date().toISOString(),
                    version: process.env.NEXT_PUBLIC_VERSION || "1.0.0",
                },
                {
                    name: t("services.lovaBackend"),
                    kind: "lovaBackend",
                    status: apiHealth.status === "ok" ? "online" : "offline",
                    responseTime: apiHealth.responseTime,
                    lastCheck: new Date().toISOString(),
                    version: apiHealth.version,
                },
                {
                    name: t("services.mainBackend"),
                    kind: "mainBackend",
                    status: backendHealth.status === "online" ? "online" : "offline",
                    responseTime: backendHealth.responseTimeMs,
                    lastCheck: new Date().toISOString(),
                    details: {
                        uptime: backendHealth.uptime,
                    },
                },
                {
                    name: t("services.database"),
                    kind: "database",
                    status: apiHealth.database?.status === "connected" ? "online" : "offline",
                    lastCheck: new Date().toISOString(),
                },
                {
                    name: t("services.cache"),
                    kind: "cache",
                    status: apiHealth.redis?.status === "connected" ? "online" : "offline",
                    lastCheck: new Date().toISOString(),
                },
            ];

            setData({
                services,
                system: apiHealth.system,
                timestamp: new Date().toISOString(),
            });
            setLastUpdate(new Date());
        } catch (err) {
            console.error("Health check failed:", err);
        } finally {
            setLoading(false);
        }
    }, [token, t]);

    useEffect(() => {
        fetchHealth();
    }, [fetchHealth]);

    useEffect(() => {
        if (!autoRefresh) return;

        const interval = setInterval(fetchHealth, 30000); // 30 seconds
        return () => clearInterval(interval);
    }, [autoRefresh, fetchHealth]);

    const overallStatus = data?.services.every((s) => s.status === "online")
        ? "online"
        : data?.services.some((s) => s.status === "offline")
            ? "offline"
            : "degraded";

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Activity className="h-7 w-7 text-[rgba(0,167,197,0.8)]" />
                        {t("title")}
                    </h1>
                    <p className="text-sm text-[rgba(255,255,255,0.5)] mt-1">
                        {t("subtitle")}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-sm text-[rgba(255,255,255,0.6)]">
                        <input
                            type="checkbox"
                            checked={autoRefresh}
                            onChange={(e) => setAutoRefresh(e.target.checked)}
                            className="rounded border-[rgba(110,211,225,0.3)]"
                        />
                        {t("autoRefresh", { seconds: 30 })}
                    </label>
                    <Button
                        onClick={fetchHealth}
                        variant="outline"
                        className="border-[rgba(110,211,225,0.3)] text-[rgba(110,211,225,0.8)]"
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                        {t("refresh")}
                    </Button>
                </div>
            </div>

            {/* Overall Status */}
            <div className={`rounded-xl border p-6 ${STATUS_COLORS[overallStatus]}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {(() => {
                            const Icon = STATUS_ICONS[overallStatus];
                            return <Icon className="h-10 w-10" />;
                        })()}
                        <div>
                            <h2 className="text-xl font-semibold">
                                {overallStatus === "online"
                                    ? t("overall.online")
                                    : overallStatus === "offline"
                                        ? t("overall.offline")
                                        : t("overall.degraded")}
                            </h2>
                            <p className="text-sm opacity-80">
                                {t("lastUpdate", { time: lastUpdate?.toLocaleTimeString(locale) || "-" })}
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-bold">
                            {data?.services.filter((s) => s.status === "online").length || 0}/
                            {data?.services.length || 0}
                        </div>
                        <p className="text-sm opacity-80">{t("activeServices")}</p>
                    </div>
                </div>
            </div>

            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data?.services.map((service) => {
                    const StatusIcon = STATUS_ICONS[service.status];
                    return (
                        <div
                            key={service.name}
                            className={`rounded-xl border p-4 ${STATUS_COLORS[service.status]}`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-[rgba(0,0,0,0.2)]">
                                        {service.kind === "database" ? (
                                            <Database className="h-5 w-5" />
                                        ) : service.kind === "cache" ? (
                                            <MemoryStick className="h-5 w-5" />
                                        ) : service.kind === "lovaBackend" || service.kind === "mainBackend" ? (
                                            <Server className="h-5 w-5" />
                                        ) : (
                                            <Globe className="h-5 w-5" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-medium">{service.name}</h3>
                                        {service.version && (
                                            <p className="text-xs opacity-70">v{service.version}</p>
                                        )}
                                    </div>
                                </div>
                                <StatusIcon className="h-5 w-5" />
                            </div>

                            <div className="mt-4 space-y-2">
                                {service.responseTime !== undefined && (
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="flex items-center gap-1 opacity-70">
                                            <Clock className="h-3 w-3" />
                                            {t("responseTime")}
                                        </span>
                                        <span className="font-mono">{service.responseTime}ms</span>
                                    </div>
                                )}
                                <div className="flex items-center justify-between text-sm">
                                    <span className="opacity-70">{t("statusLabel")}</span>
                                    <span className="capitalize font-medium">
                                        {service.status === "online"
                                            ? t("status.online")
                                            : service.status === "offline"
                                                ? t("status.offline")
                                                : t("status.degraded")}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* System Metrics */}
            {data?.system && (
                <div className="rounded-xl border border-[rgba(110,211,225,0.15)] bg-[rgba(6,20,27,0.6)] p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Cpu className="h-5 w-5 text-[rgba(0,167,197,0.8)]" />
                        {t("systemMetrics.title")}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {/* CPU */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-[rgba(255,255,255,0.6)]">{t("systemMetrics.cpuUsage")}</span>
                                <span className="text-sm font-mono text-white">{data.system.cpu.usage.toFixed(1)}%</span>
                            </div>
                            <div className="h-2 bg-[rgba(255,255,255,0.1)] rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-[rgba(0,167,197,0.8)] to-[rgba(110,211,225,0.8)] transition-all"
                                    style={{ width: `${data.system.cpu.usage}%` }}
                                />
                            </div>
                            <p className="text-xs text-[rgba(255,255,255,0.4)] mt-1">{t("systemMetrics.cores", { count: data.system.cpu.cores })}</p>
                        </div>

                        {/* Memory */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-[rgba(255,255,255,0.6)]">{t("systemMetrics.memory")}</span>
                                <span className="text-sm font-mono text-white">{data.system.memory.percentage.toFixed(1)}%</span>
                            </div>
                            <div className="h-2 bg-[rgba(255,255,255,0.1)] rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                                    style={{ width: `${data.system.memory.percentage}%` }}
                                />
                            </div>
                            <p className="text-xs text-[rgba(255,255,255,0.4)] mt-1">
                                {formatBytes(data.system.memory.used)} / {formatBytes(data.system.memory.total)}
                            </p>
                        </div>

                        {/* Disk */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-[rgba(255,255,255,0.6)]">{t("systemMetrics.disk")}</span>
                                <span className="text-sm font-mono text-white">{data.system.disk.percentage.toFixed(1)}%</span>
                            </div>
                            <div className="h-2 bg-[rgba(255,255,255,0.1)] rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all"
                                    style={{ width: `${data.system.disk.percentage}%` }}
                                />
                            </div>
                            <p className="text-xs text-[rgba(255,255,255,0.4)] mt-1">
                                {formatBytes(data.system.disk.used)} / {formatBytes(data.system.disk.total)}
                            </p>
                        </div>

                        {/* Uptime */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-[rgba(255,255,255,0.6)]">{t("systemMetrics.uptime")}</span>
                            </div>
                            <div className="text-2xl font-mono text-white">
                                {formatUptime(data.system.uptime)}
                            </div>
                            <p className="text-xs text-[rgba(255,255,255,0.4)] mt-1">{t("systemMetrics.uptimeNote")}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Status History (placeholder) */}
            <div className="rounded-xl border border-[rgba(110,211,225,0.15)] bg-[rgba(6,20,27,0.6)] p-6">
                <h3 className="text-lg font-semibold text-white mb-4">{t("history.title")}</h3>
                <div className="flex gap-1">
                    {Array.from({ length: 24 }).map((_, i) => (
                        <div
                            key={i}
                            className="flex-1 h-8 rounded bg-green-400/20 hover:bg-green-400/40 transition-colors cursor-pointer"
                            title={t("history.itemTitle", { hours: 23 - i, status: t("status.online") })}
                        />
                    ))}
                </div>
                <div className="flex justify-between text-xs text-[rgba(255,255,255,0.4)] mt-2">
                    <span>{t("history.start")}</span>
                    <span>{t("history.now")}</span>
                </div>
            </div>
        </div>
    );
}
