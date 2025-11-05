import AdminPageHeader from "@/components/admin/admin-page-header";
import GoalsAdmin from "@/components/admin/goals/goals-admin";

export default function AdminGoalsPage() {
  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title="Hedefler"
        description="Hedefleri çok dilli olarak yönetin."
      />
      <GoalsAdmin />
    </div>
  );
}

