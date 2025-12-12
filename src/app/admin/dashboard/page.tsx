import type { ComponentProps } from "react"; 
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
import AdminMetrics from "@/components/admin/dashboard/metrics";
import ActiveAgents from "@/components/admin/dashboard/active-agents";

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

  // Hızlı kısayollar ve aktif yönetici bölümleri kaldırıldı.


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

      {/** Kısayollar ve Aktif Yönetici kaldırıldı */}

      <section aria-labelledby="admin-dashboard-metrics">
        <h2 id="admin-dashboard-metrics" className="sr-only">Sistem ve Trafik</h2>
        <AdminMetrics />
      </section>

      <section aria-labelledby="admin-dashboard-active-agents">
        <h2 id="admin-dashboard-active-agents" className="sr-only">Aktif Agentlar</h2>
        <ActiveAgents />
      </section>
    </div>
  );
}
