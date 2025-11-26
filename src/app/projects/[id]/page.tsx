import { getProjectById, getProjectStats, type ProjectStat } from "@/lib/db";
import type { Project } from "@/types/project";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import ProjectVisitTracker from "@/components/projects/project-visit-tracker";

type Props = {
  params: { id: string };
};

export const dynamic = "force-dynamic";

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
  const maxValue = Math.max(1, ...stats.map((s) => s.value));

  const effectiveId = project.id || projectId;

  return (
    <main className="relative px-6 py-16 md:px-20">
      <ProjectVisitTracker projectId={effectiveId} />
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="section-title neon-text text-left">
              {project.name}
            </h1>
            <p className="mt-3 text-sm text-[rgba(255,255,255,0.75)]">
              Projeye ait detayları ve son istatistikleri buradan
              görüntüleyebilirsiniz.
            </p>
          </div>
          <Link
            href="/projects"
            className="rounded-full border border-[rgba(0,167,197,0.4)] px-4 py-1 text-xs uppercase tracking-[0.25em] text-[color:var(--color-turkish-blue-200)] transition hover:bg-[rgba(0,167,197,0.12)]"
          >
            Tüm Projelere Dön
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)]">
          <section className="rounded-3xl border border-[rgba(110,211,225,0.2)] bg-[rgba(6,20,27,0.6)]/80 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <div className="flex items-start gap-4">
              {project.logoUrl ? (
                <div className="relative h-20 w-20 overflow-hidden rounded-2xl border border-[rgba(110,211,225,0.3)] bg-[rgba(3,12,18,0.9)]">
                  <Image
                    src={project.logoUrl}
                    alt={project.name}
                    fill
                    className="object-contain p-2"
                  />
                </div>
              ) : null}
              <div>
                <h2 className="text-xl font-display tracking-[0.25em] text-[color:var(--color-turkish-blue-200)]">
                  Proje Bilgileri
                </h2>
                {project.description ? (
                  <p className="mt-3 text-sm text-[rgba(255,255,255,0.78)]">
                    {project.description}
                  </p>
                ) : (
                  <p className="mt-3 text-sm text-[rgba(255,255,255,0.6)]">
                    Bu proje için henüz detaylı bir açıklama eklenmemiş.
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 grid gap-4 text-xs text-[rgba(255,255,255,0.75)] md:grid-cols-3">
              <div className="space-y-1 rounded-xl border border-[rgba(110,211,225,0.2)] bg-[rgba(3,12,18,0.85)] p-3">
                <div className="text-[rgba(255,255,255,0.6)]">Durum</div>
                <div className="text-sm font-semibold text-[color:var(--color-turkish-blue-200)] uppercase tracking-[0.25em]">
                  {project.status || "Belirsiz"}
                </div>
              </div>
              <div className="space-y-1 rounded-xl border border-[rgba(110,211,225,0.2)] bg-[rgba(3,12,18,0.85)] p-3">
                <div className="text-[rgba(255,255,255,0.6)]">Tür</div>
                <div className="text-sm font-semibold text-[rgba(255,255,255,0.9)]">
                  {project.type || "Diğer"}
                </div>
              </div>
              <div className="space-y-1 rounded-xl border border-[rgba(110,211,225,0.2)] bg-[rgba(3,12,18,0.85)] p-3">
                <div className="text-[rgba(255,255,255,0.6)]">
                  Son Güncelleme
                </div>
                <div className="text-sm font-semibold text-[rgba(255,255,255,0.9)]">
                  {formatDate(project.lastUpdatedAt ?? project.createdAt)}
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-[rgba(110,211,225,0.2)] bg-[rgba(6,20,27,0.6)]/80 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold text-[color:var(--color-turkish-blue-200)]">
                İstatistikler
              </h2>
              <span className="text-[10px] uppercase tracking-[0.25em] text-[rgba(255,255,255,0.6)]">
                Son Kayıtlar
              </span>
            </div>

            {metrics.length === 0 ? (
              <p className="text-sm text-[rgba(255,255,255,0.7)]">
                Bu proje için henüz istatistik kaydı bulunmuyor.
              </p>
            ) : (
              <div className="space-y-4">
                {metrics.map((metric) => {
                  const series = grouped[metric] || [];
                  return (
                    <div
                      key={metric}
                      className="rounded-xl border border-[rgba(110,211,225,0.18)] bg-[rgba(8,28,38,0.6)] p-4"
                    >
                      <div className="mb-2 flex items-center justify-between text-xs text-[rgba(255,255,255,0.8)]">
                        <span className="font-semibold">{metric}</span>
                        {series.length > 0 ? (
                          <span className="opacity-70">
                            Son Değer:{" "}
                            {series[series.length - 1]?.value ?? "-"}
                          </span>
                        ) : null}
                      </div>
                      <div className="flex items-end gap-1 overflow-x-auto">
                        {series.map((s) => (
                          <div
                            key={s.day}
                            className="flex flex-col items-center text-[9px] text-[rgba(255,255,255,0.6)]"
                          >
                            <div
                              className="w-2 rounded bg-[color:var(--color-turkish-blue-400)]"
                              style={{
                                height: `${Math.max(
                                  4,
                                  (s.value / maxValue) * 80
                                )}px`,
                              }}
                              title={`${s.day}: ${s.value}`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
