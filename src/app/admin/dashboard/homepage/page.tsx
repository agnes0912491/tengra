import React from "react";
import HomepageEditor from "@/components/admin/homepage-editor";

async function fetchContent() {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/api/admin/homepage`, {
        cache: "no-store",
    });
    if (!res.ok) {
        return { targets: [], faqs: [] };
    }
    try {
        return await res.json();
    } catch {
        return { targets: [], faqs: [] };
    }
}

export default async function Page() {
    const content = await fetchContent();

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Homepage Editor</h1>
            <div className="bg-white dark:bg-slate-800 p-4 rounded shadow">
                <HomepageEditor initial={content} />
            </div>
        </div>
    );
}
