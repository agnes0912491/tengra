import Link from "next/link";
import { cookies } from "next/headers";

import AdminPageHeader from "@/components/admin/admin-page-header";
import AdminStatCard from "@/components/admin/admin-stat-card";
import { ADMIN_SESSION_COOKIE } from "@/lib/auth";
import {
  getAllBlogs,
  getAllProjects,
  getAllUsers,
  getServerHealth,
  type ServerHealth,
} from "@/lib/db";
import type { Project } from "@/types/project";
import type { Blog } from "@/types/blog";
import type { User } from "@/lib/auth/users";

const formatDuration = (seconds?: number) => {
  if (!seconds || Number.isNaN(seconds)) {
    return "Bilinmiyor";
  }

  const total = Math.floor(seconds);
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);

  const parts = [
    days > 0 ? `${days}g` : null,
    hours > 0 ? `${hours}s` : null,
    minutes > 0 ? `${minutes}d` : null,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(" ") : `${total}s`;
};

const toTimestamp = (value?: string | null) => {
  if (!value) {
    return 0;
  }

  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? 0 : timestamp;
};

const formatDateTime = (value?: string | null) => {
  if (!value) {
    return "Bilinmiyor";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Bilinmiyor";
  }

  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const getLatestProject = (projects: Project[]): Project | undefined => {
  return projects
    .slice()
    .sort(
      (a, b) =>
        toTimestamp(b.lastUpdatedAt ?? b.createdAt ?? undefined) -
        toTimestamp(a.lastUpdatedAt ?? a.createdAt ?? undefined)
    )[0];
};

const getHighlightedUsers = (users: User[]) => users.slice(0, 5);

const getServerTone = (health: ServerHealth) =>
  health.status === "online" ? "success" : "danger";

export default async function AdminOverviewPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  const [projects, blogs, users, health] = await Promise.all([
    getAllProjects(token),
    getAllBlogs().catch(() => [] as Blog[]),
    token ? getAllUsers(token).catch(() => [] as User[]) : Promise.resolve([] as User[]),
    getServerHealth(token),
  ]);

  const adminCount = users.filter((user) => user.role === "admin").length;
  const latestProject = getLatestProject(projects);
  const latestBlog = blogs[0];
  const highlightedUsers = getHighlightedUsers(users);
  const formattedUptime = formatDuration(health.uptimeSeconds);

  return (
    <div className="flex flex-col gap-10">
      <AdminPageHeader
        title="Admin Paneli"
        description="Stüdyonun projelerini, içeriklerini ve kullanıcılarını tek bir yerden yönetin."
      />

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          label="Projeler"
          value={projects.length}
          sublabel={
            latestProject
              ? `${latestProject.name} • ${formatDateTime(
                  latestProject.lastUpdatedAt ?? latestProject.createdAt ?? undefined
                )}`
              : "Henüz proje verisi bulunamadı"
          }
        />
        <AdminStatCard
          label="Blog Yazıları"
          value={blogs.length}
          sublabel={
            latestBlog
              ? `${latestBlog.title} • ${formatDateTime(latestBlog.updatedAt ?? latestBlog.date)}`
              : "Henüz blog yayını bulunamadı"
          }
        />
        <AdminStatCard
          label="Toplam Kullanıcı"
          value={users.length}
          sublabel={`${adminCount} yönetici • ${users.length - adminCount} standart kullanıcı`}
        />
        <AdminStatCard
          label="Sunucu Durumu"
          value={health.status === "online" ? "Çevrimiçi" : "Çevrimdışı"}
          sublabel={`Çalışma süresi: ${formattedUptime}`}
          tone={getServerTone(health)}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-[rgba(110,211,225,0.16)] bg-[rgba(6,20,27,0.6)]/80 p-6 shadow-[0_25px_70px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          <h2 className="text-lg font-semibold text-[color:var(--color-turkish-blue-200)]">Hızlı İşlemler</h2>
          <p className="mt-2 text-sm text-[rgba(255,255,255,0.6)]">
            En sık kullandığınız yönetim araçlarına tek tıkla ulaşın.
          </p>
          <ul className="mt-5 space-y-4 text-sm">
            {[
              {
                title: "Projeleri Yönet",
                description: "Portföyde yer alan projeleri güncelleyin veya yeni proje ekleyin.",
                href: "/admin/dashboard/projects",
              },
              {
                title: "Yeni Blog Yazısı",
                description: "Tengra topluluğu için yeni içerikler hazırlayın.",
                href: "/admin/dashboard/blogs",
              },
              {
                title: "Kullanıcı Rollerini Düzenle",
                description: "Ekip üyelerine yönetici yetkisi verin veya erişimleri sınırlandırın.",
                href: "/admin/dashboard/users",
              },
            ].map((action) => (
              <li
                key={action.href}
                className="group rounded-2xl border border-[rgba(110,211,225,0.16)] bg-[rgba(8,28,38,0.65)] p-4 transition hover:border-[rgba(110,211,225,0.45)] hover:bg-[rgba(10,40,52,0.75)]"
              >
                <Link
                  href={action.href}
                  className="text-base font-semibold text-white transition group-hover:text-[color:var(--color-turkish-blue-200)]"
                >
                  {action.title}
                </Link>
                <p className="mt-1 text-xs text-[rgba(255,255,255,0.55)]">{action.description}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-3xl border border-[rgba(110,211,225,0.16)] bg-[rgba(6,20,27,0.6)]/80 p-6 shadow-[0_25px_70px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          <h2 className="text-lg font-semibold text-[color:var(--color-turkish-blue-200)]">Sunucu Özeti</h2>
          <div className="mt-4 space-y-3 text-sm text-[rgba(255,255,255,0.7)]">
            <p>
              <span className="text-[rgba(255,255,255,0.45)]">Durum:</span>{" "}
              <span className={health.status === "online" ? "text-green-300" : "text-red-300"}>
                {health.status === "online" ? "Çevrimiçi" : "Çevrimdışı"}
              </span>
            </p>
            <p>
              <span className="text-[rgba(255,255,255,0.45)]">Uptime:</span> {formattedUptime}
            </p>
            <p>
              <span className="text-[rgba(255,255,255,0.45)]">Sürüm:</span>{" "}
              {health.version ?? "Belirtilmemiş"}
            </p>
            <p>
              <span className="text-[rgba(255,255,255,0.45)]">Son Dağıtım:</span>{" "}
              {formatDateTime(health.lastDeploymentAt)}
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-[rgba(110,211,225,0.16)] bg-[rgba(6,20,27,0.6)]/80 p-6 shadow-[0_25px_70px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          <h2 className="text-lg font-semibold text-[color:var(--color-turkish-blue-200)]">Ekip Özeti</h2>
          <p className="mt-2 text-sm text-[rgba(255,255,255,0.6)]">
            Aktif kullanıcılar ve rollerine hızlı bir bakış.
          </p>
          <ul className="mt-5 space-y-3 text-sm text-[rgba(255,255,255,0.75)]">
            {highlightedUsers.length > 0 ? (
              highlightedUsers.map((user) => (
                <li
                  key={user.id}
                  className="flex items-center justify-between rounded-2xl border border-[rgba(110,211,225,0.16)] bg-[rgba(8,28,38,0.55)] px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-white">{user.displayName ?? user.email}</p>
                    <p className="text-[11px] text-[rgba(255,255,255,0.5)]">{user.email}</p>
                  </div>
                  <span className="rounded-full border border-[rgba(110,211,225,0.35)] px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-[color:var(--color-turkish-blue-200)]">
                    {user.role}
                  </span>
                </li>
              ))
            ) : (
              <li className="rounded-2xl border border-dashed border-[rgba(110,211,225,0.2)] bg-[rgba(8,28,38,0.45)] px-4 py-6 text-center text-xs text-[rgba(255,255,255,0.5)]">
                Kullanıcı bilgisi alınamadı.
              </li>
            )}
          </ul>
        </div>
      </section>
    </div>
  );
}
