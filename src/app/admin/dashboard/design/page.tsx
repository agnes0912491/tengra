import AdminPageHeader from "@/components/admin/admin-page-header";

export default function AdminDesignPage() {
  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title="Tasarım Kontrolleri"
        description="Site temasını ve görsel bileşenleri buradan özelleştirebileceksiniz."
        ctaLabel="Yeni Tema"
        ctaMessage="Tema düzenleme arayüzü henüz hazır değil."
      />
      <div className="rounded-3xl border border-dashed border-[rgba(110,211,225,0.2)] bg-[rgba(6,20,27,0.6)]/60 p-10 text-center text-sm text-[rgba(255,255,255,0.6)]">
        Tasarım yönetimi için kontrol paneli geliştiriliyor. Yakında buradan renkler, tipografi ve bileşen varyasyonları
        düzenlenebilecek.
      </div>
    </div>
  );
}
