"use client";

import { useCallback, useState } from "react";
import type { TranslationFileInfo } from "@/lib/admin/translations";
import { useTranslation } from "@tengra/language";

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
  const { language: locale } = useTranslation();
  const { t } = useTranslation("AdminTranslations");
  const [preview, setPreview] = useState<string | null>(null);
  const [previewLocale, setPreviewLocale] = useState<string | null>(null);

  const showPreview = useCallback(async (locale: string) => {
    try {
      const res = await fetch(`/api/translations/preview?locale=${encodeURIComponent(locale)}`);
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setPreview(t("preview.error", { error: j.error || res.status }));
        setPreviewLocale(locale);
        return;
      }
      const json = await res.json();
      const raw = json.content ?? "";
      try {
        const parsed = JSON.parse(raw);
        setPreview(JSON.stringify(parsed, null, 2));
      } catch {
        setPreview(raw);
      }
      setPreviewLocale(locale);
    } catch {
      setPreview(t("preview.unknownError"));
      setPreviewLocale(locale);
    }
  }, [t]);

  const hidePreview = useCallback(() => {
    setPreview(null);
    setPreviewLocale(null);
  }, []);

  if (files.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-[rgba(110,211,225,0.2)] bg-[rgba(6,20,27,0.6)]/60 p-10 text-center text-sm text-[rgba(255,255,255,0.55)]">
        {t("empty")}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-[rgba(110,211,225,0.16)] bg-[rgba(6,20,27,0.55)]/80 shadow-[0_25px_70px_rgba(0,0,0,0.45)] backdrop-blur-xl">
      <table className="min-w-full divide-y divide-[rgba(110,211,225,0.15)]">
        <thead className="bg-[rgba(8,24,32,0.8)] text-[rgba(255,255,255,0.65)]">
          <tr>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.35em]">
              {t("table.locale")}
            </th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.35em]">
              {t("table.file")}
            </th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.35em]">
              {t("table.size")}
            </th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.35em]">
              {t("table.characters")}
            </th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.35em]">
              {t("table.keys")}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[rgba(110,211,225,0.08)] text-sm text-[rgba(255,255,255,0.8)]">
          {files.map((file) => (
            <tr
              key={file.absolutePath}
              className="hover:bg-[rgba(8,32,42,0.55)]"
              onDoubleClick={() => showPreview(file.locale)}
              role="button"
              tabIndex={0}
            >
              <td className="px-6 py-4">
                <span className="rounded-full border border-[rgba(110,211,225,0.35)] bg-[rgba(8,28,38,0.55)] px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-[color:var(--color-turkish-blue-200)]">
                  {file.locale}
                </span>
              </td>
              <td className="px-6 py-4 font-medium text-white">{file.fileName}</td>
              <td className="px-6 py-4 text-[rgba(255,255,255,0.7)]">{formatBytes(file.bytes)}</td>
              <td className="px-6 py-4 text-[rgba(255,255,255,0.7)]">{file.characters.toLocaleString(locale)}</td>
              <td className="px-6 py-4 text-[rgba(255,255,255,0.7)]">{file.keys.toLocaleString(locale)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {preview !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60" onClick={hidePreview} />
          <div className="relative z-10 max-h-[80vh] w-full max-w-3xl overflow-auto rounded-2xl bg-[rgba(6,20,27,0.9)] p-6 text-sm text-[rgba(255,255,255,0.95)]">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{t("preview.title", { locale: previewLocale })}</h3>
              <button className="ml-4 rounded border px-3 py-1 text-sm" onClick={hidePreview}>
                {t("preview.close")}
              </button>
            </div>
            <pre className="mt-4 whitespace-pre overflow-auto rounded-md bg-[rgba(3,12,18,0.8)] p-4 text-xs leading-relaxed text-[rgba(223,241,246,0.95)] border border-[rgba(0,167,197,0.2)]">
              {preview}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
