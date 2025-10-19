import type { TranslationFileInfo } from "@/lib/admin/translations";

const formatBytes = (bytes: number) => {
  if (bytes === 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** index;
  return `${value.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
};

type Props = {
  files: TranslationFileInfo[];
};

export default function TranslationsTable({ files }: Props) {
  if (files.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-[rgba(110,211,225,0.2)] bg-[rgba(6,20,27,0.6)]/60 p-10 text-center text-sm text-[rgba(255,255,255,0.55)]">
        Çeviri dosyaları bulunamadı.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-[rgba(110,211,225,0.16)] bg-[rgba(6,20,27,0.55)]/80 shadow-[0_25px_70px_rgba(0,0,0,0.45)] backdrop-blur-xl">
      <table className="min-w-full divide-y divide-[rgba(110,211,225,0.15)]">
        <thead className="bg-[rgba(8,24,32,0.8)] text-[rgba(255,255,255,0.65)]">
          <tr>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.35em]">
              Dil
            </th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.35em]">
              Dosya
            </th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.35em]">
              Boyut
            </th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.35em]">
              Karakter
            </th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.35em]">
              Anahtar Sayısı
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[rgba(110,211,225,0.08)] text-sm text-[rgba(255,255,255,0.8)]">
          {files.map((file) => (
            <tr key={file.absolutePath} className="hover:bg-[rgba(8,32,42,0.55)]">
              <td className="px-6 py-4">
                <span className="rounded-full border border-[rgba(110,211,225,0.35)] bg-[rgba(8,28,38,0.55)] px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-[color:var(--color-turkish-blue-200)]">
                  {file.locale}
                </span>
              </td>
              <td className="px-6 py-4 font-medium text-white">{file.fileName}</td>
              <td className="px-6 py-4 text-[rgba(255,255,255,0.7)]">{formatBytes(file.bytes)}</td>
              <td className="px-6 py-4 text-[rgba(255,255,255,0.7)]">{file.characters.toLocaleString("tr-TR")}</td>
              <td className="px-6 py-4 text-[rgba(255,255,255,0.7)]">{file.keys.toLocaleString("tr-TR")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
