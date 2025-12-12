import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { resolveAdminSessionToken } from "@/lib/auth";
import { getProjectById } from "@/lib/db";
import ProjectEditForm from "@/components/admin/projects/project-edit-form";

type Props = {
    params: Promise<{ id: string }>;
};

export default async function AdminProjectEditPage({ params }: Props) {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = resolveAdminSessionToken((name) => cookieStore.get(name)?.value);

    // "new" için yeni proje oluşturma sayfası
    if (id === "new") {
        return <ProjectEditForm project={null} isNew={true} />;
    }

    const project = await getProjectById(id, token || undefined);

    if (!project) {
        notFound();
    }

    return <ProjectEditForm project={project} isNew={false} />;
}
