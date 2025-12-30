"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import AdminPageHeader from "@/components/admin/admin-page-header";
import {
    Shield,
    AlertTriangle,
    CheckCircle,
    XCircle,
    User,
    Search,
    Filter,
    ChevronDown,
    Clock,
    Globe,
    Monitor,
} from "lucide-react";

type AuditLogEntry = {
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
};

const ACTION_COLORS: Record<string, string> = {
    login_success: "text-emerald-400",
    login_failed: "text-red-400",
    logout: "text-yellow-400",
    register: "text-blue-400",
    password_reset_request: "text-orange-400",
    password_reset_success: "text-emerald-400",
    password_change: "text-purple-400",
    session_revoke: "text-red-400",
    session_revoke_all: "text-red-500",
    profile_update: "text-cyan-400",
    email_verified: "text-emerald-400",
    admin_access: "text-amber-400",
    suspicious_activity: "text-red-500",
    rate_limit_exceeded: "text-orange-500",
};

const ACTION_LABELS: Record<string, string> = {
    login_success: "Başarılı Giriş",
    login_failed: "Başarısız Giriş",
    logout: "Çıkış",
    register: "Kayıt",
    password_reset_request: "Şifre Sıfırlama Talebi",
    password_reset_success: "Şifre Sıfırlandı",
    password_change: "Şifre Değişikliği",
    session_revoke: "Oturum İptal",
    session_revoke_all: "Tüm Oturumlar İptal",
    profile_update: "Profil Güncelleme",
    email_verified: "Email Doğrulandı",
    admin_access: "Admin Erişimi",
    suspicious_activity: "Şüpheli Aktivite",
    rate_limit_exceeded: "Rate Limit Aşıldı",
};

function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat("tr-TR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    }).format(date);
}

function getRelativeTime(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Az önce";
    if (minutes < 60) return `${minutes} dk önce`;
    if (hours < 24) return `${hours} saat önce`;
    if (days < 7) return `${days} gün önce`;
    return formatDate(dateStr);
}

const MAX_LOGS = 250;
const LIVE_LOG_COUNT = 20;

