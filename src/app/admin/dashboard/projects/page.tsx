import { cookies } from "next/headers";

import AdminPageHeader from "@/components/admin/admin-page-header";
import ProjectsAdmin from "@/components/admin/projects/projects-admin";
import { resolveAdminSessionToken } from "@/lib/auth";
import { getAllProjects } from "@/lib/db";

export default async function AdminProjectsPage() {
  const cookieStore = await cookies();
  const token = resolveAdminSessionToken((name) => cookieStore.get(name)?.value);
  const projects = await getAllProjects(token);

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title="Projeler"
        description="App Store tarzında proje yönetimi. Ekran görüntüleri, özellikler ve daha fazlasını düzenleyin."
      />
      <ProjectsAdmin projects={projects} />
    </div>
  );
}
