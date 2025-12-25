"use client";

import { useEffect, useState } from "react";
// import { Input } from "@/components/ui/input";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@tengra/language";

const STORAGE_KEY = "tengra:design-settings";

type DesignSettings = {
    primary: string;
    background: string;
    text: string;
    fontFamily: string;
    radius: number;
};

const DEFAULTS: DesignSettings = {
    primary: "#00a7c5",
    background: "#030b10",
    text: "#dff1f6",
    fontFamily: "Inter, system-ui, sans-serif",
    radius: 12,
};

export default function DesignControls() {
    const { t } = useTranslation("AdminDesign");
    const [settings, setSettings] = useState<DesignSettings>(DEFAULTS);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) setSettings({ ...DEFAULTS, ...JSON.parse(raw) });
        } catch { }
    }, []);

    useEffect(() => {
        // Apply to document as CSS variables
        const root = document.documentElement;
        root.style.setProperty("--color-turkish-blue-500", settings.primary);
        root.style.setProperty("--background", settings.background);
        root.style.setProperty("--text", settings.text);
        root.style.setProperty("--radius", `${settings.radius}px`);
        root.style.setProperty("--font-family", settings.fontFamily);
    }, [settings]);

    const handleSave = async () => {
        setSaving(true);
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-4 rounded-2xl border border-[rgba(110,211,225,0.2)] bg-[rgba(6,20,27,0.55)]/80 p-6">
                <h3 className="text-sm font-semibold text-[color:var(--color-turkish-blue-200)] uppercase tracking-[0.25em]">{t("colors.title")}</h3>
                <div className="grid grid-cols-[120px_1fr] items-center gap-3">
                    <label className="text-sm text-[rgba(255,255,255,0.8)]">{t("colors.primary")}</label>
                    <div className="flex items-center gap-3">
                        <input type="color" value={settings.primary} onChange={(e) => setSettings((s) => ({ ...s, primary: e.target.value }))} />
                        <Input value={settings.primary} onChange={(e) => setSettings((s) => ({ ...s, primary: e.currentTarget.value }))} />
                    </div>
                    <label className="text-sm text-[rgba(255,255,255,0.8)]">{t("colors.background")}</label>
                    <div className="flex items-center gap-3">
                        <input type="color" value={settings.background} onChange={(e) => setSettings((s) => ({ ...s, background: e.target.value }))} />
                        <Input value={settings.background} onChange={(e) => setSettings((s) => ({ ...s, background: e.currentTarget.value }))} />
                    </div>
                    <label className="text-sm text-[rgba(255,255,255,0.8)]">{t("colors.text")}</label>
                    <div className="flex items-center gap-3">
                        <input type="color" value={settings.text} onChange={(e) => setSettings((s) => ({ ...s, text: e.target.value }))} />
                        <Input value={settings.text} onChange={(e) => setSettings((s) => ({ ...s, text: e.currentTarget.value }))} />
                    </div>
                </div>
            </div>

            <div className="space-y-4 rounded-2xl border border-[rgba(110,211,225,0.2)] bg-[rgba(6,20,27,0.55)]/80 p-6">
                <h3 className="text-sm font-semibold text-[color:var(--color-turkish-blue-200)] uppercase tracking-[0.25em]">{t("typography.title")}</h3>
                <div className="space-y-3">
                    <div className="grid grid-cols-[120px_1fr] items-center gap-3">
                        <label className="text-sm text-[rgba(255,255,255,0.8)]">{t("typography.fontFamily")}</label>
                        <Input value={settings.fontFamily} onChange={(e) => setSettings((s) => ({ ...s, fontFamily: e.currentTarget.value }))} />
                    </div>
                    <div className="grid grid-cols-[120px_1fr] items-center gap-3">
                        <label className="text-sm text-[rgba(255,255,255,0.8)]">{t("typography.radius")}</label>
                        <input
                            type="range"
                            min={0}
                            max={24}
                            value={settings.radius}
                            onChange={(e) => setSettings((s) => ({ ...s, radius: Number(e.target.value) }))}
                        />
                    </div>
                </div>
                <div className="pt-2">
                    <Button onClick={handleSave} disabled={saving} className="bg-[color:var(--color-turkish-blue-500)] text-black hover:bg-[color:var(--color-turkish-blue-400)]">
                        {saving ? t("actions.saving") : t("actions.save")}
                    </Button>
                </div>
            </div>

            <div className="col-span-full rounded-2xl border border-[rgba(110,211,225,0.2)] bg-[rgba(6,20,27,0.55)]/80 p-6">
                <h3 className="text-sm font-semibold text-[color:var(--color-turkish-blue-200)] uppercase tracking-[0.25em] mb-3">{t("preview.title")}</h3>
                <div className="rounded-xl border p-6" style={{
                    background: settings.background,
                    color: settings.text,
                    borderColor: settings.primary + "55",
                    borderRadius: settings.radius,
                    fontFamily: settings.fontFamily,
                }}>
                    <h4 style={{ color: settings.primary }} className="text-xl mb-2">{t("preview.heading")}</h4>
                    <p className="text-sm opacity-80">{t("preview.description")}</p>
                    <div className="mt-4 flex gap-3">
                        <button className="rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em]" style={{ background: settings.primary, color: "#000" }}>{t("preview.primary")}</button>
                        <button className="rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] border" style={{ borderColor: settings.primary, color: settings.primary }}>{t("preview.secondary")}</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
