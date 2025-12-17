"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * Lightweight client tracker to record per-page views.
 * Uses server-side API route for IP-based geolocation.
 * - Fires on initial mount and whenever the path changes
 * - Sends pathname and userAgent
 * - Server extracts visitor IP from headers
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

        // Fire and forget - use server-side API route for IP forwarding
        fetch("/api/analytics/track", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ path, ua }),
        }).catch(() => {
            // Silent fail for analytics
        });
    }, [pathname]);

    return null;
}

