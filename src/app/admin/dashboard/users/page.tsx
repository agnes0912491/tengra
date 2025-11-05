import { cookies } from "next/headers";

import AdminPageHeader from "@/components/admin/admin-page-header";
import UsersTable from "@/components/admin/users/users-table";
import { resolveAdminSessionToken } from "@/lib/auth";
import { getAllUsers, getUserWithToken } from "@/lib/db";

export default async function AdminUsersPage() {
  const cookieStore = await cookies();
  const token = resolveAdminSessionToken((name) => cookieStore.get(name)?.value);
  const users = token ? await getAllUsers(token).catch(() => []) : [];
  const currentUser = token ? await getUserWithToken(token) : null;

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title="Kullanıcılar"
        description="Platforma kayıtlı kullanıcıların rollerini ve erişimlerini yönetin."
        ctaLabel="Yeni Kullanıcı"
      />
      <UsersTable initialUsers={users} currentUserId={currentUser?.id} currentUserRole={currentUser?.role} />
    </div>
  );
}
