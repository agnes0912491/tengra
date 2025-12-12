"use client";

import { useState, useEffect, useCallback } from "react";

interface RealtimeStats {
  activeUsers: number;
  pageViews: number;
  uniqueVisitors: number;
  avgSessionDuration: number;
  topPages: Array<{ path: string; views: number }>;
  topReferrers: Array<{ referrer: string; count: number }>;
  deviceBreakdown: Record<string, number>;
  browserBreakdown: Record<string, number>;
  countryBreakdown: Record<string, number>;
  eventsByType: Record<string, number>;
  recentEvents: Array<{
    type: string;
    path?: string;
    userId?: string;
    timestamp: number;
    metadata?: Record<string, unknown>;
  }>;
  requestsPerMinute: number;
  errorsPerMinute: number;
}

// Real-time stat card
function StatCard({
  title,
  value,
  change,
  icon,
  color = "cyan",
}: {
  title: string;
  value: number | string;
  change?: number;
  icon: React.ReactNode;
  color?: "cyan" | "green" | "yellow" | "red" | "purple";
}) {
  const colorClasses = {
    cyan: "from-[rgba(0,167,197,0.3)] to-[rgba(110,211,225,0.1)] text-[rgba(0,167,197,1)]",
    green: "from-green-500/30 to-green-500/10 text-green-400",
    yellow: "from-yellow-500/30 to-yellow-500/10 text-yellow-400",
    red: "from-red-500/30 to-red-500/10 text-red-400",
    purple: "from-purple-500/30 to-purple-500/10 text-purple-400",
  };

  return (
    <div className="relative overflow-hidden rounded-xl border border-[rgba(110,211,225,0.2)] bg-[rgba(6,20,27,0.8)] p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[rgba(255,255,255,0.5)]">{title}</p>
          <p className="mt-1 text-2xl font-bold text-white">{value}</p>
          {change !== undefined && (
            <p className={`mt-1 text-xs ${change >= 0 ? "text-green-400" : "text-red-400"}`}>
              {change >= 0 ? "+" : ""}
              {change}%
            </p>
          )}
        </div>
        <div className={`p-2 rounded-lg bg-gradient-to-br ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// Mini chart component
function MiniChart({ data, color = "#00A7C5" }: { data: number[]; color?: string }) {
  const max = Math.max(...data, 1);
  const points = data.map((v, i) => `${(i / (data.length - 1)) * 100},${100 - (v / max) * 100}`).join(" ");

  return (
    <svg className="w-full h-12" viewBox="0 0 100 100" preserveAspectRatio="none">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
      <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor={color} stopOpacity="0.3" />
        <stop offset="100%" stopColor={color} stopOpacity="0" />
      </linearGradient>
      <polygon
        fill="url(#chartGradient)"
        points={`0,100 ${points} 100,100`}
      />
    </svg>
  );
}

// Live event feed
function LiveEventFeed({ events }: { events: RealtimeStats["recentEvents"] }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const updateNow = () => setNow(Date.now());
    const interval = setInterval(updateNow, 60000);
    return () => clearInterval(interval);
  }, []);

  const getEventIcon = (type: string) => {
    switch (type) {
      case "page_view":
        return "👁️";
      case "login":
        return "🔑";
      case "signup":
        return "✨";
      case "purchase":
        return "💰";
      case "error":
        return "❌";
      default:
        return "📊";
    }
  };

  const formatTime = (ts: number) => {
    const diff = now - ts;
    if (diff < 60000) return "şimdi";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}dk önce`;
    return `${Math.floor(diff / 3600000)}sa önce`;
  };

  return (
    <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
      {events.map((event, i) => (
        <div
          key={i}
          className="flex items-center gap-3 p-2 rounded-lg bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.05)] transition-colors animate-fade-in"
        >
          <span className="text-lg">{getEventIcon(event.type)}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white truncate">
              {event.type === "page_view" ? event.path : event.type}
            </p>
            <p className="text-xs text-[rgba(255,255,255,0.4)]">
              {event.userId ? `User: ${event.userId.slice(0, 8)}...` : "Anonim"}
            </p>
          </div>
          <span className="text-xs text-[rgba(255,255,255,0.4)]">{formatTime(event.timestamp)}</span>
        </div>
      ))}
    </div>
  );
}

// Pie chart component
function DonutChart({
  data,
  colors,
}: {
  data: Record<string, number>;
  colors: string[];
}) {
  const total = Object.values(data).reduce((sum, v) => sum + v, 0) || 1;
  const entries = Object.entries(data).slice(0, 5);
  let startAngle = 0;

  return (
    <div className="flex items-center gap-4">
      <svg className="w-24 h-24" viewBox="0 0 100 100">
        {entries.map(([key, value], i) => {
          const angle = (value / total) * 360;
          const endAngle = startAngle + angle;
          const largeArc = angle > 180 ? 1 : 0;

          const x1 = 50 + 40 * Math.cos((Math.PI * startAngle) / 180);
          const y1 = 50 + 40 * Math.sin((Math.PI * startAngle) / 180);
          const x2 = 50 + 40 * Math.cos((Math.PI * endAngle) / 180);
          const y2 = 50 + 40 * Math.sin((Math.PI * endAngle) / 180);

          const path = `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`;
          startAngle = endAngle;

          return <path key={key} d={path} fill={colors[i % colors.length]} opacity="0.8" />;
        })}
        <circle cx="50" cy="50" r="25" fill="rgba(6,20,27,1)" />
      </svg>
      <div className="space-y-1">
        {entries.map(([key, value], i) => (
          <div key={key} className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors[i % colors.length] }} />
            <span className="text-[rgba(255,255,255,0.7)]">{key}</span>
            <span className="text-[rgba(255,255,255,0.4)]">{((value / total) * 100).toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Main dashboard component
export default function RealTimeAnalyticsDashboard() {
  const [stats, setStats] = useState<RealtimeStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(true);
  const [pageViewHistory, setPageViewHistory] = useState<number[]>([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);

  const fetchStats = useCallback(async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/analytics/realtime", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch stats");

      const data = await response.json();
      setStats(data);

      // Update history
      setPageViewHistory((prev) => {
        const newHistory = [...prev.slice(1), data.requestsPerMinute];
        return newHistory;
      });

      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Bilinmeyen hata");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();

    let interval: NodeJS.Timeout;
    if (isLive) {
      interval = setInterval(fetchStats, 5000); // Refresh every 5 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [fetchStats, isLive]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-8 h-8 border-2 border-[rgba(0,167,197,0.3)] border-t-[rgba(0,167,197,1)] rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/20 text-center">
        <p className="text-red-400">{error}</p>
        <button
          onClick={fetchStats}
          className="mt-4 px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
        >
          Tekrar Dene
        </button>
      </div>
    );
  }

  if (!stats) return null;

  const chartColors = ["#00A7C5", "#6ED3E1", "#22C55E", "#EAB308", "#A855F7"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Gerçek Zamanlı Analitik</h2>
          <p className="text-sm text-[rgba(255,255,255,0.5)]">Canlı site metrikleri</p>
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
            {isLive ? "Canlı" : "Durduruldu"}
          </button>
          <button
            onClick={fetchStats}
            className="p-2 rounded-lg bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] transition-colors"
          >
            <svg className="w-4 h-4 text-[rgba(255,255,255,0.7)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Aktif Kullanıcı"
          value={stats.activeUsers}
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
          color="cyan"
        />
        <StatCard
          title="Sayfa Görüntüleme"
          value={stats.pageViews.toLocaleString()}
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}
          color="green"
        />
        <StatCard
          title="İstek/dk"
          value={stats.requestsPerMinute}
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
          color="yellow"
        />
        <StatCard
          title="Hata/dk"
          value={stats.errorsPerMinute}
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
          color="red"
        />
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Traffic Chart */}
        <div className="rounded-xl border border-[rgba(110,211,225,0.2)] bg-[rgba(6,20,27,0.8)] p-4">
          <h3 className="text-sm font-medium text-[rgba(255,255,255,0.7)] mb-4">Trafik (son 10 dk)</h3>
          <MiniChart data={pageViewHistory} />
        </div>

        {/* Device Breakdown */}
        <div className="rounded-xl border border-[rgba(110,211,225,0.2)] bg-[rgba(6,20,27,0.8)] p-4">
          <h3 className="text-sm font-medium text-[rgba(255,255,255,0.7)] mb-4">Cihaz Dağılımı</h3>
          <DonutChart data={stats.deviceBreakdown} colors={chartColors} />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Top Pages */}
        <div className="rounded-xl border border-[rgba(110,211,225,0.2)] bg-[rgba(6,20,27,0.8)] p-4">
          <h3 className="text-sm font-medium text-[rgba(255,255,255,0.7)] mb-4">En Çok Görüntülenen</h3>
          <div className="space-y-2">
            {stats.topPages.slice(0, 5).map((page, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm text-[rgba(255,255,255,0.7)] truncate flex-1">{page.path}</span>
                <span className="text-sm text-[rgba(0,167,197,1)] ml-2">{page.views}</span>
              </div>
            ))}
            {stats.topPages.length === 0 && (
              <p className="text-sm text-[rgba(255,255,255,0.4)]">Henüz veri yok</p>
            )}
          </div>
        </div>

        {/* Browser Breakdown */}
        <div className="rounded-xl border border-[rgba(110,211,225,0.2)] bg-[rgba(6,20,27,0.8)] p-4">
          <h3 className="text-sm font-medium text-[rgba(255,255,255,0.7)] mb-4">Tarayıcılar</h3>
          <DonutChart data={stats.browserBreakdown} colors={chartColors} />
        </div>

        {/* Live Feed */}
        <div className="rounded-xl border border-[rgba(110,211,225,0.2)] bg-[rgba(6,20,27,0.8)] p-4">
          <h3 className="text-sm font-medium text-[rgba(255,255,255,0.7)] mb-4">Canlı Etkinlik</h3>
          <LiveEventFeed events={stats.recentEvents} />
        </div>
      </div>
    </div>
  );
}
