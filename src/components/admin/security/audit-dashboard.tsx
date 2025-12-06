"use client";

import { useEffect, useState, useCallback } from "react";
import { useAdminToken } from "@/hooks/use-admin-token";
import {
    Shield,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Search,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
    Download,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface AuditLog {
    id: number;
    userId: number | null;
    action: string;
    resource: string | null;
    resourceId: string | null;
    ip: string | null;
    userAgent: string | null;
    country: string | null;
    city: string | null;
    details: Record<string, unknown> | null;
    success: boolean;
    createdAt: string;
}

interface AuditStats {
    total: number;
    successful: number;
    failed: number;
    uniqueIPs: number;
    topActions: { action: string; count: number }[];
    recentFailures: AuditLog[];
}

const ACTION_BADGES: Record<string, { color: string; icon: React.ReactNode }> = {
    login: { color: "bg-blue-500/20 text-blue-300 border-blue-500/30", icon: <CheckCircle className="h-3 w-3" /> },
    logout: { color: "bg-gray-500/20 text-gray-300 border-gray-500/30", icon: <XCircle className="h-3 w-3" /> },
    register: { color: "bg-green-500/20 text-green-300 border-green-500/30", icon: <CheckCircle className="h-3 w-3" /> },
    password_reset: { color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30", icon: <AlertTriangle className="h-3 w-3" /> },
    profile_update: { color: "bg-purple-500/20 text-purple-300 border-purple-500/30", icon: <CheckCircle className="h-3 w-3" /> },
    admin_action: { color: "bg-red-500/20 text-red-300 border-red-500/30", icon: <Shield className="h-3 w-3" /> },
    api_access: { color: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30", icon: <Shield className="h-3 w-3" /> },
    failed_login: { color: "bg-red-600/30 text-red-300 border-red-600/40", icon: <XCircle className="h-3 w-3" /> },
};

const getActionBadge = (action: string) => {
    const badge = ACTION_BADGES[action.toLowerCase()] || {
        color: "bg-gray-500/20 text-gray-300 border-gray-500/30",
        icon: <Shield className="h-3 w-3" />,
    };
    return badge;
};

const formatDate = (date: string) => {
    return new Intl.DateTimeFormat("tr-TR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    }).format(new Date(date));
};

export default function SecurityAuditDashboard() {
    const { token } = useAdminToken();
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [stats, setStats] = useState<AuditStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<"all" | "success" | "failed">("all");
    const [actionFilter, setActionFilter] = useState<string>("all");
    const [uniqueActions, setUniqueActions] = useState<string[]>([]);

    const fetchLogs = useCallback(async () => {
        if (!token) return;

        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: "20",
                ...(search && { search }),
                ...(filter !== "all" && { success: filter === "success" ? "true" : "false" }),
                ...(actionFilter !== "all" && { action: actionFilter }),
            });

            const res = await fetch(`/api/admin/audit-logs?${params}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {
                const data = await res.json();
                setLogs(data.logs || []);
                setTotalPages(data.totalPages || 1);
                setStats(data.stats || null);

                // Extract unique actions for filter
                const actions = new Set<string>();
                (data.logs || []).forEach((log: AuditLog) => actions.add(log.action));
                setUniqueActions(Array.from(actions));
            }
        } catch (err) {
            console.error("Failed to fetch audit logs:", err);
        } finally {
            setLoading(false);
        }
    }, [token, page, search, filter, actionFilter]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const exportLogs = async () => {
        if (!token) return;

        try {
            const res = await fetch("/api/admin/audit-logs/export", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `audit-logs-${new Date().toISOString().split("T")[0]}.csv`;
                a.click();
                URL.revokeObjectURL(url);
            }
        } catch (err) {
            console.error("Failed to export logs:", err);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Shield className="h-7 w-7 text-[rgba(0,167,197,0.8)]" />
                        Güvenlik Denetim Logları
                    </h1>
                    <p className="text-sm text-[rgba(255,255,255,0.5)] mt-1">
                        Tüm sistem aktivitelerini izleyin ve analiz edin
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={fetchLogs}
                        variant="outline"
                        className="border-[rgba(110,211,225,0.3)] text-[rgba(110,211,225,0.8)] hover:bg-[rgba(110,211,225,0.1)]"
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                        Yenile
                    </Button>
                    <Button
                        onClick={exportLogs}
                        variant="outline"
                        className="border-[rgba(110,211,225,0.3)] text-[rgba(110,211,225,0.8)] hover:bg-[rgba(110,211,225,0.1)]"
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Dışa Aktar
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="rounded-xl border border-[rgba(110,211,225,0.15)] bg-[rgba(6,20,27,0.6)] backdrop-blur-xl p-4">
                        <div className="text-sm text-[rgba(255,255,255,0.5)]">Toplam İşlem</div>
                        <div className="text-2xl font-bold text-white mt-1">{stats.total.toLocaleString()}</div>
                    </div>
                    <div className="rounded-xl border border-green-500/20 bg-[rgba(6,20,27,0.6)] backdrop-blur-xl p-4">
                        <div className="text-sm text-green-400/70">Başarılı</div>
                        <div className="text-2xl font-bold text-green-400 mt-1">{stats.successful.toLocaleString()}</div>
                    </div>
                    <div className="rounded-xl border border-red-500/20 bg-[rgba(6,20,27,0.6)] backdrop-blur-xl p-4">
                        <div className="text-sm text-red-400/70">Başarısız</div>
                        <div className="text-2xl font-bold text-red-400 mt-1">{stats.failed.toLocaleString()}</div>
                    </div>
                    <div className="rounded-xl border border-[rgba(110,211,225,0.15)] bg-[rgba(6,20,27,0.6)] backdrop-blur-xl p-4">
                        <div className="text-sm text-[rgba(255,255,255,0.5)]">Benzersiz IP</div>
                        <div className="text-2xl font-bold text-white mt-1">{stats.uniqueIPs.toLocaleString()}</div>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgba(255,255,255,0.3)]" />
                    <Input
                        placeholder="IP, kullanıcı veya detay ara..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 bg-[rgba(6,20,27,0.6)] border-[rgba(110,211,225,0.2)] text-white"
                    />
                </div>

                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as "all" | "success" | "failed")}
                    className="px-3 py-2 rounded-lg bg-[rgba(6,20,27,0.6)] border border-[rgba(110,211,225,0.2)] text-white text-sm"
                >
                    <option value="all">Tüm Durumlar</option>
                    <option value="success">Başarılı</option>
                    <option value="failed">Başarısız</option>
                </select>

                <select
                    value={actionFilter}
                    onChange={(e) => setActionFilter(e.target.value)}
                    className="px-3 py-2 rounded-lg bg-[rgba(6,20,27,0.6)] border border-[rgba(110,211,225,0.2)] text-white text-sm"
                >
                    <option value="all">Tüm Eylemler</option>
                    {uniqueActions.map((action) => (
                        <option key={action} value={action}>
                            {action}
                        </option>
                    ))}
                </select>
            </div>

            {/* Logs Table */}
            <div className="rounded-xl border border-[rgba(110,211,225,0.15)] bg-[rgba(6,20,27,0.6)] backdrop-blur-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-[rgba(110,211,225,0.1)]">
                                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-[rgba(255,255,255,0.5)]">Tarih</th>
                                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-[rgba(255,255,255,0.5)]">Eylem</th>
                                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-[rgba(255,255,255,0.5)]">Kullanıcı</th>
                                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-[rgba(255,255,255,0.5)]">IP</th>
                                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-[rgba(255,255,255,0.5)]">Konum</th>
                                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-[rgba(255,255,255,0.5)]">Durum</th>
                                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-[rgba(255,255,255,0.5)]">Detay</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[rgba(110,211,225,0.05)]">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-12 text-[rgba(255,255,255,0.5)]">
                                        <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                                        Yükleniyor...
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-12 text-[rgba(255,255,255,0.5)]">
                                        Kayıt bulunamadı
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => {
                                    const badge = getActionBadge(log.action);
                                    return (
                                        <tr key={log.id} className="hover:bg-[rgba(110,211,225,0.05)]">
                                            <td className="px-4 py-3 text-sm text-[rgba(255,255,255,0.7)]">
                                                {formatDate(log.createdAt)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${badge.color}`}>
                                                    {badge.icon}
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-white">
                                                {log.userId ? `#${log.userId}` : "-"}
                                            </td>
                                            <td className="px-4 py-3 text-sm font-mono text-[rgba(255,255,255,0.6)]">
                                                {log.ip || "-"}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-[rgba(255,255,255,0.6)]">
                                                {[log.city, log.country].filter(Boolean).join(", ") || "-"}
                                            </td>
                                            <td className="px-4 py-3">
                                                {log.success ? (
                                                    <span className="inline-flex items-center gap-1 text-green-400 text-xs">
                                                        <CheckCircle className="h-3 w-3" />
                                                        Başarılı
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-red-400 text-xs">
                                                        <XCircle className="h-3 w-3" />
                                                        Başarısız
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-[rgba(255,255,255,0.5)] max-w-[200px] truncate">
                                                {log.details ? JSON.stringify(log.details).slice(0, 50) + "..." : "-"}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between px-4 py-3 border-t border-[rgba(110,211,225,0.1)]">
                    <div className="text-sm text-[rgba(255,255,255,0.5)]">
                        Sayfa {page} / {totalPages}
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="border-[rgba(110,211,225,0.2)]"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="border-[rgba(110,211,225,0.2)]"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Recent Failures Alert */}
            {stats && stats.recentFailures.length > 0 && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 backdrop-blur-xl p-4">
                    <div className="flex items-center gap-2 text-red-400 font-medium mb-3">
                        <AlertTriangle className="h-5 w-5" />
                        Son Başarısız Girişimler
                    </div>
                    <div className="space-y-2">
                        {stats.recentFailures.slice(0, 5).map((log) => (
                            <div key={log.id} className="flex items-center justify-between text-sm">
                                <span className="text-[rgba(255,255,255,0.7)]">{log.action} - {log.ip}</span>
                                <span className="text-[rgba(255,255,255,0.5)]">{formatDate(log.createdAt)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
