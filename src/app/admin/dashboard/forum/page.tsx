import { cookies } from "next/headers";

import AdminPageHeader from "@/components/admin/admin-page-header";
import ForumAdmin from "@/components/admin/forum/forum-admin";
import { resolveAdminSessionToken } from "@/lib/auth";
import { adminFetchForumCategories } from "@/lib/forum";

export default async function AdminForumPage() {
  const cookieStore = await cookies();
  const token = resolveAdminSessionToken((name) => cookieStore.get(name)?.value);
  const categories = token ? await adminFetchForumCategories(token).catch(() => []) : [];

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title="Forum"
        description="Kategorileri düzenleyin, görünürlük ve kilit durumlarını yönetin."
      />
      {token ? (
        <ForumAdmin token={token} initialCategories={categories} />
      ) : (
        <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-200">
          Yönetici oturumu bulunamadı. Lütfen tekrar giriş yapın.
        </div>
      )}
    </div>
  );
}
