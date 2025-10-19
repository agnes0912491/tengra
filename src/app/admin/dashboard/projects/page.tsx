import { cookies } from "next/headers";

import AdminPageHeader from "@/components/admin/admin-page-header";
import ProjectsTable from "@/components/admin/projects/projects-table";
import { ADMIN_SESSION_COOKIE } from "@/lib/auth";
import { getAllProjects } from "@/lib/db";

export default async function AdminProjectsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  const projects = await getAllProjects(token);

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title="Projeler"
        description="Stüdyonun vitrinindeki projeleri güncelleyin veya yenilerini ekleyin."
        ctaLabel="Yeni Proje"
        ctaMessage="Yeni proje oluşturma iş akışı yakında aktif olacak."
      />
      <ProjectsTable projects={projects} />
    </div>
  );
}
