"use client";

import { useEffect } from "react";

type Props = {
  onDetect?: (enabled: boolean) => void;
};

/**
 * Lightweight adblock detector.
 * - Attempts to fetch a well-known ad script (blocked by most blockers).
 * - Falls back to a DOM "bait" element check.
 * - Writes `data-adblock="true|false"` on <html> for styling/telemetry.
 * - Dispatches a custom event: `tengra:adblock-detected` with `{ enabled }`.
 */
export default function AdblockDetector({ onDetect }: Props) {
  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") return;

    let cancelled = false;
    let bait: HTMLDivElement | null = null;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let controller: AbortController | null = null;

    const setResult = (enabled: boolean) => {
      if (cancelled) return;
      const root = document.documentElement;
      root.dataset.adblock = enabled ? "true" : "false";
      // Small global flag for other scripts without prop drilling
      (window as unknown as { __tengraAdblockEnabled?: boolean }).__tengraAdblockEnabled = enabled;
      window.dispatchEvent(new CustomEvent("tengra:adblock-detected", { detail: { enabled } }));
      onDetect?.(enabled);
    };

    const checkBaitHidden = () => {
      if (!bait) return false;
      const styles = window.getComputedStyle(bait);
      const hidden =
        styles.display === "none" ||
        styles.visibility === "hidden" ||
        bait.offsetParent === null ||
        bait.offsetHeight === 0 ||
        bait.offsetWidth === 0;
      return hidden;
    };

    const detect = async () => {
      try {
        // Known ad-related classes to trigger cosmetic filtering
        bait = document.createElement("div");
        bait.className = "ad adsbox ad-banner ad-unit ad-slot google-ads";
        bait.style.position = "absolute";
        bait.style.left = "-9999px";
        bait.style.width = "1px";
        bait.style.height = "1px";
        document.body.appendChild(bait);
      } catch {
        // If DOM is unavailable, bail out early
        return;
      }

      let blocked = false;
      try {
        controller = new AbortController();
        timeoutId = setTimeout(() => controller?.abort(), 1500);

        // Most blockers cancel this request entirely.
        await fetch("https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?adtest=on", {
          method: "GET",
          mode: "no-cors",
          cache: "no-store",
          signal: controller.signal,
        });
      } catch {
        blocked = true;
      } finally {
        if (timeoutId) clearTimeout(timeoutId);
      }

      if (!blocked) {
        try {
          blocked = checkBaitHidden();
        } catch {
          // If we fail to check, keep previous result
        }
      }

      setResult(blocked);
      try {
        bait.remove();
      } catch {}
    };

    detect();

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
      controller?.abort();
      try {
        bait?.remove();
      } catch {}
    };
  }, [onDetect]);

  return null;
}
