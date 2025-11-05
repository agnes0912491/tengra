import AdminPageHeader from "@/components/admin/admin-page-header";
import DesignControls from "@/components/admin/design/design-controls";

export default function AdminDesignPage() {
  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title="Tasarım Kontrolleri"
        description="Site temasını ve görsel bileşenleri buradan özelleştirin. Ayarlar tarayıcıda saklanır."
      />
      <DesignControls />
    </div>
  );
}
