import { cookies } from "next/headers";

import AdminPageHeader from "@/components/admin/admin-page-header";
import UsersTable from "@/components/admin/users/users-table";
import { ADMIN_SESSION_COOKIE } from "@/lib/auth";
import { getAllUsers } from "@/lib/db";

export default async function AdminUsersPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  const users = token ? await getAllUsers(token).catch(() => []) : [];

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title="Kullanıcılar"
        description="Platforma kayıtlı kullanıcıların rollerini ve erişimlerini yönetin."
        ctaLabel="Yeni Kullanıcı"
        ctaMessage="Yeni kullanıcı oluşturma için backend entegrasyonu bekleniyor."
      />
      <UsersTable initialUsers={users} />
    </div>
  );
}
