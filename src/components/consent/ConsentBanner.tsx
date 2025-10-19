"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

// Minimal Consent Mode v2 implementation for Google services (Adsense/Analytics)
// - Shows a small banner for EEA/UK/CH users (basic detection with Accept-Language; integrate GeoIP if needed)
// - Stores consent in a cookie `consent_mode` = "granted" | "denied"
// - Initializes gtag consent before loading any tags

type ConsentState = "unknown" | "granted" | "denied";

function getConsent(): ConsentState {
  if (typeof document === "undefined") return "unknown";
  const m = document.cookie.match(/(?:^|; )consent_mode=([^;]+)/);
  return (m ? decodeURIComponent(m[1]) : "unknown") as ConsentState;
}

function setConsent(value: ConsentState) {
  const maxAge = 60 * 60 * 24 * 180; // 180 days
  document.cookie = `consent_mode=${encodeURIComponent(
    value
  )}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
}

function inEEA(header: string | null): boolean {
  // Heuristic: if accepted languages include EU locales; for production,
  // replace with server-side geo or a CMP that provides region detection.
  if (!header) return false;
  const lower = header.toLowerCase();
  return [
    "de",
    "fr",
    "es",
    "it",
    "pl",
    "nl",
    "sv",
    "da",
    "fi",
    "pt",
    "cs",
    "sk",
    "hu",
    "ro",
    "bg",
    "hr",
    "sl",
    "et",
    "lv",
    "lt",
    "el",
    "mt",
    "ga",
    "en-gb",
  ].some((p) => lower.includes(p));
}

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

type ConsentUpdate = {
  ad_storage: "granted" | "denied";
  ad_personalization: "granted" | "denied";
  ad_user_data: "granted" | "denied";
  analytics_storage: "granted" | "denied";
  wait_for_update?: number;
};

function ensureGtag(consent: ConsentState) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  function gtag(...args: unknown[]) {
    window.dataLayer!.push(args);
  }
  window.gtag = window.gtag || gtag;

  // Consent defaults before tag load
  const defaults: ConsentUpdate = {
    ad_storage: consent === "granted" ? "granted" : "denied",
    ad_personalization: consent === "granted" ? "granted" : "denied",
    ad_user_data: consent === "granted" ? "granted" : "denied",
    analytics_storage: consent === "granted" ? "granted" : "denied",
    wait_for_update: 500,
  };
  window.gtag("consent", "default", defaults);
}

const GFC_ID = process.env.NEXT_PUBLIC_GFC_ID;

export default function ConsentBanner() {
  const t = useTranslations("ConsentBanner");
  const [consent, setConsentState] = useState<ConsentState>("unknown");
  const [shouldShow, setShouldShow] = useState(false);
  const skipBanner = Boolean(GFC_ID && GFC_ID.length > 0);

  // If Google Funding Choices (Google CMP) is configured, do not show custom banner here.
  if (GFC_ID && GFC_ID.length > 0) return null;

  useEffect(() => {
    if (skipBanner) return;

    const current = getConsent();
    setConsentState(current);

    if (current === "unknown") {
      const languages =
        typeof navigator === "undefined"
          ? null
          : [navigator.language, ...(navigator.languages ?? [])]
              .filter(Boolean)
              .join(",");
      setShouldShow(inEEA(languages));
      ensureGtag("denied");
    } else {
      ensureGtag(current);
    }
  }, [skipBanner]);

  const onAllowAll = () => {
    setConsent("granted");
    setConsentState("granted");
    setShouldShow(false);
    if (typeof window !== "undefined" && window.gtag) {
      const update: ConsentUpdate = {
        ad_storage: "granted",
        ad_personalization: "granted",
        ad_user_data: "granted",
        analytics_storage: "granted",
      };
      window.gtag("consent", "update", update);
    }
  };

  const onDenyAll = () => {
    setConsent("denied");
    setConsentState("denied");
    setShouldShow(false);
    if (typeof window !== "undefined" && window.gtag) {
      const update: ConsentUpdate = {
        ad_storage: "denied",
        ad_personalization: "denied",
        ad_user_data: "denied",
        analytics_storage: "denied",
      };
      window.gtag("consent", "update", update);
    }
  };

  if (skipBanner || !shouldShow || consent !== "unknown") return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-between gap-4 bg-[rgba(0,0,0,0.85)] px-4 py-3 text-sm text-white shadow-lg">
      <p className="max-w-3xl text-[13px] leading-5 opacity-90">
        {t("description")}
      </p>
      <div className="flex shrink-0 gap-2">
        <button
          onClick={onDenyAll}
          className="rounded border border-white/30 bg-transparent px-3 py-2 text-[13px] hover:bg-white/10"
        >
          {t("deny")}
        </button>
        <button
          onClick={onAllowAll}
          className="rounded bg-[color:var(--color-turkish-blue-400)] px-3 py-2 text-[13px] text-black hover:brightness-110"
        >
          {t("allow")}
        </button>
      </div>
    </div>
  );
}
