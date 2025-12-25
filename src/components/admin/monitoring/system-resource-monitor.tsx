"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "@tengra/language";

interface SystemMetrics {
  cpu: {
    usage: number;
    count: number;
    model: string;
    speed: number;
    loadAverage: number[];
  };
  memory: {
    total: number;
    used: number;
    free: number;
    usagePercent: number;
  };
  disk: {
    total: number;
    used: number;
    free: number;
    usagePercent: number;
    path: string;
  };
  network: {
    rx: number;
    tx: number;
    connections: number;
  };
  process: {
    pid: number;
    uptime: number;
    memoryUsage: {
      heapUsed: number;
      heapTotal: number;
      external: number;
      rss: number;
    };
  };
  system: {
    platform: string;
    release: string;
    hostname: string;
    uptime: number;
  };
  timestamp: number;
}

interface MetricHistory {
  timestamp: number;
  cpu: number;
  memory: number;
  disk: number;
}

interface Alert {
  type: string;
  message: string;
  severity: "warning" | "critical";
}

// Format bytes to human readable
function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

// Circular progress component
function CircularProgress({
  value,
  size = 120,
  strokeWidth = 10,
  color = "#00A7C5",
  label,
  sublabel,
}: {
  value: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label: string;
  sublabel?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (Math.min(value, 100) / 100) * circumference;

  // Color based on value
  const getColor = () => {
    if (value >= 90) return "#EF4444";
    if (value >= 75) return "#F59E0B";
    return color;
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-white">{Math.round(value)}%</span>
        <span className="text-xs text-[rgba(255,255,255,0.5)]">{label}</span>
        {sublabel && <span className="text-xs text-[rgba(255,255,255,0.4)]">{sublabel}</span>}
      </div>
    </div>
  );
}

// Mini line chart
function MiniLineChart({
  data,
  height = 60,
  color = "#00A7C5",
}: {
  data: number[];
  height?: number;
  color?: string;
}) {
  if (data.length === 0) return null;

  const max = Math.max(...data, 1);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = height - ((v - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg className="w-full" height={height} viewBox={`0 0 100 ${height}`} preserveAspectRatio="none">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

// Alert component
function AlertBadge({ alert }: { alert: Alert }) {
  const colors = {
    warning: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    critical: "bg-red-500/20 text-red-400 border-red-500/30",
  };

  return (
    <div className={`px-3 py-2 rounded-lg border ${colors[alert.severity]}`}>
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${alert.severity === "critical" ? "bg-red-500 animate-pulse" : "bg-yellow-500"}`} />
        <span className="text-sm">{alert.message}</span>
      </div>
    </div>
  );
}

// Main component
export default function SystemResourceMonitor() {
  const { t } = useTranslation("AdminMonitoring");
  const { language: locale } = useTranslation();
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [history, setHistory] = useState<MetricHistory[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(true);
  const formatDuration = (seconds: number): string => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const parts = [
      days ? t("duration.days", { count: days }) : null,
      hours ? t("duration.hours", { count: hours }) : null,
      minutes ? t("duration.minutes", { count: minutes }) : null,
    ].filter(Boolean);
    return parts.length ? parts.join(" ") : t("duration.minutes", { count: 0 });
  };

  const fetchMetrics = useCallback(async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/system/metrics", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error(t("errors.fetchFailed"));

      const data = await response.json();
      setMetrics(data.current);
      setHistory(data.history || []);
      setAlerts(data.alerts || []);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("errors.unknown"));
      // Generate demo data on error
      generateDemoData();
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  // Generate demo data when API fails
  const generateDemoData = () => {
    const demoMetrics: SystemMetrics = {
      cpu: {
        usage: 35 + Math.random() * 20,
        count: 8,
        model: "Intel Core i7-10700K",
        speed: 3800,
        loadAverage: [1.2, 0.9, 0.7],
      },
      memory: {
        total: 16 * 1024 * 1024 * 1024,
        used: 8.5 * 1024 * 1024 * 1024,
        free: 7.5 * 1024 * 1024 * 1024,
        usagePercent: 53,
      },
      disk: {
        total: 500 * 1024 * 1024 * 1024,
        used: 180 * 1024 * 1024 * 1024,
        free: 320 * 1024 * 1024 * 1024,
        usagePercent: 36,
        path: "/",
      },
      network: {
        rx: 1024 * 1024 * 500,
        tx: 1024 * 1024 * 200,
        connections: 42,
      },
      process: {
        pid: 12345,
        uptime: 86400 * 3,
        memoryUsage: {
          heapUsed: 150 * 1024 * 1024,
          heapTotal: 200 * 1024 * 1024,
          external: 10 * 1024 * 1024,
          rss: 250 * 1024 * 1024,
        },
      },
      system: {
        platform: "linux",
        release: "5.15.0-generic",
        hostname: "tengra-server",
        uptime: 86400 * 30,
      },
      timestamp: Date.now(),
    };

    const demoHistory: MetricHistory[] = Array.from({ length: 24 }, (_, i) => ({
      timestamp: Date.now() - (23 - i) * 3600000,
      cpu: 30 + Math.random() * 40,
      memory: 45 + Math.random() * 20,
      disk: 35 + Math.random() * 5,
    }));

    setMetrics(demoMetrics);
    setHistory(demoHistory);
    setAlerts([]);
  };

  useEffect(() => {
    fetchMetrics();

    let interval: NodeJS.Timeout;
    if (isLive) {
      interval = setInterval(fetchMetrics, 10000); // Refresh every 10 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [fetchMetrics, isLive]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-8 h-8 border-2 border-[rgba(0,167,197,0.3)] border-t-[rgba(0,167,197,1)] rounded-full" />
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">{t("resourceMonitor.title")}</h2>
          <p className="text-sm text-[rgba(255,255,255,0.5)]">
            {metrics.system.hostname} • {metrics.system.platform}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsLive(!isLive)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              isLive
                ? "bg-green-500/20 text-green-400"
                : "bg-[rgba(255,255,255,0.05)] text-[rgba(255,255,255,0.5)]"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isLive ? "bg-green-500 animate-pulse" : "bg-gray-500"}`} />
            {isLive ? t("resourceMonitor.live") : t("resourceMonitor.paused")}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </div>
      )}

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, i) => (
            <AlertBadge key={i} alert={alert} />
          ))}
        </div>
      )}

      {/* Main Resource Gauges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="flex flex-col items-center p-4 rounded-xl border border-[rgba(110,211,225,0.2)] bg-[rgba(6,20,27,0.8)]">
          <CircularProgress
            value={metrics.cpu.usage}
            label={t("resourceMonitor.cards.cpu")}
            sublabel={t("resourceMonitor.cards.cores", { count: metrics.cpu.count.toLocaleString(locale) })}
          />
        </div>
        <div className="flex flex-col items-center p-4 rounded-xl border border-[rgba(110,211,225,0.2)] bg-[rgba(6,20,27,0.8)]">
          <CircularProgress
            value={metrics.memory.usagePercent}
            label={t("resourceMonitor.cards.memory")}
            sublabel={formatBytes(metrics.memory.used)}
            color="#22C55E"
          />
        </div>
        <div className="flex flex-col items-center p-4 rounded-xl border border-[rgba(110,211,225,0.2)] bg-[rgba(6,20,27,0.8)]">
          <CircularProgress
            value={metrics.disk.usagePercent}
            label={t("resourceMonitor.cards.disk")}
            sublabel={formatBytes(metrics.disk.used)}
            color="#A855F7"
          />
        </div>
        <div className="flex flex-col items-center p-4 rounded-xl border border-[rgba(110,211,225,0.2)] bg-[rgba(6,20,27,0.8)]">
          <CircularProgress
            value={(metrics.network.connections / 100) * 100}
            label={t("resourceMonitor.cards.connections")}
            sublabel={t("resourceMonitor.cards.activeConnections", { count: metrics.network.connections.toLocaleString(locale) })}
            color="#EAB308"
          />
        </div>
      </div>

      {/* Historical Charts */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-[rgba(110,211,225,0.2)] bg-[rgba(6,20,27,0.8)] p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-[rgba(255,255,255,0.7)]">{t("resourceMonitor.history.cpu")}</span>
            <span className="text-xs text-[rgba(0,167,197,1)]">{Math.round(metrics.cpu.usage)}%</span>
          </div>
          <MiniLineChart data={history.map((h) => h.cpu)} color="#00A7C5" />
        </div>
        <div className="rounded-xl border border-[rgba(110,211,225,0.2)] bg-[rgba(6,20,27,0.8)] p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-[rgba(255,255,255,0.7)]">{t("resourceMonitor.history.memory")}</span>
            <span className="text-xs text-green-400">{Math.round(metrics.memory.usagePercent)}%</span>
          </div>
          <MiniLineChart data={history.map((h) => h.memory)} color="#22C55E" />
        </div>
        <div className="rounded-xl border border-[rgba(110,211,225,0.2)] bg-[rgba(6,20,27,0.8)] p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-[rgba(255,255,255,0.7)]">{t("resourceMonitor.history.disk")}</span>
            <span className="text-xs text-purple-400">{Math.round(metrics.disk.usagePercent)}%</span>
          </div>
          <MiniLineChart data={history.map((h) => h.disk)} color="#A855F7" />
        </div>
      </div>

      {/* Detailed Info */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* System Info */}
        <div className="rounded-xl border border-[rgba(110,211,225,0.2)] bg-[rgba(6,20,27,0.8)] p-4">
          <h3 className="text-sm font-medium text-[rgba(255,255,255,0.7)] mb-4">{t("resourceMonitor.sections.systemInfo")}</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-[rgba(255,255,255,0.5)]">{t("resourceMonitor.labels.processor")}</span>
              <span className="text-sm text-white">{metrics.cpu.model.slice(0, 30)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-[rgba(255,255,255,0.5)]">{t("resourceMonitor.labels.totalMemory")}</span>
              <span className="text-sm text-white">{formatBytes(metrics.memory.total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-[rgba(255,255,255,0.5)]">{t("resourceMonitor.labels.totalDisk")}</span>
              <span className="text-sm text-white">{formatBytes(metrics.disk.total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-[rgba(255,255,255,0.5)]">{t("resourceMonitor.labels.systemUptime")}</span>
              <span className="text-sm text-white">{formatDuration(metrics.system.uptime)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-[rgba(255,255,255,0.5)]">{t("resourceMonitor.labels.loadAverage")}</span>
              <span className="text-sm text-white">{metrics.cpu.loadAverage.map((l) => l.toFixed(2)).join(", ")}</span>
            </div>
          </div>
        </div>

        {/* Process Info */}
        <div className="rounded-xl border border-[rgba(110,211,225,0.2)] bg-[rgba(6,20,27,0.8)] p-4">
          <h3 className="text-sm font-medium text-[rgba(255,255,255,0.7)] mb-4">{t("resourceMonitor.sections.processInfo")}</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-[rgba(255,255,255,0.5)]">{t("resourceMonitor.labels.processId")}</span>
              <span className="text-sm text-white">{metrics.process.pid}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-[rgba(255,255,255,0.5)]">{t("resourceMonitor.labels.processUptime")}</span>
              <span className="text-sm text-white">{formatDuration(metrics.process.uptime)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-[rgba(255,255,255,0.5)]">{t("resourceMonitor.labels.heapUsage")}</span>
              <span className="text-sm text-white">{formatBytes(metrics.process.memoryUsage.heapUsed)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-[rgba(255,255,255,0.5)]">{t("resourceMonitor.labels.rssMemory")}</span>
              <span className="text-sm text-white">{formatBytes(metrics.process.memoryUsage.rss)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-[rgba(255,255,255,0.5)]">{t("resourceMonitor.labels.networkRxTx")}</span>
              <span className="text-sm text-white">
                {formatBytes(metrics.network.rx)} / {formatBytes(metrics.network.tx)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
