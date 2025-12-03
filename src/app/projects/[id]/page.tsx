import { getProjectById, getProjectStats, type ProjectStat } from "@/lib/db";
import type { Project } from "@/types/project";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import ProjectVisitTracker from "@/components/projects/project-visit-tracker";
import { getLocalizedText, resolveCdnUrl } from "@/lib/constants";
import SiteShell from "@/components/layout/site-shell";

type Props = {
  params: { id: string };
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
      timeStyle: "short",
    }).format(date);
  } catch {
    return "-";
  }
};

export default async function ProjectDetailPage({ params }: Props) {
  const projectId = params.id;
  const project: Project | null = await getProjectById(projectId).catch(
    () => null
  );

  if (!project) {
    notFound();
  }

  const stats: ProjectStat[] = await getProjectStats(project.id || "").catch(
    () => []
  );

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
    const h = 50;
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
        className="h-14 w-full text-[color:var(--color-turkish-blue-300)]"
        preserveAspectRatio="none"
      >
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

  const effectiveId = project.id || projectId;
  const description = getLocalizedText(project.description ?? "", "tr");
  const cover = resolveCdnUrl(project.logoUrl || FALLBACK_IMAGE);

  return (
    <SiteShell>
      <main className="relative flex-1 bg-[radial-gradient(circle_at_top,rgba(0,167,197,0.16),rgba(4,15,20,0.96))] px-4 py-16 md:px-10">
        <ProjectVisitTracker projectId={effectiveId} />
        <div className="mx-auto flex max-w-6xl flex-col gap-10">
          <header className="flex flex-col gap-4 text-center md:text-left md:flex-row md:items-center md:justify-between">
            <div className="space-y-3">
              <Link
                href="/projects"
                className="inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.18em] text-[rgba(255,255,255,0.65)] hover:text-[color:var(--color-turkish-blue-300)] transition"
              >
                ← Tüm projelere dön
              </Link>
              <h1 className="text-3xl md:text-4xl font-display tracking-[0.2em] text-[color:var(--color-turkish-blue-300)]">
                {project.name}
              </h1>
              <p className="text-sm md:text-base text-[color:var(--text-muted)] max-w-2xl leading-relaxed">
                Proje detayları, güncel durum ve metrikler.
              </p>
              <div className="flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-[rgba(255,255,255,0.75)]">
                <span className="badge-muted">Durum: {project.status || "Belirsiz"}</span>
                <span className="badge-muted">Tür: {project.type || "Diğer"}</span>
                <span className="badge-muted">
                  Son güncelleme: {formatDate(project.lastUpdatedAt ?? project.createdAt)}
                </span>
              </div>
            </div>
            <div className="relative h-32 w-full max-w-xs overflow-hidden rounded-2xl border border-[rgba(110,211,225,0.2)] bg-[rgba(6,20,27,0.7)] shadow-[0_22px_60px_rgba(0,0,0,0.5)]">
              <Image
                crossOrigin="anonymous"
                src={cover}
                alt={project.name}
                fill
                className="object-contain p-4"
              />
            </div>
          </header>

          <div className="grid gap-8 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
            <section className="rounded-3xl border border-[rgba(110,211,225,0.2)] bg-[rgba(6,20,27,0.72)]/80 p-6 md:p-8 shadow-[0_26px_70px_rgba(0,0,0,0.55)] backdrop-blur-2xl">
              <div className="flex flex-col gap-4 md:flex-row md:items-start">
                <div className="flex flex-1 flex-col gap-3">
                  <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--color-turkish-blue-200)]">
                    Proje Özeti
                  </h2>
                  <p className="text-sm md:text-base leading-relaxed text-[rgba(255,255,255,0.85)]">
                    {description || "Bu proje için henüz detaylı bir açıklama eklenmemiş."}
                  </p>
                </div>
              </div>

              <div className="mt-8 grid gap-4 text-sm text-[rgba(255,255,255,0.85)] md:grid-cols-3">
                <div className="space-y-1 rounded-xl border border-[rgba(110,211,225,0.2)] bg-[rgba(3,12,18,0.85)] p-4">
                  <div className="text-[rgba(255,255,255,0.6)]">Durum</div>
                  <div className="text-[13px] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-turkish-blue-200)]">
                    {project.status || "Belirsiz"}
                  </div>
                </div>
                <div className="space-y-1 rounded-xl border border-[rgba(110,211,225,0.2)] bg-[rgba(3,12,18,0.85)] p-4">
                  <div className="text-[rgba(255,255,255,0.6)]">Tür</div>
                  <div className="text-[13px] font-semibold text-[rgba(255,255,255,0.92)]">
                    {project.type || "Diğer"}
                  </div>
                </div>
                <div className="space-y-1 rounded-xl border border-[rgba(110,211,225,0.2)] bg-[rgba(3,12,18,0.85)] p-4">
                  <div className="text-[rgba(255,255,255,0.6)]">Son Güncelleme</div>
                  <div className="text-[13px] font-semibold text-[rgba(255,255,255,0.92)]">
                    {formatDate(project.lastUpdatedAt ?? project.createdAt)}
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-[rgba(110,211,225,0.2)] bg-[rgba(6,20,27,0.64)] p-6 shadow-[0_26px_70px_rgba(0,0,0,0.5)] backdrop-blur-xl">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-semibold text-[color:var(--color-turkish-blue-200)]">
                  İstatistikler
                </h2>
                <span className="text-[10px] uppercase tracking-[0.18em] text-[rgba(255,255,255,0.65)]">
                  Güncel kayıtlar
                </span>
              </div>

              {metrics.length === 0 ? (
                <p className="text-sm text-[rgba(255,255,255,0.75)]">
                  Bu proje için henüz istatistik kaydı bulunmuyor.
                </p>
              ) : (
                <div className="space-y-4">
                  {metrics.map((metric) => {
                    const series = grouped[metric] || [];
                    return (
                      <div
                        key={metric}
                        className="rounded-xl border border-[rgba(110,211,225,0.18)] bg-[rgba(8,28,38,0.65)] p-4"
                      >
                      <div className="mb-2 flex items-center justify-between text-xs text-[rgba(255,255,255,0.82)]">
                        <span className="font-semibold">{metric}</span>
                        {series.length > 0 ? (
                          <span className="opacity-70">
                            Son değer: {series[series.length - 1]?.value ?? "-"}
                          </span>
                        ) : null}
                      </div>
                      <div className="mt-1">{renderSparkline(series)}</div>
                    </div>
                  );
                })}
              </div>
            )}
            </section>
          </div>
        </div>
      </main>
    </SiteShell>
  );
}
