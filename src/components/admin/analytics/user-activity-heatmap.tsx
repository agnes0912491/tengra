"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface HeatmapPoint {
  x: number;
  y: number;
  value: number;
  timestamp?: number;
}

interface ClickData {
  x: number;
  y: number;
  elementTag: string;
  elementId?: string;
  elementClass?: string;
  path: string;
  timestamp: number;
  sessionId?: string;
}

interface ScrollData {
  scrollDepth: number;
  maxScrollDepth: number;
  path: string;
  timestamp: number;
}

// Heatmap Canvas Component
function HeatmapCanvas({
  points,
  width,
  height,
  radius = 30,
  blur = 15,
  maxOpacity = 0.8,
}: {
  points: HeatmapPoint[];
  width: number;
  height: number;
  radius?: number;
  blur?: number;
  maxOpacity?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || points.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Find max value for normalization
    const maxValue = Math.max(...points.map((p) => p.value), 1);

    // Draw each point
    points.forEach((point) => {
      const intensity = point.value / maxValue;
      const gradient = ctx.createRadialGradient(
        point.x,
        point.y,
        0,
        point.x,
        point.y,
        radius
      );

      gradient.addColorStop(0, `rgba(255, 0, 0, ${intensity * maxOpacity})`);
      gradient.addColorStop(0.5, `rgba(255, 255, 0, ${intensity * maxOpacity * 0.5})`);
      gradient.addColorStop(1, "rgba(0, 0, 255, 0)");

      ctx.globalCompositeOperation = "lighter";
      ctx.beginPath();
      ctx.fillStyle = gradient;
      ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
      ctx.fill();
    });

    // Apply blur effect
    if (blur > 0) {
      ctx.filter = `blur(${blur}px)`;
      ctx.drawImage(canvas, 0, 0);
      ctx.filter = "none";
    }
  }, [points, width, height, radius, blur, maxOpacity]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute inset-0 pointer-events-none"
      style={{ mixBlendMode: "multiply" }}
    />
  );
}

// Click Tracking Hook
export function useClickTracking(enabled: boolean = true) {
  const [clicks, setClicks] = useState<ClickData[]>([]);

  useEffect(() => {
    if (!enabled) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const click: ClickData = {
        x: e.clientX,
        y: e.clientY + window.scrollY,
        elementTag: target.tagName.toLowerCase(),
        elementId: target.id || undefined,
        elementClass: target.className || undefined,
        path: window.location.pathname,
        timestamp: Date.now(),
        sessionId: localStorage.getItem("sessionId") || undefined,
      };

      setClicks((prev) => [...prev.slice(-999), click]);

      // Send to analytics
      sendClickData(click);
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [enabled]);

  return { clicks, clearClicks: () => setClicks([]) };
}

// Send click data to server
async function sendClickData(data: ClickData) {
  try {
    const token = localStorage.getItem("authToken");
    await fetch("/api/analytics/clicks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.error("[Heatmap] Failed to send click data:", error);
  }
}

// Scroll Depth Tracking
export function useScrollTracking(enabled: boolean = true) {
  const [scrollData, setScrollData] = useState<ScrollData | null>(null);

  useEffect(() => {
    if (!enabled) return;

    let maxScrollDepth = 0;
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollTop = window.scrollY;
          const docHeight = document.documentElement.scrollHeight - window.innerHeight;
          const scrollDepth = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

          maxScrollDepth = Math.max(maxScrollDepth, scrollDepth);

          setScrollData({
            scrollDepth,
            maxScrollDepth,
            path: window.location.pathname,
            timestamp: Date.now(),
          });

          ticking = false;
        });
        ticking = true;
      }
    };

    // Send scroll depth on page leave
    const handleBeforeUnload = () => {
      if (maxScrollDepth > 0) {
        navigator.sendBeacon(
          "/api/analytics/scroll",
          JSON.stringify({
            maxScrollDepth,
            path: window.location.pathname,
            sessionId: localStorage.getItem("sessionId"),
          })
        );
      }
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [enabled]);

  return scrollData;
}

