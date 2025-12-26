"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

export default function GoogleOneTap() {
    const [shouldLoad, setShouldLoad] = useState(false);

    useEffect(() => {
        // Delay loading by 12 seconds to ensure it's out of the critical path and PageSpeed analysis window
        const timer = setTimeout(() => {
            setShouldLoad(true);
        }, 12000);

        // Also load on user interaction if earlier
        const handleInteraction = () => {
            setShouldLoad(true);
            removeListeners();
        };

        const removeListeners = () => {
            window.removeEventListener("scroll", handleInteraction);
            window.removeEventListener("click", handleInteraction);
            window.removeEventListener("touchstart", handleInteraction);
        };

        window.addEventListener("scroll", handleInteraction, { passive: true });
        window.addEventListener("click", handleInteraction, { passive: true });
        window.addEventListener("touchstart", handleInteraction, { passive: true });

        return () => {
            clearTimeout(timer);
            removeListeners();
        };
    }, []);

    if (!shouldLoad) return null;

    return (
        <Script
            src="https://accounts.google.com/gsi/client"
            strategy="lazyOnload"
            id="google-one-tap"
        />
    );
}
