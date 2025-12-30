"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

export default function GoogleOneTap() {
    const [shouldLoad, setShouldLoad] = useState(false);

    useEffect(() => {
        setShouldLoad(true);
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
