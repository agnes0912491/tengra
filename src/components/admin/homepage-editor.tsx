"use client";

import React, { useState } from "react";
// keep simple textarea for JSON

type HomepageContent = {
    targets?: Array<{ title: string; body: string }>;
    faqs?: Array<{ q: string; a: string }>;
    [key: string]: unknown;
};

export default function HomepageEditor({ initial }: { initial: HomepageContent }) {
    const [text, setText] = useState(JSON.stringify(initial, null, 2));
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    async function handleSave(publish = false) {
        setError(null);
        setSuccess(null);
        let payload: HomepageContent;
        try {
            payload = JSON.parse(text);
        } catch (e) {
            setError("Invalid JSON: " + (e as Error).message);
            return;
        }

        setSaving(true);
        try {
            const res = await fetch("/api/admin/homepage", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const txt = await res.text();
            if (!res.ok) {
                setError(`Save failed: ${res.status} ${txt}`);
            } else {
                setSuccess("Saved successfully");
                // notify other admin UI that content was published
                try {
                    window.dispatchEvent(new CustomEvent("content:published", { detail: { payload } }));
                } catch {
                    // ignore dispatch errors (IE, etc.)
                }
                if (publish) {
                    // extra publish behaviour could be added
                }
            }
        } catch (e) {
            setError(String(e));
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="space-y-4">
            <div className="text-black">
                <label className="block text-sm font-medium">Homepage JSON</label>
                <textarea
                    rows={18}
                    value={text}
                    onChange={(e) => setText(e.currentTarget.value)}
                    className="mt-1 block w-full font-mono text-sm p-2 border rounded-md"
                />
            </div>

            {error && <div className="text-red-600">{error}</div>}
            {success && <div className="text-green-600">{success}</div>}

            <div className="flex gap-2">
                <button
                    className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
                    onClick={() => handleSave(false)}
                    disabled={saving}
                >
                    {saving ? "Saving..." : "Save"}
                </button>
                <button
                    className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
                    onClick={() => handleSave(true)}
                    disabled={saving}
                >
                    {saving ? "Publishing..." : "Save & Publish"}
                </button>
            </div>
        </div>
    );
}
