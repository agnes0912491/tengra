"use client";

import type React from "react";
import { useCallback, useMemo, useState } from "react";
import { AudioLines, CheckCircle2, Download, Info, Link2, Loader2, ShieldAlert } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/providers/auth-provider";
import { checkVideoSupport, requestVideoDownload, type VideoDownloadResult, type VideoSupportCheck } from "@/lib/db";
import { cn } from "@/lib/utils";

type FormatKey = "mp4" | "webm" | "audio";

const FORMAT_OPTIONS: ReadonlyArray<{ key: FormatKey; titleKey: string; hintKey: string; icon?: React.ComponentType<React.SVGProps<SVGSVGElement>> }> = [
  { key: "mp4", titleKey: "formats.mp4.title", hintKey: "formats.mp4.hint", icon: Download },
  { key: "webm", titleKey: "formats.webm.title", hintKey: "formats.webm.hint", icon: Link2 },
  { key: "audio", titleKey: "formats.audio.title", hintKey: "formats.audio.hint", icon: AudioLines },
];

export default function VideoDownloaderPanel() {
  const { token, user } = useAuth();
  const t = useTranslations("AdminMedia");
  const [url, setUrl] = useState("");
  const [format, setFormat] = useState<FormatKey>("mp4");
  const [support, setSupport] = useState<VideoSupportCheck | null>(null);
  const [downloadResult, setDownloadResult] = useState<VideoDownloadResult | null>(null);
  const [status, setStatus] = useState<"idle" | "checking" | "ready" | "downloading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const authMissing = !token;

  const supportedPlatforms = useMemo(
    () => ["YouTube", "Vimeo", "Dailymotion"],
    []
  );

  const handleCheck = useCallback(async (): Promise<boolean> => {
    setError(null);
    setDownloadResult(null);
    if (!url.trim()) {
      setError(t("errors.missingUrl"));
      setStatus("error");
      return false;
    }
    if (!token) {
      setError(t("errors.unauthenticated"));
      setStatus("error");
      return false;
    }
    setStatus("checking");
    const response = await checkVideoSupport(url.trim(), token);
    setSupport(response);
    if (!response.supported) {
      setStatus("error");
      setError(response.message ?? t("errors.unsupported"));
      return false;
    }
    if (response.toolAvailable === false) {
      setStatus("error");
      setError(response.message ?? t("errors.toolMissing"));
      return false;
    }
    setStatus("ready");
    return true;
  }, [token, url, t]);

  const handleDownload = useCallback(async () => {
    setError(null);
    setDownloadResult(null);
    if (!token) {
      setError(t("errors.unauthenticated"));
      setStatus("error");
      return;
    }

    const ready = support?.supported && support.toolAvailable !== false ? true : await handleCheck();
    if (!ready) return;

    setStatus("downloading");
    const response = await requestVideoDownload({ url: url.trim(), format, token });
    setDownloadResult(response);
    if (!response.success || !response.downloadUrl) {
      setStatus("error");
      setError(response.error ?? t("errors.downloadFailed"));
      return;
    }
    setStatus("ready");
  }, [format, handleCheck, support, token, url, t]);

  const statusLabel = useMemo(() => {
    if (error) return { tone: "danger", text: error };
    if (status === "downloading") return { tone: "info", text: t("status.downloading") };
    if (status === "checking") return { tone: "info", text: t("status.checking") };
    if (support?.supported) {
      return { tone: "success", text: support.message ?? t("status.supported") };
    }
    return { tone: "muted", text: t("status.prompt") };
  }, [error, status, support, t]);

  const isBusy = status === "checking" || status === "downloading";

  return (
    <Card className="relative overflow-hidden border-[rgba(72,213,255,0.14)] bg-[rgba(10,20,36,0.75)]">
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute -left-24 top-0 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(30,184,255,0.16)_0%,transparent_60%)] blur-2xl" />
        <div className="absolute -right-10 bottom-0 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(104,219,255,0.14)_0%,transparent_60%)] blur-2xl" />
      </div>
      <CardHeader className="relative">
        <CardTitle className="flex items-center gap-3 text-xl md:text-2xl">
          <Download className="h-5 w-5 text-[var(--color-turkish-blue-300)]" />
          {t("title")}
        </CardTitle>
        <CardDescription className="flex flex-wrap items-center gap-2 text-sm text-[var(--text-muted)]">
          {t("description")}
          <span className="inline-flex items-center gap-1 rounded-full border border-[rgba(72,213,255,0.22)] bg-[rgba(30,184,255,0.08)] px-2 py-0.5 text-[11px] text-[var(--color-turkish-blue-200)]">
            {supportedPlatforms.join(" • ")}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="relative z-[1] flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <label className="text-sm font-medium text-[var(--text-secondary)]" htmlFor="video-url">
            {t("urlLabel")}
          </label>
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <Input
              id="video-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="flex-1"
              disabled={isBusy}
            />
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCheck}
                disabled={isBusy || authMissing}
                className="min-w-[130px]"
              >
                {status === "checking" ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldAlert className="h-4 w-4" />}
                {t("actions.check")}
              </Button>
              <Button
                type="button"
                onClick={handleDownload}
                disabled={isBusy || authMissing}
                className="min-w-[160px]"
              >
                {status === "downloading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                {t("actions.download")}
              </Button>
            </div>
          </div>
          {authMissing ? (
            <p className="text-xs text-amber-200/80">
              {t("authRequired", { name: user?.displayName || "—" })}
            </p>
          ) : null}
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {FORMAT_OPTIONS.map((item) => {
            const Icon = item.icon;
            const isSelected = format === item.key;
            const title = t(item.titleKey);
            const hint = t(item.hintKey);
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setFormat(item.key)}
                className={cn(
                  "group flex h-full flex-col gap-1 rounded-xl border px-4 py-3 text-left transition-all duration-200",
                  "bg-[rgba(15,31,54,0.65)] hover:bg-[rgba(30,184,255,0.08)]",
                  isSelected
                    ? "border-[rgba(72,213,255,0.5)] shadow-[0_10px_30px_rgba(30,184,255,0.25)]"
                    : "border-[rgba(72,213,255,0.18)] hover:border-[rgba(72,213,255,0.3)]"
                )}
              >
                <div className="flex items-center gap-2">
                  {Icon ? <Icon className="h-4 w-4 text-[var(--color-turkish-blue-200)]" /> : null}
                  <span className="text-sm font-semibold text-[var(--text-primary)]">{title}</span>
                </div>
                <span className="text-xs text-[var(--text-muted)]">{hint}</span>
                {isSelected ? (
                  <span className="mt-1 inline-flex w-fit items-center gap-1 rounded-full bg-[rgba(30,184,255,0.12)] px-2 py-0.5 text-[11px] text-[var(--color-turkish-blue-200)]">
                    <CheckCircle2 className="h-3 w-3" />
                    {t("selected")}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        <div className="rounded-xl border border-[rgba(72,213,255,0.15)] bg-[rgba(9,20,33,0.7)] p-4 shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
          <div className="flex items-start gap-3">
            {statusLabel.tone === "success" ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-400" />
            ) : statusLabel.tone === "danger" ? (
              <ShieldAlert className="mt-0.5 h-4 w-4 text-red-400" />
            ) : (
              <Info className="mt-0.5 h-4 w-4 text-[var(--color-turkish-blue-200)]" />
            )}
            <div className="flex flex-col gap-1">
              <span className={cn("text-sm font-medium", statusLabel.tone === "danger" ? "text-red-200" : "text-[var(--text-primary)]")}>
                {statusLabel.text}
              </span>
              <div className="flex flex-wrap gap-2 text-xs text-[var(--text-muted)]">
                <span className="rounded-full bg-[rgba(30,184,255,0.08)] px-2 py-0.5">
                  {t("selectedFormat", { format: format.toUpperCase() })}
                </span>
                {support?.platform ? (
                  <span className="rounded-full bg-[rgba(99,102,241,0.08)] px-2 py-0.5">
                    {t("platformLabel", { platform: support.platform })}
                  </span>
                ) : null}
                {support?.formats?.length ? (
                  <span className="rounded-full bg-[rgba(16,185,129,0.08)] px-2 py-0.5">
                    {t("supportedFormats", { formats: support.formats.map((f) => f.toUpperCase()).join(", ") })}
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          {downloadResult?.downloadUrl && downloadResult.success ? (
            <div className="mt-4 flex flex-col gap-2 rounded-lg border border-[rgba(72,213,255,0.2)] bg-[rgba(30,184,255,0.05)] p-3">
              <div className="flex items-center gap-2 text-sm text-[var(--text-primary)]">
                <Link2 className="h-4 w-4 text-[var(--color-turkish-blue-200)]" />
                {t("downloadReady")}
              </div>
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <code className="max-w-full truncate rounded-lg bg-[rgba(0,0,0,0.35)] px-3 py-2 text-xs text-[var(--color-turkish-blue-100)]">
                  {downloadResult.downloadUrl}
                </code>
                <div className="flex gap-2">
                  <Button asChild size="sm" variant="outline">
                    <a href={downloadResult.downloadUrl} target="_blank" rel="noreferrer">
                      {t("openNewTab")}
                    </a>
                  </Button>
                  <Button asChild size="sm">
                    <a href={downloadResult.downloadUrl} download>
                      {t("downloadCta")}
                    </a>
                  </Button>
                </div>
              </div>
              {downloadResult.note ? (
                <p className="text-xs text-[var(--text-muted)]">
                  {downloadResult.note}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
