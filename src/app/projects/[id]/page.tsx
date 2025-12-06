import { getProjectById, getProjectStats, type ProjectStat } from "@/lib/db";
import type { Project } from "@/types/project";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import ProjectVisitTracker from "@/components/projects/project-visit-tracker";
import { getLocalizedText, resolveCdnUrl } from "@/lib/constants";
import SiteShell from "@/components/layout/site-shell";
import {
  Download,
  ExternalLink,
  Star,
  Eye,
  ChevronLeft,
  Monitor,
  Smartphone,
  Globe,
  Apple,
  Play,
  Calendar,
  Tag,
  Zap,
} from "lucide-react";

type Props = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";
const FALLBACK_IMAGE = resolveCdnUrl("/uploads/tengra_without_text.png");

const formatDate = (value?: string | null) => {
  if (!value) return "-";
  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return new Intl.DateTimeFormat("tr-TR", {
      dateStyle: "medium",
    }).format(date);
  } catch {
    return "-";
  }
};

const statusLabels: Record<string, { label: string; color: string }> = {
  draft: { label: "Taslak", color: "bg-gray-500/20 text-gray-300 border-gray-500/30" },
  in_progress: { label: "Geliştiriliyor", color: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
  on_hold: { label: "Beklemede", color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" },
  completed: { label: "Yayında", color: "bg-green-500/20 text-green-300 border-green-500/30" },
  archived: { label: "Arşivlendi", color: "bg-red-500/20 text-red-300 border-red-500/30" },
};

const platformIcons: Record<string, React.ReactNode> = {
  windows: <Monitor className="h-5 w-5" />,
  macos: <Apple className="h-5 w-5" />,
  linux: <Monitor className="h-5 w-5" />,
  ios: <Smartphone className="h-5 w-5" />,
  android: <Play className="h-5 w-5" />,
  web: <Globe className="h-5 w-5" />,
};

const platformLabels: Record<string, string> = {
  windows: "Windows",
  macos: "macOS",
  linux: "Linux",
  ios: "iOS",
  android: "Android",
  web: "Web",
};

export default async function ProjectDetailPage({ params }: Props) {
  const { id: projectId } = await params;
  const project: Project | null = await getProjectById(projectId).catch(
    () => null
  );

  if (!project) {
    notFound();
  }

  const stats: ProjectStat[] = await getProjectStats(project.id || "").catch(
    () => []
  );

  const effectiveId = project.id || projectId;
  const description = getLocalizedText(project.description ?? "", "tr");
  const cover = resolveCdnUrl(project.logoUrl || FALLBACK_IMAGE);
  const status = statusLabels[project.status || "draft"];

  // Prepare stats for sparkline
  const metrics = Array.from(new Set(stats.map((s) => s.metric)));
  const grouped: Record<string, ProjectStat[]> = {};
  for (const s of stats) {
    if (!grouped[s.metric]) grouped[s.metric] = [];
    grouped[s.metric].push(s);
  }
  for (const key of Object.keys(grouped)) {
    grouped[key].sort((a, b) => a.day.localeCompare(b.day));
  }

  const renderSparkline = (series: ProjectStat[]) => {
    if (!series.length) return null;
    const h = 40;
    const w = Math.max((series.length - 1) * 18, 60);
    const localMax = Math.max(...series.map((s) => s.value), 1);
    const points = series
      .map((s, idx) => {
        const x =
          series.length === 1
            ? w / 2
            : (idx / Math.max(series.length - 1, 1)) * w;
        const y = h - (Math.max(0, s.value) / localMax) * h;
        return `${x},${y}`;
      })
      .join(" ");
    return (
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="h-10 w-full text-[color:var(--color-turkish-blue-400)]"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="sparkGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polyline
          fill="url(#sparkGradient)"
          stroke="none"
          points={`0,${h} ${points} ${w},${h}`}
        />
        <polyline
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          points={points}
        />
      </svg>
    );
  };

  return (
    <SiteShell>
      <main className="relative flex-1 bg-[radial-gradient(circle_at_top,rgba(0,167,197,0.12),rgba(4,15,20,0.98))] px-4 py-8 md:px-8 lg:px-16">
        <ProjectVisitTracker projectId={effectiveId} />

        <div className="mx-auto max-w-7xl">
          {/* Back Link */}
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-sm text-[rgba(255,255,255,0.6)] hover:text-[color:var(--color-turkish-blue-300)] transition mb-8"
          >
            <ChevronLeft className="h-4 w-4" />
            Tüm Projeler
          </Link>

          {/* Hero Section - App Store Style */}
          <div className="grid gap-8 lg:grid-cols-[200px_1fr] mb-12">
            {/* App Icon */}
            <div className="flex justify-center lg:justify-start">
              <div className="relative h-40 w-40 lg:h-48 lg:w-48 rounded-[2rem] border border-[rgba(110,211,225,0.2)] bg-gradient-to-br from-[rgba(6,20,27,0.9)] to-[rgba(4,15,20,0.95)] shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden">
                <Image
                  crossOrigin="anonymous"
                  src={cover}
                  alt={project.name}
                  fill
                  className="object-contain p-4"
                  priority
                />
              </div>
            </div>

            {/* App Info */}
            <div className="flex flex-col justify-center text-center lg:text-left">
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-3">
                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${status.color}`}>
                  {status.label}
                </span>
                {project.version && (
                  <span className="text-sm text-[rgba(255,255,255,0.5)]">
                    v{project.version}
                  </span>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2">
                {project.name}
              </h1>

              {project.tagline && (
                <p className="text-lg md:text-xl text-[rgba(255,255,255,0.6)] mb-4">
                  {project.tagline}
                </p>
              )}

              {/* Platforms */}
              {project.platforms && project.platforms.length > 0 && (
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-6">
                  {project.platforms.map((platform) => (
                    <div
                      key={platform}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.7)]"
                    >
                      {platformIcons[platform] || <Globe className="h-4 w-4" />}
                      <span className="text-sm">{platformLabels[platform] || platform}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Stats Row */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm text-[rgba(255,255,255,0.6)]">
                {project.rating !== undefined && project.rating > 0 && (
                  <div className="flex items-center gap-1.5">
                    <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                    <span className="font-semibold text-white">{project.rating.toFixed(1)}</span>
                    {project.reviewCount !== undefined && (
                      <span>({project.reviewCount.toLocaleString()} değerlendirme)</span>
                    )}
                  </div>
                )}
                {project.downloadCount !== undefined && project.downloadCount > 0 && (
                  <div className="flex items-center gap-1.5">
                    <Download className="h-4 w-4" />
                    <span>{project.downloadCount.toLocaleString()} indirme</span>
                  </div>
                )}
                {project.viewCount !== undefined && project.viewCount > 0 && (
                  <div className="flex items-center gap-1.5">
                    <Eye className="h-4 w-4" />
                    <span>{project.viewCount.toLocaleString()} görüntülenme</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {project.links && project.links.length > 0 && (
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mt-6">
                  {project.links.find(l => l.type === 'download')?.url && (
                    <a
                      href={project.links.find(l => l.type === 'download')?.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[color:var(--color-turkish-blue-500)] to-[color:var(--color-turkish-blue-600)] text-white font-medium hover:opacity-90 transition shadow-lg"
                    >
                      <Download className="h-5 w-5" />
                      İndir
                    </a>
                  )}
                  {project.links.find(l => l.type === 'website')?.url && (
                    <a
                      href={project.links.find(l => l.type === 'website')?.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-[rgba(110,211,225,0.3)] bg-[rgba(6,20,27,0.6)] text-[color:var(--color-turkish-blue-300)] font-medium hover:bg-[rgba(6,20,27,0.8)] transition"
                    >
                      <ExternalLink className="h-5 w-5" />
                      Web Sitesi
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Screenshots Section */}
          {project.screenshots && project.screenshots.length > 0 && (
            <section className="mb-12">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Eye className="h-5 w-5 text-[color:var(--color-turkish-blue-400)]" />
                Ekran Görüntüleri
              </h2>
              <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-thin scrollbar-thumb-[rgba(110,211,225,0.2)] scrollbar-track-transparent">
                {project.screenshots.map((screenshot, index) => (
                  <div
                    key={screenshot.url || index}
                    className="flex-shrink-0 relative group"
                  >
                    <div className="relative h-64 w-auto aspect-video rounded-2xl overflow-hidden border border-[rgba(110,211,225,0.15)] shadow-lg">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={screenshot.url}
                        alt={screenshot.caption || `Ekran görüntüsü ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    {screenshot.caption && (
                      <p className="mt-2 text-sm text-[rgba(255,255,255,0.5)] text-center max-w-xs">
                        {screenshot.caption}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
            {/* Left Column */}
            <div className="space-y-8">
              {/* Description */}
              <section className="rounded-3xl border border-[rgba(110,211,225,0.15)] bg-[rgba(6,20,27,0.6)] p-6 md:p-8 backdrop-blur-xl">
                <h2 className="text-xl font-semibold text-white mb-4">Hakkında</h2>
                <div className="prose prose-invert prose-sm max-w-none">
                  <p className="text-[rgba(255,255,255,0.8)] leading-relaxed whitespace-pre-wrap">
                    {description || "Bu proje için henüz detaylı bir açıklama eklenmemiş."}
                  </p>
                </div>
              </section>

              {/* Features */}
              {project.features && project.features.length > 0 && (
                <section className="rounded-3xl border border-[rgba(110,211,225,0.15)] bg-[rgba(6,20,27,0.6)] p-6 md:p-8 backdrop-blur-xl">
                  <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                    <Zap className="h-5 w-5 text-[color:var(--color-turkish-blue-400)]" />
                    Özellikler
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {project.features.map((feature, index) => (
                      <div
                        key={index}
                        className="p-4 rounded-2xl border border-[rgba(110,211,225,0.1)] bg-[rgba(4,16,22,0.5)]"
                      >
                        {feature.icon && (
                          <span className="text-2xl mb-2 block">{feature.icon}</span>
                        )}
                        <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
                        {feature.description && (
                          <p className="text-sm text-[rgba(255,255,255,0.6)]">
                            {feature.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Stats Charts */}
              {metrics.length > 0 && (
                <section className="rounded-3xl border border-[rgba(110,211,225,0.15)] bg-[rgba(6,20,27,0.6)] p-6 md:p-8 backdrop-blur-xl">
                  <h2 className="text-xl font-semibold text-white mb-6">İstatistikler</h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {metrics.map((metric) => {
                      const series = grouped[metric] || [];
                      return (
                        <div
                          key={metric}
                          className="p-4 rounded-2xl border border-[rgba(110,211,225,0.1)] bg-[rgba(4,16,22,0.5)]"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-[rgba(255,255,255,0.8)]">
                              {metric}
                            </span>
                            {series.length > 0 && (
                              <span className="text-lg font-bold text-[color:var(--color-turkish-blue-300)]">
                                {series[series.length - 1]?.value ?? "-"}
                              </span>
                            )}
                          </div>
                          {renderSparkline(series)}
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Info Card */}
              <div className="rounded-3xl border border-[rgba(110,211,225,0.15)] bg-[rgba(6,20,27,0.6)] p-6 backdrop-blur-xl">
                <h3 className="text-lg font-semibold text-white mb-4">Bilgiler</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-[rgba(110,211,225,0.08)]">
                    <span className="text-sm text-[rgba(255,255,255,0.5)]">Tür</span>
                    <span className="text-sm font-medium text-white capitalize">
                      {project.type || "Diğer"}
                    </span>
                  </div>
                  {project.version && (
                    <div className="flex items-center justify-between py-3 border-b border-[rgba(110,211,225,0.08)]">
                      <span className="text-sm text-[rgba(255,255,255,0.5)]">Versiyon</span>
                      <span className="text-sm font-medium text-white">
                        {project.version}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between py-3 border-b border-[rgba(110,211,225,0.08)]">
                    <span className="text-sm text-[rgba(255,255,255,0.5)]">Durum</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${status.color}`}>
                      {status.label}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-[rgba(110,211,225,0.08)]">
                    <span className="text-sm text-[rgba(255,255,255,0.5)] flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" />
                      Güncelleme
                    </span>
                    <span className="text-sm font-medium text-white">
                      {formatDate(project.lastUpdatedAt ?? project.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Categories */}
              {project.categories && project.categories.length > 0 && (
                <div className="rounded-3xl border border-[rgba(110,211,225,0.15)] bg-[rgba(6,20,27,0.6)] p-6 backdrop-blur-xl">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Tag className="h-4 w-4 text-[color:var(--color-turkish-blue-400)]" />
                    Kategoriler
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {project.categories.map((category) => (
                      <span
                        key={category}
                        className="px-3 py-1.5 rounded-lg bg-[rgba(0,167,197,0.1)] border border-[rgba(0,167,197,0.2)] text-sm text-[color:var(--color-turkish-blue-300)]"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-[rgba(110,211,225,0.15)] bg-[rgba(6,20,27,0.6)] p-4 text-center">
                  <Download className="h-5 w-5 mx-auto mb-2 text-[color:var(--color-turkish-blue-400)]" />
                  <p className="text-lg font-bold text-white">
                    {(project.downloadCount || 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-[rgba(255,255,255,0.5)]">İndirme</p>
                </div>
                <div className="rounded-2xl border border-[rgba(110,211,225,0.15)] bg-[rgba(6,20,27,0.6)] p-4 text-center">
                  <Eye className="h-5 w-5 mx-auto mb-2 text-[color:var(--color-turkish-blue-400)]" />
                  <p className="text-lg font-bold text-white">
                    {(project.viewCount || 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-[rgba(255,255,255,0.5)]">Görüntülenme</p>
                </div>
                {project.rating !== undefined && project.rating > 0 && (
                  <>
                    <div className="rounded-2xl border border-[rgba(110,211,225,0.15)] bg-[rgba(6,20,27,0.6)] p-4 text-center">
                      <Star className="h-5 w-5 mx-auto mb-2 fill-yellow-500 text-yellow-500" />
                      <p className="text-lg font-bold text-white">
                        {project.rating.toFixed(1)}
                      </p>
                      <p className="text-xs text-[rgba(255,255,255,0.5)]">Puan</p>
                    </div>
                    <div className="rounded-2xl border border-[rgba(110,211,225,0.15)] bg-[rgba(6,20,27,0.6)] p-4 text-center">
                      <Star className="h-5 w-5 mx-auto mb-2 text-[color:var(--color-turkish-blue-400)]" />
                      <p className="text-lg font-bold text-white">
                        {(project.reviewCount || 0).toLocaleString()}
                      </p>
                      <p className="text-xs text-[rgba(255,255,255,0.5)]">Değerlendirme</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </SiteShell>
  );
}
