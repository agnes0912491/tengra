"use client";

import { useState, useEffect, useCallback } from "react";

interface PushNotificationState {
  isSupported: boolean;
  isSubscribed: boolean;
  permission: NotificationPermission;
  isLoading: boolean;
  error: string | null;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api";

export function usePushNotifications() {
  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    isSubscribed: false,
    permission: "default",
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    checkSupport();
  }, []);

  const checkSupport = async () => {
    try {
      const isSupported = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;

      if (!isSupported) {
        setState((prev) => ({
          ...prev,
          isSupported: false,
          isLoading: false,
        }));
        return;
      }

      const permission = Notification.permission;
      let isSubscribed = false;

      // Check existing subscription
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      isSubscribed = !!subscription;

      setState({
        isSupported: true,
        isSubscribed,
        permission,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error("[Push] Check support error:", error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Push bildirim desteği kontrol edilemedi",
      }));
    }
  };

  const subscribe = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // Request permission
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setState((prev) => ({
          ...prev,
          permission,
          isLoading: false,
          error: permission === "denied" ? "Bildirim izni reddedildi" : null,
        }));
        return false;
      }

      // Get VAPID public key from server
      const keyResponse = await fetch(`${API_BASE}/push/vapid-key`);
      if (!keyResponse.ok) {
        throw new Error("VAPID key alınamadı");
      }
      const { publicKey } = await keyResponse.json();

      // Subscribe to push
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      // Send subscription to server
      const token = localStorage.getItem("authToken");
      const saveResponse = await fetch(`${API_BASE}/push/subscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ subscription }),
      });

      if (!saveResponse.ok) {
        throw new Error("Subscription kaydedilemedi");
      }

      setState((prev) => ({
        ...prev,
        isSubscribed: true,
        permission: "granted",
        isLoading: false,
      }));

      return true;
    } catch (error: unknown) {
      console.error("[Push] Subscribe error:", error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Bildirim aboneliği başarısız",
      }));
      return false;
    }
  }, []);

  const unsubscribe = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        // Unsubscribe locally
        await subscription.unsubscribe();

        // Notify server
        const token = localStorage.getItem("authToken");
        await fetch(`${API_BASE}/push/unsubscribe`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });
      }

      setState((prev) => ({
        ...prev,
        isSubscribed: false,
        isLoading: false,
      }));

      return true;
    } catch (error: unknown) {
      console.error("[Push] Unsubscribe error:", error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Abonelik iptal edilemedi",
      }));
      return false;
    }
  }, []);

  const sendTestNotification = useCallback(async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${API_BASE}/push/test`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        throw new Error("Test bildirimi gönderilemedi");
      }

      return true;
    } catch (error) {
      console.error("[Push] Test notification error:", error);
      return false;
    }
  }, []);

  return {
    ...state,
    subscribe,
    unsubscribe,
    sendTestNotification,
    checkSupport,
  };
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Push notification settings component
export function PushNotificationSettings() {
  const {
    isSupported,
    isSubscribed,
    permission,
    isLoading,
    error,
    subscribe,
    unsubscribe,
    sendTestNotification,
  } = usePushNotifications();

  if (!isSupported) {
    return (
      <div className="p-4 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)]">
        <p className="text-sm text-[rgba(255,255,255,0.5)]">
          Tarayıcınız push bildirimleri desteklemiyor.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Status */}
      <div className="flex items-center justify-between p-4 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)]">
        <div className="flex items-center gap-3">
          <div
            className={`w-3 h-3 rounded-full ${
              isSubscribed
                ? "bg-green-500"
                : permission === "denied"
                ? "bg-red-500"
                : "bg-yellow-500"
            }`}
          />
          <div>
            <p className="font-medium text-white">Push Bildirimleri</p>
            <p className="text-sm text-[rgba(255,255,255,0.5)]">
              {isSubscribed
                ? "Aktif - Bildirimler alacaksınız"
                : permission === "denied"
                ? "Engellendi - Tarayıcı ayarlarından izin verin"
                : "Pasif - Bildirimleri açın"}
            </p>
          </div>
        </div>

        {permission !== "denied" && (
          <button
            onClick={isSubscribed ? unsubscribe : subscribe}
            disabled={isLoading}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              isSubscribed
                ? "bg-[rgba(255,255,255,0.05)] text-[rgba(255,255,255,0.7)] hover:bg-[rgba(255,255,255,0.1)]"
                : "bg-[rgba(0,167,197,0.2)] text-[rgba(0,167,197,1)] hover:bg-[rgba(0,167,197,0.3)]"
            } disabled:opacity-50`}
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                İşleniyor...
              </span>
            ) : isSubscribed ? (
              "Kapat"
            ) : (
              "Aç"
            )}
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Test Button */}
      {isSubscribed && (
        <button
          onClick={sendTestNotification}
          className="w-full px-4 py-2 rounded-lg bg-[rgba(255,255,255,0.05)] text-[rgba(255,255,255,0.7)] hover:bg-[rgba(255,255,255,0.1)] transition-colors text-sm"
        >
          Test Bildirimi Gönder
        </button>
      )}
    </div>
  );
}
