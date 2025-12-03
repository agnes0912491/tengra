"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GripVertical, Trash2 } from "lucide-react";
import { routing } from "@/i18n/routing";
import { useTranslations } from "next-intl";

type Goal = { title: string; body: string; order: number; isActive: boolean };
type TargetsShape = Goal[] | Record<string, Goal[]>;
type HomepagePayload = { targets?: TargetsShape; faqs?: unknown };

const SUPPORTED_LOCALES = routing.locales;

export default function GoalsAdmin() {
  const t = useTranslations("AdminContent");
  const [locale, setLocale] = useState<(typeof SUPPORTED_LOCALES)[number]>("tr");
  const [items, setItems] = useState<Goal[]>([]);
  const [raw, setRaw] = useState<HomepagePayload>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const extractForLocale = (targets: TargetsShape | undefined, loc: string): Goal[] => {
    if (!targets) return [];
    if (Array.isArray(targets)) return targets as Goal[];
    const map = targets as Record<string, Goal[]>;
    const list = map[loc] ?? [];
    return Array.isArray(list) ? list : [];
  };

  const assignForLocale = (targets: TargetsShape | undefined, loc: string, list: Goal[]): TargetsShape => {
    if (!targets) return { [loc]: list } as Record<string, Goal[]>;
    if (Array.isArray(targets)) {
      // migrate from old array-only format to localized map
      return { [loc]: list } as Record<string, Goal[]>;
    }
    const next = { ...(targets as Record<string, Goal[]>) };
    next[loc] = list;
    return next;
  };

  // Load initial homepage content
  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/homepage", { cache: "no-store" });
        const json = (await res.json().catch(() => ({}))) as HomepagePayload;
        if (!active) return;
        setRaw(json ?? {});
        setItems(extractForLocale(json?.targets, locale));
      } catch (e) {
        if (!active) return;
        setError(String(e));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When locale changes, refresh list from raw
  useEffect(() => {
    setItems(extractForLocale(raw?.targets, locale));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale]);

  const addNew = () => {
    setItems((prev) => [
      ...prev,
      { title: t("newGoalTitle"), body: t("newGoalBody"), order: prev.length, isActive: true },
    ]);
  };

  const reindex = (list: Goal[]) => list.map((it, i) => ({ ...it, order: i }));

  const saveAll = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const nextTargets = assignForLocale(raw?.targets, locale, reindex(items));
      const payload: HomepagePayload = { ...raw, targets: nextTargets };
      const res = await fetch("/api/admin/homepage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`${res.status} ${txt}`);
      }
      setRaw(payload);
      setSuccess(t("saved"));
      // notify live sections
      try { window.dispatchEvent(new CustomEvent("content:published", { detail: { payload } })); } catch {}
    } catch (e) {
        setError(String(e));
    } finally {
      setSaving(false);
    }
  };

  const removeAt = (idx: number) => {
    setItems((prev) => reindex(prev.filter((_, i) => i !== idx)));
  };

  const onDragStart = useCallback((idx: number) => setDragIndex(idx), []);

  const onDropOver = useCallback(
    (overIdx: number) => {
      if (dragIndex === null || dragIndex === overIdx) return;
      setItems((prev) => {
        const next = [...prev];
        const [m] = next.splice(dragIndex, 1);
        next.splice(overIdx, 0, m);
        return reindex(next);
      });
      setDragIndex(null);
    },
    [dragIndex]
  );

  return (
    <div className="rounded-3xl border border-[rgba(110,211,225,0.14)] bg-[rgba(6,18,26,0.78)]/80 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.35)]">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-40">
            <select
              value={locale}
              onChange={(e) => {
                const el = e.target as HTMLSelectElement | null;
                const v = (el?.value || locale) as (typeof SUPPORTED_LOCALES)[number];
                setLocale(v);
              }}
              className="w-full rounded-lg border border-[rgba(110,211,225,0.3)] bg-[rgba(4,18,24,0.85)] px-3 py-2 text-sm text-white"
            >
              {(SUPPORTED_LOCALES as readonly string[]).map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={addNew} className="border-[rgba(110,211,225,0.3)]">
            {t("newGoal")}
          </Button>
          <Button onClick={saveAll} className="bg-[color:var(--color-turkish-blue-500)] text-black" disabled={saving}>
            {saving ? t("saving") : t("save")}
          </Button>
        </div>
      </div>

      {loading && <p className="mt-4 text-sm text-[rgba(255,255,255,0.75)]">{t("loading")}</p>}
      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
      {success && <p className="mt-4 text-sm text-emerald-400">{success}</p>}

      <div className="mt-4 space-y-3">
        {items.length === 0 && !loading && (
          <div className="rounded-xl border border-dashed border-[rgba(110,211,225,0.2)] bg-[rgba(8,28,38,0.5)] p-8 text-center text-sm text-[rgba(255,255,255,0.75)]">
            {t("noRecords")}
          </div>
        )}

        {items.map((item, idx) => (
          <div
            key={idx}
            className="relative rounded-xl border border-[rgba(110,211,225,0.25)] bg-[rgba(8,28,38,0.5)] p-4"
            draggable
            onDragStart={() => onDragStart(idx)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => onDropOver(idx)}
          >
            <div className="absolute left-3 top-3 grid h-6 w-6 place-items-center rounded-full border border-[rgba(0,167,197,0.35)] bg-[rgba(0,167,197,0.15)] text-[10px] font-semibold text-[color:var(--color-turkish-blue-200)]">
              #{idx + 1}
            </div>
            <div className="flex items-start justify-between gap-3 pl-8">
              <div className="flex items-center gap-2 text-[rgba(255,255,255,0.72)]">
                <GripVertical className="h-4 w-4 opacity-70" />
                <span className="text-xs">{t("dragToSort")}</span>
              </div>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 rounded-full border border-[rgba(110,211,225,0.25)] bg-[rgba(4,18,24,0.75)] px-3 py-1 text-xs text-[rgba(255,255,255,0.8)]">
                  <input
                    type="checkbox"
                    checked={item.isActive}
                    onChange={(e) => {
                      const v = e.target.checked;
                      setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, isActive: v } : it)));
                    }}
                  />
                  {t("active")}
                </label>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => removeAt(idx)}
                  className="h-8 w-8 rounded-full p-0"
                  aria-label={t("delete")}
                  title={t("delete")}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3">
              <div>
                <label className="text-xs text-[rgba(255,255,255,0.75)]">{t("title")}</label>
                <Input
                  value={item.title}
                  onChange={(e) => {
                    const v = (e.target as HTMLInputElement | null)?.value ?? "";
                    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, title: v } : it)));
                  }}
                  className="mt-1 border-[rgba(0,167,197,0.28)] bg-[rgba(3,12,18,0.72)] text-white"
                />
              </div>
              <div>
                <label className="text-xs text-[rgba(255,255,255,0.75)]">{t("body")}</label>
                <textarea
                  value={item.body}
                  onChange={(e) => {
                    const v = (e.target as HTMLTextAreaElement | null)?.value ?? "";
                    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, body: v } : it)));
                  }}
                  className="mt-1 border-[rgba(0,167,197,0.28)] bg-[rgba(3,12,18,0.72)] text-white"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
