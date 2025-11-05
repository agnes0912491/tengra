"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import BlogEditModal from "./blog-edit-modal";
import { useRouter } from "next/navigation";

export default function BlogCreateCta() {
    const [open, setOpen] = useState(false);
    const router = useRouter();

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className={cn(
                    "relative inline-flex items-center justify-center rounded-full px-5 py-3 text-xs font-semibold uppercase tracking-[0.35em] text-black",
                    "bg-gradient-to-r from-[rgba(110,211,225,0.95)] via-[rgba(0,167,197,0.9)] to-[rgba(53,184,207,0.95)]",
                    "shadow-[0_18px_45px_rgba(0,167,197,0.4)] transition hover:shadow-[0_22px_55px_rgba(0,167,197,0.5)]"
                )}
            >
                Yeni Yazı
            </button>
            <BlogEditModal
                open={open}
                onClose={() => setOpen(false)}
                onCreated={() => {
                    setOpen(false);
                    router.refresh();
                }}
            />
        </>
    );
}
