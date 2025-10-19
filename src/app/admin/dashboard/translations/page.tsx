import AdminPageHeader from "@/components/admin/admin-page-header";
import TranslationsTable from "@/components/admin/translations/translations-table";
import { listTranslationFiles } from "@/lib/admin/translations";

export default async function AdminTranslationsPage() {
  const files = await listTranslationFiles();

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title="Dil Dosyaları"
        description="Çeviri kaynaklarının durumunu görüntüleyin. Düzenleme arayüzü yakında eklenecek."
        ctaLabel="Yeni Dil"
        ctaMessage="Yeni dil ekleme işlemi için hazırlıklar sürüyor."
      />
      <TranslationsTable files={files} />
    </div>
  );
}