export default function AdminAuditPage() {
    const [logs, setLogs] = useState<AuditLogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [actionFilter, setActionFilter] = useState<string>("all");
    const [successFilter, setSuccessFilter] = useState<"all" | "success" | "failed">("failed");

    useEffect(() => {
        const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
        if (!token) {
            setLoading(false);
            return;
        }

        let isMounted = true;

        const fetchLogs = async () => {
            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/admin/audit-logs`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            Accept: "application/json",
                        },
                    }
                );
                const data = await res.json();
                if (!isMounted) return;
                if (data.success && Array.isArray(data.logs)) {
                    const sorted = [...data.logs].sort(
                        (a: AuditLogEntry, b: AuditLogEntry) =>
                            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                    );
                    setLogs(sorted.slice(0, MAX_LOGS));
                }
            } catch (err) {
                if (process.env.NODE_ENV !== "production") {
                    console.error(err);
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchLogs();
        const id = setInterval(fetchLogs, 10000);
        return () => {
            isMounted = false;
            clearInterval(id);
        };
    }, []);

    const filteredLogs = useMemo(() => {
        return logs.filter((log) => {
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const matchesSearch =
                    log.action.toLowerCase().includes(query) ||
                    (log.ip && log.ip.includes(query)) ||
                    (log.country && log.country.toLowerCase().includes(query)) ||
                    (log.city && log.city.toLowerCase().includes(query)) ||
                    String(log.userId).includes(query);
                if (!matchesSearch) return false;
            }
            if (actionFilter !== "all" && log.action !== actionFilter) return false;
            if (successFilter === "success" && !log.success) return false;
            if (successFilter === "failed" && log.success) return false;
            return true;
        });
    }, [logs, searchQuery, actionFilter, successFilter]);

    const stats = useMemo(() => {
        const total = logs.length;
        const successful = logs.filter((l) => l.success).length;
        const failed = logs.filter((l) => !l.success).length;
        const loginFailed = logs.filter((l) => l.action === "login_failed").length;
        return { total, successful, failed, loginFailed };
    }, [logs]);

    const uniqueActions = useMemo(() => {
        return Array.from(new Set(logs.map((l) => l.action)));
    }, [logs]);

    const liveLogs = useMemo(
        () => logs.filter((l) => !l.success).slice(0, LIVE_LOG_COUNT),
        [logs]
    );

    return (
        <div className="space-y-8 text-sm">
            <AdminPageHeader
                title="Audit Logs"
                description="Güvenlik olaylarını ve kullanıcı aktivitelerini izleyin."
            />

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="rounded-xl bg-[rgba(15,31,54,0.6)] border border-[rgba(72,213,255,0.12)] p-4">
                    <div className="flex items-center gap-3">
                        <Shield className="w-8 h-8 text-[var(--color-turkish-blue-400)]" />
                        <div>
                            <p className="text-xl font-bold text-[var(--text-primary)]">{stats.total}</p>
                            <p className="text-xs text-[var(--text-muted)]">Toplam Olay</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl bg-[rgba(15,31,54,0.6)] border border-[rgba(72,213,255,0.12)] p-4">
                    <div className="flex items-center gap-3">
                        <CheckCircle className="w-8 h-8 text-emerald-400" />
                        <div>
                            <p className="text-xl font-bold text-[var(--text-primary)]">{stats.successful}</p>
                            <p className="text-xs text-[var(--text-muted)]">Başarılı</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl bg-[rgba(15,31,54,0.6)] border border-[rgba(72,213,255,0.12)] p-4">
                    <div className="flex items-center gap-3">
                        <XCircle className="w-8 h-8 text-red-400" />
                        <div>
                            <p className="text-xl font-bold text-[var(--text-primary)]">{stats.failed}</p>
                            <p className="text-xs text-[var(--text-muted)]">Başarısız</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl bg-[rgba(15,31,54,0.6)] border border-[rgba(72,213,255,0.12)] p-4">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="w-8 h-8 text-orange-400" />
                        <div>
                            <p className="text-xl font-bold text-[var(--text-primary)]">{stats.loginFailed}</p>
                            <p className="text-xs text-[var(--text-muted)]">Başarısız Giriş</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-wrap gap-4"
            >
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                    <input
                        type="text"
                        placeholder="IP, kullanıcı ID, şehir ara..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-[rgba(15,31,54,0.6)] border border-[rgba(72,213,255,0.12)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--color-turkish-blue-500)]"
                    />
                </div>
                <div className="relative">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                    <select
                        value={actionFilter}
                        onChange={(e) => setActionFilter(e.target.value)}
                        className="appearance-none pl-11 pr-10 py-3 rounded-xl bg-[rgba(15,31,54,0.6)] border border-[rgba(72,213,255,0.12)] text-[var(--text-secondary)] focus:outline-none focus:border-[var(--color-turkish-blue-500)]"
                    >
                        <option value="all">Tüm Aksiyonlar</option>
                        {uniqueActions.map((action) => (
                            <option key={action} value={action}>
                                {ACTION_LABELS[action] || action}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
                </div>
                <div className="relative">
                    <select
                        value={successFilter}
                        onChange={(e) => setSuccessFilter(e.target.value as "all" | "success" | "failed")}
                        className="appearance-none pl-4 pr-10 py-3 rounded-xl bg-[rgba(15,31,54,0.6)] border border-[rgba(72,213,255,0.12)] text-[var(--text-secondary)] focus:outline-none focus:border-[var(--color-turkish-blue-500)]"
                    >
                        <option value="all">Tüm Sonuçlar</option>
                        <option value="success">Başarılı</option>
                        <option value="failed">Başarısız (varsayılan)</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
                </div>
            </motion.div>

            {/* Logs Table */}
            {loading ? (
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div
                            key={i}
                            className="h-20 rounded-xl bg-[rgba(15,31,54,0.4)] border border-[rgba(72,213,255,0.08)] animate-pulse"
                        />
                    ))}
                </div>
            ) : filteredLogs.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="rounded-2xl border border-dashed border-[rgba(72,213,255,0.15)] bg-[rgba(15,31,54,0.4)] p-12 text-center"
                >
                    <Shield className="w-12 h-12 mx-auto text-[var(--text-muted)] mb-4" />
                    <p className="text-[var(--text-muted)]">
                        {searchQuery || actionFilter !== "all" || successFilter !== "all"
                            ? "Filtrelere uygun log bulunamadı."
                            : "Henüz audit log bulunmuyor."}
                    </p>
                </motion.div>
            ) : (
                <div className="space-y-3">
                    {filteredLogs.slice(0, 100).map((log) => (
                        <motion.div
                            key={log.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="rounded-xl bg-[rgba(15,31,54,0.6)] border border-[rgba(72,213,255,0.12)] p-4 hover:border-[rgba(72,213,255,0.25)] transition-colors"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-start gap-4">
                                <div className={`p-2 rounded-lg ${log.success ? "bg-emerald-500/10" : "bg-red-500/10"}`}>
                                    {log.success ? (
                                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                                    ) : (
                                        <XCircle className="w-5 h-5 text-red-400" />
                                    )}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className={`font-medium text-sm ${ACTION_COLORS[log.action] || "text-[var(--text-primary)]"}`}>
                                            {ACTION_LABELS[log.action] || log.action}
                                        </span>
                                        {log.userId && (
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-[rgba(30,184,255,0.1)] text-[var(--color-turkish-blue-300)]">
                                                <User className="w-3 h-3 inline mr-1" />
                                                    ID: {log.userId}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4 mt-2 text-xs text-[var(--text-muted)]">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {getRelativeTime(log.createdAt)}
                                            </span>
                                            {log.ip && (
                                                <span className="flex items-center gap-1">
                                                    <Monitor className="w-3 h-3" />
                                                    {log.ip}
                                                </span>
                                            )}
                                            {(log.country || log.city) && (
                                                <span className="flex items-center gap-1">
                                                    <Globe className="w-3 h-3" />
                                                    {[log.city, log.country].filter(Boolean).join(", ")}
                                                </span>
                                            )}
                                        </div>
                                        {log.details && Object.keys(log.details).length > 0 && (
                                            <div className="mt-2 text-xs text-[var(--text-muted)]">
                                                <code className="bg-[rgba(0,0,0,0.2)] px-2 py-1 rounded">
                                                    {JSON.stringify(log.details)}
                                                </code>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="text-xs text-[var(--text-muted)] whitespace-nowrap">
                                    {formatDate(log.createdAt)}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Live stream (success logs hidden) */}
            <div className="rounded-2xl border border-[rgba(72,213,255,0.12)] bg-[rgba(15,31,54,0.55)] p-4 space-y-3">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-semibold text-[var(--text-primary)]">Anlık Log Akışı</h3>
                        <p className="text-xs text-[var(--text-muted)]">
                            Başarılı olaylar gizlenir; son {LIVE_LOG_COUNT} kritik kayıt gösterilir.
                        </p>
                    </div>
                    <div className="text-xs text-[var(--text-muted)]">{liveLogs.length} kayıt</div>
                </div>
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                    {liveLogs.length === 0 ? (
                        <div className="text-xs text-[var(--text-muted)]">Görüntülenecek kritik log yok.</div>
                    ) : (
                        liveLogs.map((log) => (
                            <div
                                key={`live-${log.id}`}
                                className="flex items-start justify-between rounded-lg bg-[rgba(255,99,132,0.06)] border border-[rgba(255,99,132,0.2)] px-3 py-2"
                            >
                                <div className="flex items-start gap-2">
                                    <XCircle className="w-4 h-4 text-red-400 mt-0.5" />
                                    <div>
                                        <div className="flex flex-wrap items-center gap-2 text-xs">
                                            <span className={`font-semibold ${ACTION_COLORS[log.action] || "text-[var(--text-primary)]"}`}>
                                                {ACTION_LABELS[log.action] || log.action}
                                            </span>
                                            {log.userId && (
                                                <span className="px-2 py-0.5 rounded-full bg-[rgba(30,184,255,0.1)] text-[var(--color-turkish-blue-300)]">
                                                    ID: {log.userId}
                                                </span>
                                            )}
                                            {log.ip && <span className="text-[var(--text-muted)]">{log.ip}</span>}
                                        </div>
                                        <div className="text-[11px] text-[var(--text-muted)]">
                                            {getRelativeTime(log.createdAt)}
                                        </div>
                                    </div>
                                </div>
                                <span className="text-[11px] text-[var(--text-muted)] whitespace-nowrap">{formatDate(log.createdAt)}</span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
