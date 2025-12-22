import AdminPageHeader from "@/components/admin/admin-page-header";
import VideoDownloaderPanel from "@/components/admin/media/video-downloader-panel";

export default function AdminVideosPage() {
  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title="Video İndirici"
        description="Kullanıcıların paylaştığı video bağlantılarının desteklenip desteklenmediğini kontrol edin ve seçili format için indirme linkini üretin."
      />
      <VideoDownloaderPanel />
    </div>
  );
}
