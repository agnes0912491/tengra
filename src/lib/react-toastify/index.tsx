"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

type ToastTheme = "dark" | "light";

type ToastType = "default" | "success" | "error" | "info";

type ToastOptions = {
  type?: ToastType;
  id?: number;
  autoClose?: number;
};

type ToastRecord = {
  id: number;
  message: string;
  type: ToastType;
  autoClose?: number;
};

type ToastHandler = {
  (message: string, options?: ToastOptions): number;
  success: (message: string, options?: ToastOptions) => number;
  error: (message: string, options?: ToastOptions) => number;
  info: (message: string, options?: ToastOptions) => number;
  dismiss: (id?: number) => void;
};

type ToastListener = (toast: ToastRecord) => void;
type DismissListener = (id: number | null) => void;

type ToastPosition =
  | "top-left"
  | "top-right"
  | "top-center"
  | "bottom-left"
  | "bottom-right"
  | "bottom-center";

type ToastContainerProps = {
  position?: ToastPosition;
  autoClose?: number;
  theme?: ToastTheme;
};

const addListeners = new Set<ToastListener>();
const dismissListeners = new Set<DismissListener>();

let toastIdCounter = 0;

function emitToast(toast: ToastRecord) {
  addListeners.forEach((listener) => listener(toast));
}

function emitDismiss(id: number | null) {
  dismissListeners.forEach((listener) => listener(id));
}

const baseToast: ToastHandler = ((message: string, options: ToastOptions = {}) => {
  const id = options.id ?? ++toastIdCounter;

  emitToast({
    id,
    message,
    type: options.type ?? "default",
    autoClose: options.autoClose,
  });

  return id;
}) as ToastHandler;

baseToast.success = (message: string, options?: ToastOptions) =>
  baseToast(message, { ...options, type: "success" });

baseToast.error = (message: string, options?: ToastOptions) =>
  baseToast(message, { ...options, type: "error" });

baseToast.info = (message: string, options?: ToastOptions) =>
  baseToast(message, { ...options, type: "info" });

baseToast.dismiss = (id?: number) => {
  emitDismiss(id ?? null);
};

export const toast = baseToast;

const positionClasses: Record<ToastPosition, string> = {
  "top-left": "top-4 left-4",
  "top-right": "top-4 right-4",
  "top-center": "top-4 left-1/2 -translate-x-1/2",
  "bottom-left": "bottom-4 left-4",
  "bottom-right": "bottom-4 right-4",
  "bottom-center": "bottom-4 left-1/2 -translate-x-1/2",
};

const themeClasses: Record<ToastTheme, string> = {
  dark: "bg-[rgba(5,12,16,0.95)] border-[rgba(0,167,197,0.45)] text-[rgba(255,255,255,0.92)]",
  light: "bg-white border-[rgba(15,23,42,0.1)] text-slate-900",
};

export function ToastContainer({
  position = "bottom-right",
  autoClose = 3500,
  theme = "dark",
}: ToastContainerProps) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const timers = useRef(new Map<number, number>());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toastItem) => toastItem.id !== id));

    const existingTimer = timers.current.get(id);

    if (existingTimer) {
      window.clearTimeout(existingTimer);
      timers.current.delete(id);
    }
  }, []);

  const clearAllToasts = useCallback(() => {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current.clear();
    setToasts([]);
  }, []);

  useEffect(() => {
    const handleAdd: ToastListener = (toastItem) => {
      setToasts((prev) => [...prev, toastItem]);

      const delay = toastItem.autoClose ?? autoClose;
      const timer = window.setTimeout(() => removeToast(toastItem.id), delay);
      timers.current.set(toastItem.id, timer);
    };

    const handleDismiss: DismissListener = (id) => {
      if (id === null) {
        clearAllToasts();
        return;
      }

      removeToast(id);
    };

    addListeners.add(handleAdd);
    dismissListeners.add(handleDismiss);

    return () => {
      addListeners.delete(handleAdd);
      dismissListeners.delete(handleDismiss);

      clearAllToasts();
    };
  }, [autoClose, clearAllToasts, removeToast]);

  const containerClass = useMemo(
    () =>
      cn(
        "pointer-events-none fixed z-[9999] flex w-full max-w-xs flex-col gap-3",
        positionClasses[position]
      ),
    [position]
  );

  if (!mounted) {
    return null;
  }

  return createPortal(
    <div className={containerClass}>
      {toasts.map((toastItem) => (
        <div
          key={toastItem.id}
          className={cn(
            "pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg transition-all",
            themeClasses[theme],
            toastItem.type === "success" &&
              "border-[rgba(45,212,191,0.6)] text-emerald-200",
            toastItem.type === "error" &&
              "border-[rgba(248,113,113,0.5)] text-rose-200",
            toastItem.type === "info" &&
              "border-[rgba(96,165,250,0.5)] text-blue-200"
          )}
        >
          <span className="text-sm leading-5">{toastItem.message}</span>
          <button
            type="button"
            onClick={() => removeToast(toastItem.id)}
            className="ml-auto text-xs uppercase tracking-wide text-[rgba(255,255,255,0.6)] transition hover:text-white"
          >
            Kapat
          </button>
        </div>
      ))}
    </div>,
    document.body
  );
}

export type { ToastOptions, ToastPosition, ToastTheme, ToastContainerProps };
