"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { incrementPageView } from "@/lib/db";

/**
 * Lightweight client tracker to record per-page views and a coarse user-agent label.
 * - Fires on initial mount and whenever the path changes
 * - Sends only pathname and userAgent (no query, no IP)
 */
export default function AnalyticsTracker() {
    const pathname = usePathname();
    const lastSentRef = useRef<string>("");

    useEffect(() => {
        if (typeof window === "undefined") return;
        const path = typeof pathname === "string" ? pathname : window.location?.pathname || "/";

        // De-duplicate rapid same-path effects
        if (lastSentRef.current === path) return;
        lastSentRef.current = path;

        // Avoid recounting the same path multiple times within one browser session
        try {
            const key = `pv:${path}`;
            if (window.sessionStorage.getItem(key)) {
                return;
            }
            window.sessionStorage.setItem(key, "1");
        } catch { }

        const ua = window.navigator?.userAgent || "";
        const lang = (window.navigator?.languages && window.navigator.languages[0]) || window.navigator?.language || "";
        const country = (lang.includes("-") ? lang.split("-").pop() : "") || "";
        // Fire and forget
        incrementPageView(path, ua, country?.toUpperCase());
    }, [pathname]);

    return null;
}
