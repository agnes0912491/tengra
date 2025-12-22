"use client";

import { useState, useEffect, useCallback } from "react";
import { useLocale, useTranslations } from "next-intl";

interface BackupStatus {
  enabled: boolean;
  isRunning: boolean;
  schedule: string;
  lastBackup: {
    id: string;
    type: string;
    status: string;
    timestamp: number;
    size: number;
    duration: number;
    path: string;
  } | null;
  retention: {
    daily: number;
    weekly: number;
    monthly: number;
  };
}

interface BackupHistoryEntry {
  id: string;
  type: string;
  status: string;
  timestamp: number;
  size: number;
  duration: number;
  path: string;
}

// Format bytes
function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

// Status badge component
function StatusBadge({ status }: { status: string }) {
  const t = useTranslations("AdminBackup");
  const colors = {
    success: "bg-green-500/20 text-green-400 border-green-500/30",
    failed: "bg-red-500/20 text-red-400 border-red-500/30",
    partial: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    running: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  };

  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
        colors[status as keyof typeof colors] || colors.failed
      }`}
    >
      {status === "success"
        ? t("status.success")
        : status === "failed"
          ? t("status.failed")
          : status === "partial"
            ? t("status.partial")
            : status === "running"
              ? t("status.running")
              : status}
    </span>
  );
}

// Main component
export default function BackupSchedulingDashboard() {
  const locale = useLocale();
  const t = useTranslations("AdminBackup");
  const [status, setStatus] = useState<BackupStatus | null>(null);
  const [history, setHistory] = useState<BackupHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const token = localStorage.getItem("authToken");
      const headers = { Authorization: `Bearer ${token}` };

      const [statusRes, historyRes] = await Promise.all([
        fetch("/api/backup/status", { headers }),
        fetch("/api/backup/history", { headers }),
      ]);

      if (!statusRes.ok || !historyRes.ok) {
        throw new Error(t("error.fetchFailed"));
      }

      const statusData = await statusRes.json();
      const historyData = await historyRes.json();

      setStatus(statusData);
      setHistory(historyData);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("error.unknown"));
      // Generate demo data
      generateDemoData();
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  const generateDemoData = () => {
    const demoStatus: BackupStatus = {
      enabled: true,
      isRunning: false,
      schedule: "0 2 * * *",
      lastBackup: {
        id: "backup_1703980800000",
        type: "full",
        status: "success",
        timestamp: Date.now() - 3600000,
        size: 256 * 1024 * 1024,
        duration: 45000,
        path: "/srv/tengra/backups/backup_1703980800000",
      },
      retention: { daily: 7, weekly: 4, monthly: 3 },
    };

    const demoHistory: BackupHistoryEntry[] = Array.from({ length: 10 }, (_, i) => ({
      id: `backup_${Date.now() - i * 86400000}`,
      type: "full",
      status: i === 3 ? "failed" : "success",
      timestamp: Date.now() - i * 86400000,
      size: (200 + Math.random() * 100) * 1024 * 1024,
      duration: 30000 + Math.random() * 30000,
      path: `/srv/tengra/backups/backup_${Date.now() - i * 86400000}`,
    }));

    setStatus(demoStatus);
    setHistory(demoHistory);
  };

  const triggerBackup = async () => {
    setIsBackingUp(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/backup/trigger", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error(t("error.backupFailed"));

      // Refresh data
      await fetchData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("error.unknown"));
    } finally {
      setIsBackingUp(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [fetchData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-8 h-8 border-2 border-[rgba(0,167,197,0.3)] border-t-[rgba(0,167,197,1)] rounded-full" />
      </div>
    );
  }

  if (!status) return null;

  // Parse cron schedule
  const parseCronSchedule = (cron: string): string => {
    const [minute, hour] = cron.split(" ");
    return t("schedule.dailyAt", { time: `${hour}:${minute.padStart(2, "0")}` });
  };

  const formatDuration = (ms: number): string => {
    if (ms < 1000) return t("duration.milliseconds", { ms });
    if (ms < 60000) return t("duration.seconds", { seconds: (ms / 1000).toFixed(1) });
    return t("duration.minutes", {
      minutes: Math.floor(ms / 60000),
      seconds: Math.floor((ms % 60000) / 1000),
    });
  };

  const formatDate = (timestamp: number): string =>
    new Date(timestamp).toLocaleString(locale, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  // Calculate stats
  const totalBackups = history.length;
  const successRate = totalBackups > 0 ? (history.filter((h) => h.status === "success").length / totalBackups) * 100 : 0;
  const totalSize = history.reduce((sum, h) => sum + h.size, 0);
  const avgDuration = totalBackups > 0 ? history.reduce((sum, h) => sum + h.duration, 0) / totalBackups : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">{t("header.title")}</h2>
          <p className="text-sm text-[rgba(255,255,255,0.5)]">
            {t("header.subtitle")}
          </p>
        </div>
        <button
          onClick={triggerBackup}
          disabled={isBackingUp || status.isRunning}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[rgba(0,167,197,0.2)] text-[rgba(0,167,197,1)] font-medium hover:bg-[rgba(0,167,197,0.3)] transition-colors disabled:opacity-50"
        >
          {isBackingUp || status.isRunning ? (
            <>
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              {t("actions.backingUp")}
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
              {t("actions.manualBackup")}
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-200">
          {error}
        </div>
      )}

      {/* Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-[rgba(110,211,225,0.2)] bg-[rgba(6,20,27,0.8)] p-4">
          <p className="text-sm text-[rgba(255,255,255,0.5)]">{t("stats.status")}</p>
          <div className="mt-2 flex items-center gap-2">
            <span
              className={`w-3 h-3 rounded-full ${
                status.enabled ? "bg-green-500 animate-pulse" : "bg-gray-500"
              }`}
            />
            <span className="text-lg font-semibold text-white">
              {status.enabled ? t("stats.active") : t("stats.inactive")}
            </span>
          </div>
        </div>
        <div className="rounded-xl border border-[rgba(110,211,225,0.2)] bg-[rgba(6,20,27,0.8)] p-4">
          <p className="text-sm text-[rgba(255,255,255,0.5)]">{t("stats.successRate")}</p>
          <p className="mt-2 text-lg font-semibold text-white">{successRate.toFixed(0)}%</p>
        </div>
        <div className="rounded-xl border border-[rgba(110,211,225,0.2)] bg-[rgba(6,20,27,0.8)] p-4">
          <p className="text-sm text-[rgba(255,255,255,0.5)]">{t("stats.totalSize")}</p>
          <p className="mt-2 text-lg font-semibold text-white">{formatBytes(totalSize)}</p>
        </div>
        <div className="rounded-xl border border-[rgba(110,211,225,0.2)] bg-[rgba(6,20,27,0.8)] p-4">
          <p className="text-sm text-[rgba(255,255,255,0.5)]">{t("stats.avgDuration")}</p>
          <p className="mt-2 text-lg font-semibold text-white">{formatDuration(avgDuration)}</p>
        </div>
      </div>

      {/* Schedule Info */}
      <div className="rounded-xl border border-[rgba(110,211,225,0.2)] bg-[rgba(6,20,27,0.8)] p-4">
        <h3 className="text-sm font-medium text-[rgba(255,255,255,0.7)] mb-4">{t("schedule.title")}</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[rgba(0,167,197,0.2)] flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-[rgba(0,167,197,1)]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-white font-medium">{parseCronSchedule(status.schedule)}</p>
                <p className="text-sm text-[rgba(255,255,255,0.4)]">{t("schedule.cron", { cron: status.schedule })}</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-[rgba(255,255,255,0.5)]">{t("retention.title")}</p>
            <div className="flex gap-4">
              <div className="text-center">
                <p className="text-lg font-bold text-white">{status.retention.daily}</p>
                <p className="text-xs text-[rgba(255,255,255,0.4)]">{t("retention.daily")}</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-white">{status.retention.weekly}</p>
                <p className="text-xs text-[rgba(255,255,255,0.4)]">{t("retention.weekly")}</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-white">{status.retention.monthly}</p>
                <p className="text-xs text-[rgba(255,255,255,0.4)]">{t("retention.monthly")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Last Backup */}
      {status.lastBackup && (
        <div className="rounded-xl border border-[rgba(110,211,225,0.2)] bg-[rgba(6,20,27,0.8)] p-4">
          <h3 className="text-sm font-medium text-[rgba(255,255,255,0.7)] mb-4">{t("lastBackup.title")}</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  status.lastBackup.status === "success"
                    ? "bg-green-500/20"
                    : "bg-red-500/20"
                }`}
              >
                {status.lastBackup.status === "success" ? (
                  <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
              <div>
                <p className="text-white font-medium">{formatDate(status.lastBackup.timestamp)}</p>
                <p className="text-sm text-[rgba(255,255,255,0.4)]">
                  {formatBytes(status.lastBackup.size)} • {formatDuration(status.lastBackup.duration)}
                </p>
              </div>
            </div>
            <StatusBadge status={status.lastBackup.status} />
          </div>
        </div>
      )}

      {/* Backup History */}
      <div className="rounded-xl border border-[rgba(110,211,225,0.2)] bg-[rgba(6,20,27,0.8)] overflow-hidden">
        <div className="p-4 border-b border-[rgba(255,255,255,0.05)]">
          <h3 className="text-sm font-medium text-[rgba(255,255,255,0.7)]">{t("history.title")}</h3>
        </div>
        <div className="divide-y divide-[rgba(255,255,255,0.05)]">
          {history.length === 0 ? (
            <div className="p-8 text-center text-[rgba(255,255,255,0.4)]">
              {t("history.empty")}
            </div>
          ) : (
            history.slice(0, 10).map((entry) => (
              <div key={entry.id} className="p-4 flex items-center justify-between hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      entry.status === "success" ? "bg-green-500/10" : "bg-red-500/10"
                    }`}
                  >
                    {entry.status === "success" ? (
                      <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-white">{entry.id}</p>
                    <p className="text-xs text-[rgba(255,255,255,0.4)]">{formatDate(entry.timestamp)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-[rgba(255,255,255,0.5)]">{formatBytes(entry.size)}</span>
                  <span className="text-sm text-[rgba(255,255,255,0.4)]">{formatDuration(entry.duration)}</span>
                  <StatusBadge status={entry.status} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Info */}
      <div className="rounded-xl border border-[rgba(110,211,225,0.2)] bg-[rgba(6,20,27,0.8)] p-4">
        <h3 className="text-sm font-medium text-[rgba(255,255,255,0.7)] mb-3">{t("content.title")}</h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm text-[rgba(255,255,255,0.5)]">
          <div>
            <p className="font-medium text-white mb-1">{t("content.databases.title")}</p>
            <ul className="list-disc list-inside space-y-1">
              <li>{t("content.databases.item1")}</li>
              <li>{t("content.databases.item2")}</li>
            </ul>
          </div>
          <div>
            <p className="font-medium text-white mb-1">{t("content.files.title")}</p>
            <ul className="list-disc list-inside space-y-1">
              <li>{t("content.files.item1")}</li>
              <li>{t("content.files.item2")}</li>
            </ul>
          </div>
          <div>
            <p className="font-medium text-white mb-1">{t("content.storage.title")}</p>
            <ul className="list-disc list-inside space-y-1">
              <li>{t("content.storage.item1")}</li>
              <li>{t("content.storage.item2")}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
