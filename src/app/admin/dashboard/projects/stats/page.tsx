import { cookies } from "next/headers";
import AdminPageHeader from "@/components/admin/admin-page-header";
import { resolveAdminSessionToken } from "@/lib/auth";
import { getAllProjects } from "@/lib/db";
import ProjectStatsViewer from "@/components/admin/projects/project-stats";

export default async function AdminProjectStatsPage() {
    const cookieStore = await cookies();
    const token = resolveAdminSessionToken((name) => cookieStore.get(name)?.value);
    const projects = await getAllProjects(token);

    return (
        <div className="flex flex-col gap-8">
            <AdminPageHeader
                title="Proje İstatistikleri"
                description="Projelerin günlük metriklerini görüntüleyin ve kıyaslayın."
            />
            <ProjectStatsViewer initialProjects={projects} />
        </div>
    );
}
