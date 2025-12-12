"use client";

import { useEffect } from "react";

export default function OfflinePage() {
  useEffect(() => {
    // Periodically check if we're back online
    const interval = setInterval(() => {
      if (navigator.onLine) {
        window.location.reload();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[rgb(6,20,27)] flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        {/* Offline Icon */}
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[rgba(0,167,197,0.1)] flex items-center justify-center">
          <svg
            className="w-12 h-12 text-[rgba(0,167,197,0.5)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M18.364 5.636a9 9 0 010 12.728m-3.536-3.536a4 4 0 010-5.656M12 12h.01M9.172 9.172a4 4 0 015.656 0M6.343 6.343a8 8 0 0111.314 0M3.515 3.515a12 12 0 0116.97 0"
            />
            <line x1="4" y1="4" x2="20" y2="20" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
          </svg>
        </div>

        {/* Message */}
        <h1 className="text-2xl font-bold text-white mb-3">
          Çevrimdışısınız
        </h1>
        <p className="text-[rgba(255,255,255,0.5)] mb-6">
          İnternet bağlantınız yok gibi görünüyor. Lütfen bağlantınızı kontrol edin ve tekrar deneyin.
        </p>

        {/* Retry Button */}
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[rgba(0,167,197,0.2)] text-[rgba(0,167,197,1)] font-medium hover:bg-[rgba(0,167,197,0.3)] transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Tekrar Dene
        </button>

        {/* Status Info */}
        <div className="mt-8 p-4 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)]">
          <p className="text-sm text-[rgba(255,255,255,0.4)]">
            Bağlantınız geri geldiğinde sayfa otomatik olarak yenilenecektir.
          </p>
        </div>

        {/* Cached Pages Info */}
        <div className="mt-4 text-sm text-[rgba(255,255,255,0.3)]">
          <p>
            Bazı sayfalar çevrimdışı kullanım için önbelleğe alınmış olabilir.
          </p>
        </div>
      </div>
    </div>
  );
}
