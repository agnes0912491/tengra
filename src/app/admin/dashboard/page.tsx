import type { ComponentProps } from "react";

import Link from "next/link";
import { cookies } from "next/headers";

import AdminPageHeader from "@/components/admin/admin-page-header";
import AdminStatCard from "@/components/admin/admin-stat-card";
import { resolveAdminSessionToken } from "@/lib/auth";
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
import AdminCurrentUserCard from "@/components/admin/admin-current-user-card";
import AdminMetrics from "@/components/admin/dashboard/metrics";

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


const getServerTone = (health: ServerHealth) =>
  health.status === "online" ? "success" : "danger";

export default async function AdminOverviewPage() {
  const cookieStore = await cookies();
  const token = resolveAdminSessionToken((name) => cookieStore.get(name)?.value);
  const [projects, blogs, users, health] = await Promise.all([
    getAllProjects(token),
    getAllBlogs().catch(() => [] as Blog[]),
    token ? getAllUsers(token).catch(() => [] as User[]) : Promise.resolve([] as User[]),
    getServerHealth(token),
  ]);

  const adminCount = users.filter((user) => user.role === "admin").length;
  const latestProject = getLatestProject(projects);
  const latestBlog = blogs[0];
  const formattedUptime = formatDuration(health.uptimeSeconds);

  const statCards: ReadonlyArray<
    Pick<ComponentProps<typeof AdminStatCard>, "label" | "value" | "sublabel" | "tone">
  > = [
      {
        label: "Projeler",
        value: projects.length,
        sublabel: latestProject
          ? `${latestProject.name} • ${formatDateTime(
            latestProject.lastUpdatedAt ?? latestProject.createdAt ?? undefined
          )}`
          : "Henüz proje verisi bulunamadı",
      },
      {
        label: "Blog Yazıları",
        value: blogs.length,
        sublabel: latestBlog
          ? `${latestBlog.title} • ${formatDateTime(
            latestBlog.updatedAt ?? latestBlog.date
          )}`
          : "Henüz blog yayını bulunamadı",
      },
      {
        label: "Toplam Kullanıcı",
        value: users.length,
        sublabel: `${adminCount} yönetici • ${users.length - adminCount} standart kullanıcı`,
      },
      {
        label: "Sunucu Durumu",
        value: health.status === "online" ? "Çevrimiçi" : "Çevrimdışı",
        sublabel: `Çalışma süresi: ${formattedUptime}`,
        tone: getServerTone(health),
      },
    ];

  const quickNavigation: ReadonlyArray<{
    title: string;
    description: string;
    href: string;
  }> = [
      {
        title: "Projeleri Yönet",
        description:
          "Portföyde yer alan projeleri güncelleyin veya yeni proje ekleyin.",
        href: "/admin/dashboard/projects",
      },
      {
        title: "Yeni Blog Yazısı",
        description: "Tengra topluluğu için yeni içerikler hazırlayın.",
        href: "/admin/dashboard/blogs",
      },
      {
        title: "Ana Sayfa İçeriği",
        description: "Ana sayfadaki hedefler ve S.S.S. bölümlerini düzenleyin.",
        href: "/admin/dashboard/homepage",
      },
      {
        title: "Kullanıcı Rollerini Düzenle",
        description: "Ekip üyelerine yönetici yetkisi verin veya erişimleri sınırlandırın.",
        href: "/admin/dashboard/users",
      },
    ];


  return (
    <div className="flex flex-col gap-12">
      <AdminPageHeader
        title="Admin Paneli"
        description="Stüdyonun projelerini, içeriklerini ve kullanıcılarını tek bir yerden yönetin."
      />

      <section aria-labelledby="admin-dashboard-overview">
        <h2 id="admin-dashboard-overview" className="sr-only">
          Panel Özeti
        </h2>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {statCards.map((card) => (
            <AdminStatCard
              key={card.label}
              label={card.label}
              value={card.value}
              sublabel={card.sublabel}
              tone={card.tone}
            />
          ))}
        </div>
      </section>

      <section
        aria-labelledby="admin-dashboard-shortcuts"
        className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]"
      >
        <div className="rounded-3xl border border-[rgba(110,211,225,0.16)] bg-[rgba(6,20,27,0.6)]/80 p-6 shadow-[0_25px_70px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          <h2
            id="admin-dashboard-shortcuts"
            className="text-lg font-semibold text-[color:var(--color-turkish-blue-200)]"
          >
            Hızlı Kısayollar
          </h2>
          <p className="mt-2 text-sm text-[rgba(255,255,255,0.6)]">
            En sık kullandığınız yönetim araçlarına tek tıkla ulaşın.
          </p>
          <ul className="mt-5 space-y-4 text-sm">
            {quickNavigation.map((action) => (
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

        <AdminCurrentUserCard />
      </section>

      <section aria-labelledby="admin-dashboard-metrics">
        <h2 id="admin-dashboard-metrics" className="sr-only">Sistem ve Trafik</h2>
        <AdminMetrics />
      </section>
    </div>
  );
}
