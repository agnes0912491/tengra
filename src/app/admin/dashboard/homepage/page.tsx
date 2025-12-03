import AdminPageHeader from "@/components/admin/admin-page-header";
import GoalsAdmin from "@/components/admin/goals/goals-admin";

export default function AdminHomepagePage() {
  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title="Homepage Hedefleri"
        description="Ana sayfada kullanılan hedef içeriklerini çok dilli olarak yönetin."
      />
      <GoalsAdmin />
    </div>
  );
}
