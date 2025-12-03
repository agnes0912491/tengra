"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import * as Dialog from "@radix-ui/react-dialog";
import { Input } from "@/components/ui/input";
// import { cn } from "@/lib/utils";
import Cookies from "js-cookie";
import { ADMIN_SESSION_COOKIE_CANDIDATES } from "@/lib/auth";
import { createFaq, deleteFaq, getFaqs, updateFaq, type FaqItem } from "@/lib/db";
import { routing } from "@/i18n/routing";
import { GripVertical, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
const MDEditor = dynamic<{
  value?: string;
  onChange?: (v?: string) => void;
  height?: number;
  preview?: "edit" | "preview" | "live";
  style?: React.CSSProperties;
}>(() => import("@uiw/react-md-editor").then(m => m.default as unknown as React.ComponentType<{
  value?: string;
  onChange?: (v?: string) => void;
  height?: number;
  preview?: "edit" | "preview" | "live";
  style?: React.CSSProperties;
}>), { ssr: false, loading: () => (
  <div className="space-y-2"><div className="h-6 w-40 rounded-md bg-[rgba(255,255,255,0.06)] animate-pulse" /><div className="h-32 w-full rounded-lg bg-[rgba(255,255,255,0.04)] animate-pulse" /></div>
) });

const SUPPORTED_LOCALES = routing.locales;

export default function FaqAdmin() {
    const t = useTranslations("AdminContent");
    const [locale, setLocale] = useState<(typeof SUPPORTED_LOCALES)[number]>("tr");
    const [items, setItems] = useState<FaqItem[]>([]);
    const [drafts, setDrafts] = useState<FaqItem[]>([]);
    const [dirty, setDirty] = useState<Set<string>>(new Set());
    const [orderDirty, setOrderDirty] = useState(false);
    const [savingAll, setSavingAll] = useState(false);
    const [openConfirmAll, setOpenConfirmAll] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const token = useMemo(
        () => ADMIN_SESSION_COOKIE_CANDIDATES.map((n) => Cookies.get(n)).find(Boolean) || "",
        []
    );

    const load = async (loc: string) => {
        setLoading(true);
        setError(null);
        try {
            const list = await getFaqs(loc);
            const cloned = list.map(i => ({ ...i }));
            setItems(cloned);
            setDrafts(cloned.map(i => ({ ...i })));
            setDirty(new Set());
            setOrderDirty(false);
        } catch (e) {
            setError(String(e));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load(locale);
    }, [locale]);

    const addNew = async () => {
        if (!token) return;
        const created = await createFaq(
            {
                locale,
                question: t("newFaqQuestion"),
                answer: t("newFaqAnswer"),
                order: items.length,
                isActive: true,
            },
            token
        );
        if (created) {
            setItems((prev) => [...prev, { ...created }]);
            setDrafts((prev) => [...prev, { ...created }]);
        }
    };

    const saveItem = useCallback(async (id: string, patch: Partial<FaqItem>) => {
        if (!token) return;
        const updated = await updateFaq(id, patch, token);
        if (updated) {
            setItems((prev) => prev.map((i) => (i.id === id ? { ...updated } : i)));
            setDrafts((prev) => prev.map((i) => (i.id === id ? { ...updated } : i)));
            setDirty((prev) => { const s = new Set(prev); s.delete(id); return s; });
        }
    }, [token]);

    const removeItem = async (id: string) => {
        if (!token) return;
        const ok = await deleteFaq(id, token);
        if (ok) {
            setItems((prev) => prev.filter((i) => i.id !== id));
            setDrafts((prev) => prev.filter((i) => i.id !== id));
            setDirty((prev) => { const s = new Set(prev); s.delete(id); return s; });
        }
    };

    // Drag & drop ordering (vertical list)
    const [dragId, setDragId] = useState<string | null>(null);
    const onDragStart = useCallback((id: string) => setDragId(id), []);
    const onDropOver = useCallback((overId: string) => {
        if (!dragId || dragId === overId) return;
        setDrafts((prev) => {
            const srcIdx = prev.findIndex((i) => i.id === dragId);
            const dstIdx = prev.findIndex((i) => i.id === overId);
            if (srcIdx < 0 || dstIdx < 0) return prev;
            const next = prev.map((i) => ({ ...i }));
            const [moved] = next.splice(srcIdx, 1);
            next.splice(dstIdx, 0, moved);
            next.forEach((it, index) => {
                it.order = index;
            });
            return next;
        });
        setOrderDirty(true);
        setDragId(null);
    }, [dragId]);

    const saveOrder = async () => {
        if (!token) return;
        const updates: Array<Promise<unknown>> = [];
        drafts.forEach((it, idx) => {
            if (items[idx]?.id !== it.id || items[idx]?.order !== it.order) {
                updates.push(updateFaq(it.id, { order: it.order }, token));
            }
        });
        await Promise.all(updates);
        setItems(drafts.map(i => ({ ...i })));
        setOrderDirty(false);
    };

    const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
    const setDraftField = (id: string, field: keyof FaqItem, value: string) => {
        // Avoid unnecessary updates when incoming value matches the
        // current draft and original item – this helps prevent cases
        // where the editor calls onChange on mount and falsely marks
        // items as "dirty" even though the user has not edited them.
        setDrafts((prev) => {
            let changed = false;
            const next = prev.map((i) => {
                if (i.id !== id) return i;
                // If the value is identical, do not allocate a new object
                if (i[field] === (value as unknown as FaqItem[typeof field])) {
                    return i;
                }
                changed = true;
                return { ...i, [field]: value };
            });
            return changed ? next : prev;
        });

        const original = items.find((i) => i.id === id);
        const isDirtyNow =
            !original ||
            // Only compare string fields; we currently use setDraftField
            // for question/answer updates.
            original[field] !== (value as unknown as FaqItem[typeof field]);

        setDirty((prev) => {
            const s = new Set(prev);
            if (isDirtyNow) {
                s.add(id);
            } else {
                s.delete(id);
            }
            return s;
        });

        if (timers.current[id]) clearTimeout(timers.current[id]);
        timers.current[id] = setTimeout(() => {}, 250);
    };

    return (
      <>
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
                                <option key={loc} value={loc}>
                                    {loc}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {orderDirty && (
                    <DebouncedSave onSave={saveOrder} label={t("orderSave")} busyLabel={t("saving")} />
                  )}
                  {dirty.size > 0 && (
                    <>
                      <Button onClick={async () => {
                        setSavingAll(true);
                        try {
                          //const payloads = Array.from(dirty.values()).map(() => null);
                          // Persist only dirty items' question/answer
                          const ops: Array<Promise<unknown>> = [];
                          drafts.forEach((d) => {
                            if (dirty.has(d.id)) {
                              ops.push(updateFaq(d.id, { question: d.question, answer: d.answer }, token));
                            }
                          });
                          await Promise.all(ops);
                          // refresh items from drafts
                          setItems(drafts.map((i) => ({ ...i })));
                          setDirty(new Set());
                        } finally {
                          setSavingAll(false);
                        }
                      }} disabled={savingAll} className="bg-[color:var(--color-turkish-blue-500)] text-black">
                        {savingAll ? t("saving") : t("saveAll")}
                      </Button>
                      <Button variant="outline" onClick={() => setOpenConfirmAll(true)}>{t("cancelAll")}</Button>
                    </>
                  )}
                  <Button onClick={addNew} className="bg-[color:var(--color-turkish-blue-500)] text-black">{t("newFaq")}</Button>
                </div>
            </div>

            {loading && <p className="mt-4 text-sm text-[rgba(255,255,255,0.75)]">{t("loading")}</p>}
            {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

            <div className="mt-4 space-y-3">
                {drafts.length === 0 && !loading && (
                    <div className="rounded-xl border border-dashed border-[rgba(110,211,225,0.2)] bg-[rgba(8,28,38,0.5)] p-8 text-center text-sm text-[rgba(255,255,255,0.75)]">
                        {t("noRecords")}
                    </div>
                )}

                {drafts.map((item, index) => (
                    <div
                        key={item.id}
                        className="relative rounded-xl border border-[rgba(110,211,225,0.25)] bg-[rgba(8,28,38,0.5)] p-4"
                        draggable
                        onDragStart={() => onDragStart(item.id)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => onDropOver(item.id)}
                    >
                        {/* Order badge */}
                        <div className="absolute left-3 top-3 grid h-6 w-6 place-items-center rounded-full bg-[rgba(0,167,197,0.15)] text-[10px] font-semibold text-[color:var(--color-turkish-blue-200)] border border-[rgba(0,167,197,0.35)]">
                            #{index + 1}
                        </div>
                        <div className="flex items-start justify-between gap-3 pl-8">
                            <div className="flex items-center gap-2 text-[rgba(255,255,255,0.72)]">
                                <GripVertical className="h-4 w-4 opacity-70" />
                                <span className="text-xs">{t("dragToSort")}</span>
                            </div>
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={() => removeItem(item.id)}
                                className="h-8 w-8 rounded-full p-0"
                                aria-label="Sil"
                                title="Sil"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="mt-3 grid grid-cols-1 gap-3">
                            <div>
                                <label className="text-xs text-[rgba(255,255,255,0.75)]">{t("question")}</label>
                                <Input
                                    value={item.question}
                                    onChange={(e) => setDraftField(item.id, "question", e.currentTarget.value)}
                                    className="mt-1 border-[rgba(0,167,197,0.28)] bg-[rgba(3,12,18,0.72)] text-white"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-[rgba(255,255,255,0.75)]">{t("answer")}</label>
                                <div data-color-mode="dark" className="rounded-lg border border-[rgba(0,167,197,0.28)] bg-[rgba(3,12,18,0.62)] p-2">
                                  <MDEditor value={item.answer} onChange={(v: string = "") => setDraftField(item.id, "answer", v)} height={180} style={{ background: "transparent" }} preview="edit" />
                                </div>
                            </div>
                        </div>
                        {dirty.has(item.id) && (
                          <div className="mt-3 flex items-center gap-2">
                            <Button onClick={() => saveItem(item.id, { question: item.question, answer: item.answer })} className="bg-[color:var(--color-turkish-blue-500)] text-black">{t("save")}</Button>
                            <Button variant="outline" onClick={() => {
                              const original = items.find(i => i.id === item.id);
                              if (original) setDrafts(prev => prev.map(d => d.id === item.id ? { ...original } : d));
                              setDirty(prev => { const s = new Set(prev); s.delete(item.id); return s; });
                            }}>{t("cancel")}</Button>
                          </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
        {/* Confirm all dialog */}
        <Dialog.Root open={openConfirmAll} onOpenChange={(v) => setOpenConfirmAll(v)}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
            <Dialog.Content className="fixed left-1/2 top-1/2 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[rgba(110,211,225,0.2)] bg-[rgba(6,20,27,0.9)] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.55)]">
              <Dialog.Title className="text-lg font-semibold text-white">{t("confirmResetTitle")}</Dialog.Title>
              <Dialog.Description className="mt-2 text-sm text-[rgba(255,255,255,0.7)]">
                {t("confirmResetDesc")}
              </Dialog.Description>
              <div className="mt-5 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setOpenConfirmAll(false)}>{t("confirmCancel")}</Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setDrafts(items.map(i => ({ ...i })));
                    setDirty(new Set());
                    setOpenConfirmAll(false);
                  }}
                >
                  {t("confirmDiscard")}
                </Button>
              </div>
              <Dialog.Close asChild>
                <button aria-label={t("confirmCancel")} className="absolute right-3 top-3 h-6 w-6 rounded-full text-[rgba(255,255,255,0.6)] hover:text-white">×</button>
              </Dialog.Close>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </>
    );
}

function DebouncedSave({ onSave, label, busyLabel }: { onSave: () => Promise<void> | void; label: string; busyLabel: string }) {
  const [busy, setBusy] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const click = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      setBusy(true);
      try {
        await onSave();
      } finally {
        setBusy(false);
      }
    }, 300);
  };
  return (
    <Button onClick={click} disabled={busy} className="bg-[color:var(--color-turkish-blue-500)] text-black">
      {busy ? busyLabel : label}
    </Button>
  );
}
