"use client";

import { useEffect, useState } from "react";

type PublishEventDetail = {
    type: "blog" | "project" | string;
    id?: string | number;
    title?: string;
};

export default function PublishListener() {
    const [payload, setPayload] = useState<PublishEventDetail | null>(null);

    useEffect(() => {
        const handler = (ev: Event) => {
            try {
                const ce = ev as CustomEvent<PublishEventDetail>;
                setPayload(ce.detail || null);
            } catch {
                setPayload(null);
            }
        };

        window.addEventListener("content:published", handler as EventListener);
        return () => window.removeEventListener("content:published", handler as EventListener);
    }, []);

    if (!payload) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/60" onClick={() => setPayload(null)} />
            <div className="relative z-10 max-w-md rounded-2xl bg-[rgba(6,20,27,0.95)] p-6 text-white">
                <h3 className="text-lg font-semibold">Yeni içerik yayınlandı</h3>
                <p className="mt-2 text-sm text-[rgba(255,255,255,0.85)]">{payload.title ?? "(başlıksız)"}</p>
                <p className="mt-3 text-xs text-[rgba(255,255,255,0.6)]">Tür: {payload.type}</p>
                <div className="mt-4 flex justify-end">
                    <button
                        onClick={() => setPayload(null)}
                        className="rounded border px-3 py-1 text-sm"
                    >
                        Kapat
                    </button>
                </div>
            </div>
        </div>
    );
}
