"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowDown, ArrowUp } from "lucide-react";
// import { cn } from "@/lib/utils";
import { routing } from "@/i18n/routing";

type Goal = { title: string; body: string; order: number; isActive: boolean };
type TargetsShape = Goal[] | Record<string, Goal[]>;
type HomepagePayload = { targets?: TargetsShape; faqs?: unknown };

const SUPPORTED_LOCALES = routing.locales;

export default function GoalsAdmin() {
  const [locale, setLocale] = useState<(typeof SUPPORTED_LOCALES)[number]>("tr");
  const [items, setItems] = useState<Goal[]>([]);
  const [raw, setRaw] = useState<HomepagePayload>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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
      { title: "Yeni hedef", body: "Açıklama", order: prev.length, isActive: true },
    ]);
  };

  const saveAll = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const nextTargets = assignForLocale(raw?.targets, locale, items);
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
      setSuccess("Kaydedildi");
      // notify live sections
      try { window.dispatchEvent(new CustomEvent("content:published", { detail: { payload } })); } catch {}
    } catch (e) {
      setError(String(e));
    } finally {
      setSaving(false);
    }
  };

  const removeAt = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="rounded-3xl border border-[rgba(110,211,225,0.16)] bg-[rgba(6,20,27,0.6)]/80 p-6">
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
              className="w-full rounded-lg border border-[rgba(110,211,225,0.35)] bg-[rgba(4,18,24,0.85)] px-3 py-2 text-sm text-white"
            >
              {(SUPPORTED_LOCALES as readonly string[]).map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={addNew} className="border-[rgba(110,211,225,0.35)]">Yeni Hedef</Button>
          <Button onClick={saveAll} className="bg-[color:var(--color-turkish-blue-500)] text-black" disabled={saving}>{saving ? "Kaydediliyor…" : "Kaydet"}</Button>
        </div>
      </div>

      {loading && <p className="mt-4 text-sm text-[rgba(255,255,255,0.7)]">Yükleniyor…</p>}
      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
      {success && <p className="mt-4 text-sm text-emerald-400">{success}</p>}

      <div className="mt-4 space-y-3">
        {items.length === 0 && !loading && (
          <div className="rounded-xl border border-dashed border-[rgba(110,211,225,0.25)] bg-[rgba(8,28,38,0.5)] p-8 text-center text-sm text-[rgba(255,255,255,0.7)]">
            Kayıt bulunamadı.
          </div>
        )}

        {items.map((item, idx) => (
          <div key={idx} className="rounded-xl border border-[rgba(110,211,225,0.25)] bg-[rgba(8,28,38,0.5)] p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[rgba(255,255,255,0.6)]">Sıra</span>
                <input
                  type="number"
                  value={item.order}
                  onChange={(e) => {
                    const v = Number(e.target.value) || 0;
                    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, order: v } : it)));
                  }}
                  className="w-20 rounded-md border border-[rgba(110,211,225,0.25)] bg-[rgba(4,18,24,0.85)] px-2 py-1 text-xs text-white"
                />
                <button
                  type="button"
                  className="rounded-md border border-[rgba(110,211,225,0.3)] p-1 text-[rgba(255,255,255,0.75)] hover:text-[color:var(--color-turkish-blue-300)]"
                  aria-label="Yukarı taşı"
                  onClick={() => setItems((prev) => {
                    if (idx <= 0) return prev;
                    const copy = [...prev];
                    const [m] = copy.splice(idx, 1);
                    copy.splice(idx - 1, 0, m);
                    return copy.map((it, i) => ({ ...it, order: i }));
                  })}
                >
                  <ArrowUp size={14} />
                </button>
                <button
                  type="button"
                  className="rounded-md border border-[rgba(110,211,225,0.3)] p-1 text-[rgba(255,255,255,0.75)] hover:text-[color:var(--color-turkish-blue-300)]"
                  aria-label="Aşağı taşı"
                  onClick={() => setItems((prev) => {
                    if (idx >= prev.length - 1) return prev;
                    const copy = [...prev];
                    const [m] = copy.splice(idx, 1);
                    copy.splice(idx + 1, 0, m);
                    return copy.map((it, i) => ({ ...it, order: i }));
                  })}
                >
                  <ArrowDown size={14} />
                </button>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs text-[rgba(255,255,255,0.75)]">
                  <input
                    type="checkbox"
                    checked={item.isActive}
                    onChange={(e) => {
                      const v = e.target.checked;
                      setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, isActive: v } : it)));
                    }}
                  />
                  Aktif
                </label>
                <Button variant="outline" onClick={() => removeAt(idx)} className="border-[rgba(110,211,225,0.35)]">Sil</Button>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <label className="text-xs text-[rgba(255,255,255,0.7)]">Başlık</label>
                <Input
                  value={item.title}
                  onChange={(e) => {
                    const v = (e.target as HTMLInputElement | null)?.value ?? "";
                    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, title: v } : it)));
                  }}
                  className="mt-1 border-[rgba(0,167,197,0.3)] bg-[rgba(3,12,18,0.75)] text-white"
                />
              </div>
              <div>
                <label className="text-xs text-[rgba(255,255,255,0.7)]">Açıklama</label>
                <Input
                  value={item.body}
                  onChange={(e) => {
                    const v = (e.target as HTMLInputElement | null)?.value ?? "";
                    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, body: v } : it)));
                  }}
                  className="mt-1 border-[rgba(0,167,197,0.3)] bg-[rgba(3,12,18,0.75)] text-white"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
