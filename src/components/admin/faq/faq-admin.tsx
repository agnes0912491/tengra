"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import Cookies from "js-cookie";
import { ADMIN_SESSION_COOKIE_CANDIDATES } from "@/lib/auth";
import { createFaq, deleteFaq, getFaqs, updateFaq, type FaqItem } from "@/lib/db";
import { routing } from "@/i18n/routing";

const SUPPORTED_LOCALES = routing.locales;

export default function FaqAdmin() {
    const [locale, setLocale] = useState<(typeof SUPPORTED_LOCALES)[number]>("tr");
    const [items, setItems] = useState<FaqItem[]>([]);
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
            setItems(list);
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
                question: "Yeni soru",
                answer: "Yeni cevap",
                order: items.length,
                isActive: true,
            },
            token
        );
        if (created) setItems((prev) => [...prev, created]);
    };

    const saveItem = async (id: string, patch: Partial<FaqItem>) => {
        if (!token) return;
        const updated = await updateFaq(id, patch, token);
        if (updated) setItems((prev) => prev.map((i) => (i.id === id ? updated : i)));
    };

    const removeItem = async (id: string) => {
        if (!token) return;
        const ok = await deleteFaq(id, token);
        if (ok) setItems((prev) => prev.filter((i) => i.id !== id));
    };

    return (
        <div className="rounded-3xl border border-[rgba(110,211,225,0.16)] bg-[rgba(6,20,27,0.6)]/80 p-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className="text-sm text-[rgba(255,255,255,0.75)]">Dil</span>
                    <select
                        value={locale}
                        onChange={(e) => setLocale(e.target.value as (typeof SUPPORTED_LOCALES)[number])}
                        className="rounded-lg border border-[rgba(110,211,225,0.35)] bg-[rgba(4,18,24,0.85)] px-3 py-1 text-sm text-white"
                    >
                        {(SUPPORTED_LOCALES as readonly string[]).map((loc) => (
                            <option key={loc} value={loc}>
                                {loc}
                            </option>
                        ))}
                    </select>
                </div>
                <Button onClick={addNew} className="bg-[color:var(--color-turkish-blue-500)] text-black">Yeni SSS</Button>
            </div>

            {loading && <p className="mt-4 text-sm text-[rgba(255,255,255,0.7)]">Yükleniyor…</p>}
            {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

            <div className="mt-4 space-y-3">
                {items.length === 0 && !loading && (
                    <div className="rounded-xl border border-dashed border-[rgba(110,211,225,0.25)] bg-[rgba(8,28,38,0.5)] p-8 text-center text-sm text-[rgba(255,255,255,0.7)]">
                        Kayıt bulunamadı.
                    </div>
                )}

                {items.map((item) => (
                    <div
                        key={item.id}
                        className="rounded-xl border border-[rgba(110,211,225,0.25)] bg-[rgba(8,28,38,0.5)] p-4"
                    >
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-[rgba(255,255,255,0.6)]">Sıra</span>
                                <input
                                    type="number"
                                    value={item.order}
                                    onChange={(e) => {
                                        const v = Number(e.target.value) || 0;
                                        setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, order: v } : i)));
                                    }}
                                    onBlur={() => saveItem(item.id, { order: item.order })}
                                    className="w-20 rounded-md border border-[rgba(110,211,225,0.25)] bg-[rgba(4,18,24,0.85)] px-2 py-1 text-xs text-white"
                                />
                            </div>

                            <div className="flex items-center gap-3">
                                <label className="flex items-center gap-2 text-xs text-[rgba(255,255,255,0.75)]">
                                    <input
                                        type="checkbox"
                                        checked={item.isActive}
                                        onChange={(e) => {
                                            const v = e.target.checked;
                                            setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, isActive: v } : i)));
                                            void saveItem(item.id, { isActive: v });
                                        }}
                                    />
                                    Aktif
                                </label>
                                <Button variant="outline" onClick={() => removeItem(item.id)} className="border-[rgba(110,211,225,0.35)]">
                                    Sil
                                </Button>
                            </div>
                        </div>

                        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                            <div className="relative">
                                <Input
                                    value={item.question}
                                    onChange={(e) => setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, question: e.target.value } : i)))}
                                    onBlur={() => saveItem(item.id, { question: item.question })}
                                    className="peer border-[rgba(0,167,197,0.3)] bg-[rgba(3,12,18,0.75)] text-white placeholder-transparent"
                                    placeholder="Soru"
                                />
                                <label className={cn("pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[rgba(255,255,255,0.65)] transition-all", "peer-focus:top-0 peer-focus:text-xs peer-focus:text-[color:var(--color-turkish-blue-300)]", "top-0 text-xs")}>Soru</label>
                            </div>
                            <div className="relative">
                                <Input
                                    value={item.answer}
                                    onChange={(e) => setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, answer: e.target.value } : i)))}
                                    onBlur={() => saveItem(item.id, { answer: item.answer })}
                                    className="peer border-[rgba(0,167,197,0.3)] bg-[rgba(3,12,18,0.75)] text-white placeholder-transparent"
                                    placeholder="Cevap"
                                />
                                <label className={cn("pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[rgba(255,255,255,0.65)] transition-all", "peer-focus:top-0 peer-focus:text-xs peer-focus:text-[color:var(--color-turkish-blue-300)]", "top-0 text-xs")}>Cevap</label>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

