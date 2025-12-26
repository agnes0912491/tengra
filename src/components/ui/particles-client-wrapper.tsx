"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// Dynamically load the particles background on the client only.
// Delayed loading to reduce Total Blocking Time (TBT).
// Disabled on mobile for better performance.
const ParticlesBackground = dynamic(() => import("./particles-background"), {
  ssr: false,
  loading: () => null,
});

export default function ParticlesClientWrapper() {
  const [shouldLoad, setShouldLoad] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if device is mobile
    const checkMobile = () => window.innerWidth < 1024;
    setIsMobile(checkMobile());

    // Don't load particles on mobile devices
    if (checkMobile()) return;

    // Delay particles loading by 4 seconds to prioritize critical content
    const timer = setTimeout(() => setShouldLoad(true), 4000);
    return () => clearTimeout(timer);
  }, []);

  // Don't render particles on mobile
  if (isMobile || !shouldLoad) return null;
  return <ParticlesBackground />;
}
