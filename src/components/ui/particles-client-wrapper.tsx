"use client";

import dynamic from "next/dynamic";

// Dynamically load the particles background on the client only. This file
// is a small client component so we can safely use `ssr: false` here.
const ParticlesBackground = dynamic(() => import("./particles-background"), {
  ssr: false,
});

export default function ParticlesClientWrapper() {
  return <ParticlesBackground />;
}
