'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTranslations } from 'next-intl';

interface OverviewData {
    today: number;
    week: number;
    month: number;
    unique_today: number;
}

interface RealtimeData {
    active_now: number;
    unique_visitors: number;
}

interface TimeseriesItem {
    date: string;
    views: number;
}

interface GeoItem {
    country: string;
    views: number;
}

interface DeviceItem {
    device: string;
    views: number;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.tengra.studio';

export default function AnalyticsDashboard() {
    const { user, token } = useAuth();
    const t = useTranslations('Admin');

    const [overview, setOverview] = useState<OverviewData | null>(null);
    const [realtime, setRealtime] = useState<RealtimeData | null>(null);
    const [timeseries, setTimeseries] = useState<TimeseriesItem[]>([]);
    const [geo, setGeo] = useState<GeoItem[]>([]);
    const [devices, setDevices] = useState<DeviceItem[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        if (!token) return;

        const headers = { Authorization: `Bearer ${token}` };

        try {
            const [overviewRes, realtimeRes, timeseriesRes, geoRes, devicesRes] = await Promise.all([
                fetch(`${API_BASE}/analytics/overview`, { headers }),
                fetch(`${API_BASE}/analytics/realtime`, { headers }),
                fetch(`${API_BASE}/analytics/timeseries`, { headers }),
                fetch(`${API_BASE}/analytics/geo`, { headers }),
                fetch(`${API_BASE}/analytics/devices`, { headers }),
            ]);

            if (overviewRes.ok) setOverview(await overviewRes.json());
            if (realtimeRes.ok) setRealtime(await realtimeRes.json());
            if (timeseriesRes.ok) {
                const data = await timeseriesRes.json();
                setTimeseries(data.data || []);
            }
            if (geoRes.ok) {
                const data = await geoRes.json();
                setGeo(data.countries || []);
            }
            if (devicesRes.ok) {
                const data = await devicesRes.json();
                setDevices(data.devices || []);
            }
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // Realtime refresh every 30 seconds
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, [token]);

    if (!user?.isAdmin) {
        return <div className="p-8 text-center text-red-500">Access denied</div>;
    }

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    const maxViews = Math.max(...timeseries.map(t => t.views), 1);

    return (
        <div className="p-6 space-y-6 bg-gray-900 min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
                <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                    <span className="text-green-400 font-medium">
                        {realtime?.active_now || 0} active now
                    </span>
                </div>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard
                    title="Today"
                    value={overview?.today || 0}
                    subtitle="page views"
                    color="blue"
                />
                <StatCard
                    title="Unique Today"
                    value={overview?.unique_today || 0}
                    subtitle="visitors"
                    color="green"
                />
                <StatCard
                    title="This Week"
                    value={overview?.week || 0}
                    subtitle="page views"
                    color="purple"
                />
                <StatCard
                    title="This Month"
                    value={overview?.month || 0}
                    subtitle="page views"
                    color="orange"
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Traffic Chart */}
                <div className="bg-gray-800 rounded-lg p-6">
                    <h2 className="text-lg font-semibold text-white mb-4">Traffic (Last 30 Days)</h2>
                    <div className="h-48 flex items-end gap-1">
                        {timeseries.slice(-30).map((item, idx) => (
                            <div
                                key={idx}
                                className="flex-1 bg-blue-500 hover:bg-blue-400 transition-colors rounded-t"
                                style={{ height: `${(item.views / maxViews) * 100}%`, minHeight: 4 }}
                                title={`${item.date}: ${item.views} views`}
                            />
                        ))}
                    </div>
                    <div className="mt-2 flex justify-between text-xs text-gray-500">
                        <span>{timeseries[0]?.date || '-'}</span>
                        <span>{timeseries[timeseries.length - 1]?.date || '-'}</span>
                    </div>
                </div>

                {/* Device Breakdown */}
                <div className="bg-gray-800 rounded-lg p-6">
                    <h2 className="text-lg font-semibold text-white mb-4">Devices</h2>
                    <div className="space-y-3">
                        {devices.slice(0, 6).map((device, idx) => {
                            const total = devices.reduce((sum, d) => sum + d.views, 0) || 1;
                            const percent = Math.round((device.views / total) * 100);
                            return (
                                <div key={idx}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-300">{device.device || 'Unknown'}</span>
                                        <span className="text-gray-500">{device.views} ({percent}%)</span>
                                    </div>
                                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                                            style={{ width: `${percent}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Tables Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Countries */}
                <div className="bg-gray-800 rounded-lg p-6">
                    <h2 className="text-lg font-semibold text-white mb-4">Top Countries</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-gray-500 text-sm">
                                    <th className="pb-3">Country</th>
                                    <th className="pb-3 text-right">Views</th>
                                </tr>
                            </thead>
                            <tbody>
                                {geo.slice(0, 10).map((item, idx) => (
                                    <tr key={idx} className="border-t border-gray-700">
                                        <td className="py-2 text-gray-300">
                                            <span className="mr-2">{getCountryFlag(item.country)}</span>
                                            {item.country}
                                        </td>
                                        <td className="py-2 text-right text-gray-400">{item.views}</td>
                                    </tr>
                                ))}
                                {geo.length === 0 && (
                                    <tr><td colSpan={2} className="py-4 text-center text-gray-500">No data</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Real-time Stats */}
                <div className="bg-gray-800 rounded-lg p-6">
                    <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-700 rounded-lg p-4 text-center">
                            <div className="text-3xl font-bold text-green-400">{realtime?.active_now || 0}</div>
                            <div className="text-sm text-gray-400 mt-1">Active Now</div>
                        </div>
                        <div className="bg-gray-700 rounded-lg p-4 text-center">
                            <div className="text-3xl font-bold text-blue-400">{realtime?.unique_visitors || 0}</div>
                            <div className="text-sm text-gray-400 mt-1">Last 5 min</div>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-4 text-center">Auto-refreshes every 30 seconds</p>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, subtitle, color }: { title: string; value: number; subtitle: string; color: string }) {
    const colors: Record<string, string> = {
        blue: 'from-blue-500 to-blue-600',
        green: 'from-green-500 to-green-600',
        purple: 'from-purple-500 to-purple-600',
        orange: 'from-orange-500 to-orange-600',
    };

    return (
        <div className={`bg-gradient-to-br ${colors[color]} rounded-lg p-5 text-white`}>
            <div className="text-sm opacity-90">{title}</div>
            <div className="text-3xl font-bold mt-1">{value.toLocaleString()}</div>
            <div className="text-sm opacity-75 mt-1">{subtitle}</div>
        </div>
    );
}

function getCountryFlag(code: string): string {
    const flags: Record<string, string> = {
        US: '🇺🇸', TR: '🇹🇷', DE: '🇩🇪', GB: '🇬🇧', FR: '🇫🇷', NL: '🇳🇱',
        CA: '🇨🇦', AU: '🇦🇺', JP: '🇯🇵', BR: '🇧🇷', IN: '🇮🇳', RU: '🇷🇺',
        CN: '🇨🇳', KR: '🇰🇷', MX: '🇲🇽', ES: '🇪🇸', IT: '🇮🇹', PL: '🇵🇱',
    };
    return flags[code] || '🌍';
}
