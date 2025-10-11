"use client";
import { useEffect } from "react";

export default function GlowCursor() {
  useEffect(() => {
    const root = document.documentElement;
    const move = (e: MouseEvent) => {
      root.style.setProperty("--x", `${e.clientX}px`);
      root.style.setProperty("--y", `${e.clientY}px`);
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);
  return <div className="pointer-events-none fixed inset-0 z-40 glow-cursor" />;
}
