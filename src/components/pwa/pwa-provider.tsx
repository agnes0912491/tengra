"use client";

import { InstallPWAPrompt, OfflineIndicator } from "@/hooks/use-pwa";

export default function PWAProvider() {
  return (
    <>
      <OfflineIndicator />
      <InstallPWAPrompt />
    </>
  );
}