// Scroll Depth Visualization
function ScrollDepthIndicator({ data }: { data: Array<{ depth: number; count: number }> }) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="relative h-64 w-full rounded-lg bg-[rgba(255,255,255,0.02)] overflow-hidden">
      {/* Depth markers */}
      {[0, 25, 50, 75, 100].map((depth) => (
        <div
          key={depth}
          className="absolute left-0 right-0 border-t border-dashed border-[rgba(255,255,255,0.1)] flex items-center"
          style={{ top: `${depth}%` }}
        >
          <span className="text-xs text-[rgba(255,255,255,0.4)] px-2">{depth}%</span>
        </div>
      ))}

      {/* Bars */}
      <div className="absolute inset-0 flex items-end justify-around p-4 pt-8">
        {data.map((d, i) => (
          <div
            key={i}
            className="w-8 bg-gradient-to-t from-[rgba(0,167,197,0.8)] to-[rgba(110,211,225,0.4)] rounded-t"
            style={{
              height: `${(d.count / maxCount) * 100}%`,
              opacity: 1 - d.depth / 150,
            }}
            title={`${d.depth}%: ${d.count} kullanıcı`}
          />
        ))}
      </div>
    </div>
  );
}

// Main Heatmap Dashboard
export default function UserActivityHeatmap() {
  const [heatmapData, setHeatmapData] = useState<HeatmapPoint[]>([]);
  const [scrollDepthData, setScrollDepthData] = useState<Array<{ depth: number; count: number }>>([]);
  const [selectedPage, setSelectedPage] = useState<string>("/");
  const [pages, setPages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"heatmap" | "scroll">("heatmap");
  const [previewSize] = useState({ width: 1200, height: 800 });

  const containerRef = useRef<HTMLDivElement>(null);

  const fetchHeatmapData = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("authToken");
      const response = await fetch(`/api/analytics/heatmap?page=${encodeURIComponent(selectedPage)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch heatmap data");

      const data = await response.json();
      setHeatmapData(data.clicks || []);
      setScrollDepthData(data.scrollDepth || []);
      setPages(data.pages || [selectedPage]);
    } catch (error) {
      console.error("[Heatmap] Fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedPage]);

  useEffect(() => {
    fetchHeatmapData();
  }, [fetchHeatmapData]);

  // Mock data for demo
  useEffect(() => {
    if (heatmapData.length === 0 && !isLoading) {
      // Generate demo data
      const demoPoints: HeatmapPoint[] = [];
      for (let i = 0; i < 100; i++) {
        demoPoints.push({
          x: Math.random() * previewSize.width,
          y: Math.random() * previewSize.height * 0.4,
          value: Math.random() * 10 + 1,
        });
      }
      // More clicks near buttons/links area
      for (let i = 0; i < 50; i++) {
        demoPoints.push({
          x: previewSize.width * 0.5 + (Math.random() - 0.5) * 200,
          y: previewSize.height * 0.3 + (Math.random() - 0.5) * 50,
          value: Math.random() * 20 + 5,
        });
      }
      setHeatmapData(demoPoints);

      // Demo scroll depth
      setScrollDepthData([
        { depth: 0, count: 1000 },
        { depth: 25, count: 850 },
        { depth: 50, count: 620 },
        { depth: 75, count: 380 },
        { depth: 100, count: 150 },
      ]);
    }
  }, [isLoading, heatmapData.length, previewSize]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Kullanıcı Aktivite Haritası</h2>
          <p className="text-sm text-[rgba(255,255,255,0.5)]">
            Tıklama ve kaydırma davranışlarını görselleştirin
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex rounded-lg bg-[rgba(255,255,255,0.05)] p-1">
            <button
              onClick={() => setViewMode("heatmap")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === "heatmap"
                  ? "bg-[rgba(0,167,197,0.3)] text-[rgba(0,167,197,1)]"
                  : "text-[rgba(255,255,255,0.5)] hover:text-white"
              }`}
            >
              Tıklama Haritası
            </button>
            <button
              onClick={() => setViewMode("scroll")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === "scroll"
                  ? "bg-[rgba(0,167,197,0.3)] text-[rgba(0,167,197,1)]"
                  : "text-[rgba(255,255,255,0.5)] hover:text-white"
              }`}
            >
              Kaydırma Derinliği
            </button>
          </div>

          {/* Page Selector */}
          <select
            value={selectedPage}
            onChange={(e) => setSelectedPage(e.target.value)}
            className="px-3 py-2 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white text-sm focus:outline-none focus:border-[rgba(0,167,197,0.5)]"
          >
            {pages.map((page) => (
              <option key={page} value={page} className="bg-[rgb(6,20,27)]">
                {page}
              </option>
            ))}
          </select>

          {/* Refresh Button */}
          <button
            onClick={fetchHeatmapData}
            disabled={isLoading}
            className="p-2 rounded-lg bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] transition-colors disabled:opacity-50"
          >
            <svg
              className={`w-5 h-5 text-[rgba(255,255,255,0.7)] ${isLoading ? "animate-spin" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-[rgba(110,211,225,0.2)] bg-[rgba(6,20,27,0.8)] p-4">
          <p className="text-sm text-[rgba(255,255,255,0.5)]">Toplam Tıklama</p>
          <p className="text-2xl font-bold text-white">{heatmapData.length.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-[rgba(110,211,225,0.2)] bg-[rgba(6,20,27,0.8)] p-4">
          <p className="text-sm text-[rgba(255,255,255,0.5)]">Ort. Kaydırma Derinliği</p>
          <p className="text-2xl font-bold text-white">
            {scrollDepthData.length > 0
              ? Math.round(scrollDepthData.reduce((sum, d) => sum + d.depth * d.count, 0) / scrollDepthData.reduce((sum, d) => sum + d.count, 0))
              : 0}
            %
          </p>
        </div>
        <div className="rounded-xl border border-[rgba(110,211,225,0.2)] bg-[rgba(6,20,27,0.8)] p-4">
          <p className="text-sm text-[rgba(255,255,255,0.5)]">En Çok Tıklanan Bölge</p>
          <p className="text-2xl font-bold text-white">Üst Navigasyon</p>
        </div>
      </div>

      {/* Visualization */}
      <div className="rounded-xl border border-[rgba(110,211,225,0.2)] bg-[rgba(6,20,27,0.8)] overflow-hidden">
        {viewMode === "heatmap" ? (
          <div
            ref={containerRef}
            className="relative bg-white/5"
            style={{ width: "100%", height: previewSize.height, maxHeight: "600px" }}
          >
            {/* Page Preview Background */}
            <div className="absolute inset-0 opacity-30">
              <div className="h-16 bg-[rgba(0,167,197,0.2)] flex items-center px-4">
                <div className="w-32 h-8 bg-[rgba(255,255,255,0.1)] rounded" />
                <div className="flex-1" />
                <div className="flex gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-16 h-4 bg-[rgba(255,255,255,0.1)] rounded" />
                  ))}
                </div>
              </div>
              <div className="p-8 space-y-4">
                <div className="w-64 h-8 bg-[rgba(255,255,255,0.05)] rounded" />
                <div className="w-full h-4 bg-[rgba(255,255,255,0.03)] rounded" />
                <div className="w-3/4 h-4 bg-[rgba(255,255,255,0.03)] rounded" />
                <div className="flex gap-4 mt-8">
                  <div className="w-32 h-10 bg-[rgba(0,167,197,0.2)] rounded" />
                  <div className="w-32 h-10 bg-[rgba(255,255,255,0.1)] rounded" />
                </div>
              </div>
            </div>

            {/* Heatmap Overlay */}
            <HeatmapCanvas
              points={heatmapData}
              width={previewSize.width}
              height={previewSize.height}
            />

            {/* Legend */}
            <div className="absolute bottom-4 right-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-[rgba(0,0,0,0.7)] text-xs text-white">
              <span>Az</span>
              <div className="w-24 h-3 rounded bg-gradient-to-r from-blue-500 via-yellow-500 to-red-500" />
              <span>Çok</span>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <h3 className="text-sm font-medium text-[rgba(255,255,255,0.7)] mb-4">
              Sayfa Kaydırma Derinliği Dağılımı
            </h3>
            <ScrollDepthIndicator data={scrollDepthData} />
            <p className="mt-4 text-sm text-[rgba(255,255,255,0.5)]">
              Kullanıcıların sayfayı ne kadar kaydırdığını gösterir. Yüksek çubuklar = daha fazla kullanıcı o derinliğe ulaştı.
            </p>
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="rounded-xl border border-[rgba(110,211,225,0.2)] bg-[rgba(6,20,27,0.8)] p-4">
        <h3 className="text-sm font-medium text-[rgba(255,255,255,0.7)] mb-3">💡 İpuçları</h3>
        <ul className="space-y-2 text-sm text-[rgba(255,255,255,0.5)]">
          <li>• Sıcak bölgeler (kırmızı) en çok tıklanan alanları gösterir</li>
          <li>• Soğuk bölgeler (mavi) az ilgi gören alanları işaret eder</li>
          <li>• CTA butonlarının sıcak bölgelerde olduğundan emin olun</li>
          <li>• Kaydırma derinliği düşükse, önemli içerikleri yukarı taşıyın</li>
        </ul>
      </div>
    </div>
  );
}
