"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function usePWA() {
  const getInitialStandalone = () =>
    typeof window !== "undefined" && window.matchMedia("(display-mode: standalone)").matches;
  const getInitialOnline = () => (typeof navigator !== "undefined" ? navigator.onLine : true);

  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(() => getInitialStandalone());
  const [isOnline, setIsOnline] = useState(() => getInitialOnline());
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Listen for app installed
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("[PWA] Service worker registered:", registration.scope);
        })
        .catch((error) => {
          console.error("[PWA] Service worker registration failed:", error);
        });
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const install = async () => {
    if (!deferredPrompt) return false;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setIsInstalled(true);
      setIsInstallable(false);
    }

    setDeferredPrompt(null);
    return outcome === "accepted";
  };

  return {
    isInstallable,
    isInstalled,
    isOnline,
    install,
  };
}

// Component for install prompt
export function InstallPWAPrompt() {
  const { isInstallable, isInstalled, install } = usePWA();
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === "undefined") return false;
    const dismissedAt = localStorage.getItem("pwa-prompt-dismissed");
    if (!dismissedAt) return false;
    const daysSinceDismissed = (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60 * 24);
    return daysSinceDismissed < 7;
  });

  if (!isInstallable || isInstalled || dismissed) return null;

  const handleDismiss = () => {
    localStorage.setItem("pwa-prompt-dismissed", Date.now().toString());
    setDismissed(true);
  };

  const handleInstall = async () => {
    await install();
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50 animate-slide-up">
      <div className="rounded-xl border border-[rgba(110,211,225,0.2)] bg-[rgba(6,20,27,0.95)] backdrop-blur-xl p-4 shadow-xl">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-[rgba(0,167,197,0.3)] to-[rgba(110,211,225,0.1)] flex items-center justify-center">
            <svg className="w-6 h-6 text-[rgba(0,167,197,1)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-white">Tengra Uygulamasını Yükle</h3>
            <p className="text-sm text-[rgba(255,255,255,0.5)] mt-1">
              Daha hızlı erişim ve çevrimdışı kullanım için yükleyin.
            </p>
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleInstall}
                className="px-3 py-1.5 text-sm font-medium rounded-lg bg-[rgba(0,167,197,0.2)] text-[rgba(0,167,197,1)] hover:bg-[rgba(0,167,197,0.3)] transition-colors"
              >
                Yükle
              </button>
              <button
                onClick={handleDismiss}
                className="px-3 py-1.5 text-sm font-medium rounded-lg text-[rgba(255,255,255,0.5)] hover:text-white transition-colors"
              >
                Daha sonra
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Offline indicator component
export function OfflineIndicator() {
  const { isOnline } = usePWA();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500/90 text-black text-center py-2 text-sm font-medium">
      <span className="inline-flex items-center gap-2">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m-3.536-3.536a4 4 0 010-5.656M12 12h.01" />
        </svg>
        Çevrimdışı moddasınız
      </span>
    </div>
  );
}
