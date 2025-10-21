import type { Project } from "@/types/project";

const formatDateTime = (value?: string | null) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const formatStatus = (status?: Project["status"]) => {
  switch (status) {
    case "draft":
      return "Taslak";
    case "in_progress":
      return "Geliştiriliyor";
    case "on_hold":
      return "Beklemede";
    case "completed":
      return "Tamamlandı";
    case "archived":
      return "Arşivlendi";
    default:
      return "Belirsiz";
  }
};

type Props = {
  projects: Project[];
};

export default function ProjectsTable({ projects }: Props) {
  if (projects.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-[rgba(110,211,225,0.2)] bg-[rgba(6,20,27,0.6)]/60 p-10 text-center text-sm text-[rgba(255,255,255,0.55)]">
        Henüz proje verisi alınamadı. Lütfen daha sonra tekrar deneyin.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-[rgba(110,211,225,0.16)] bg-[rgba(6,20,27,0.55)]/80 shadow-[0_25px_70px_rgba(0,0,0,0.45)] backdrop-blur-xl">
      <table className="min-w-full divide-y divide-[rgba(110,211,225,0.15)]">
        <thead className="bg-[rgba(8,24,32,0.8)] text-[rgba(255,255,255,0.65)]">
          <tr>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.35em]">
              Proje
            </th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.35em]">
              Durum
            </th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.35em]">
              Son Güncelleme
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[rgba(110,211,225,0.08)] text-sm text-[rgba(255,255,255,0.8)]">
          {projects.map((project) => (
            <tr key={project.id} className="hover:bg-[rgba(8,32,42,0.55)]">
              <td className="px-6 py-4">
                <p className="font-semibold text-white">{project.name}</p>
                {project.description ? (
                  <p className="mt-1 text-xs text-[rgba(255,255,255,0.55)]">
                    {project.description}
                  </p>
                ) : null}
              </td>
              <td className="px-6 py-4">
                <span className="inline-flex rounded-full border border-[rgba(110,211,225,0.3)] px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-[color:var(--color-turkish-blue-200)]">
                  {formatStatus(project.status)}
                </span>
              </td>
              <td className="px-6 py-4 text-[rgba(255,255,255,0.65)]">
                {formatDateTime(project.lastUpdatedAt ?? project.createdAt ?? undefined)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
