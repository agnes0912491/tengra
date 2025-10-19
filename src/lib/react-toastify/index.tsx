"use client";

import {
  useCallback,
  useEffect,
  useMemo, 
  useState,
  type ReactNode,
} from "react";
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

type ToastContentProps = {
  type?: ToastType;
};

type CloseButtonProps = {
  closeToast?: () => void;
};

type ToastContainerProps = {
  position?: ToastPosition;
  autoClose?: number;
  theme?: ToastTheme;
  className?: string;
  toastClassName?:
    | string
    | ((opts: { type?: ToastType | undefined }) => string);
  bodyClassName?: string;
  progressClassName?: string;
  newestOnTop?: boolean;
  closeButton?:
    | ReactNode
    | false
    | ((props: CloseButtonProps) => ReactNode);
  icon?: ReactNode | false;
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
  className,
  toastClassName,
  bodyClassName,
  progressClassName,
  closeButton,
  icon,
}: ToastContainerProps) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const [mounted] = useState(() => typeof window !== "undefined");

const removeToast = useCallback((id: number) => {
  // render'da sadece state değiştir
  setToasts((prev) => prev.filter((t) => t.id !== id));
  
	const timer = toastTimers.get(id);
    if (timer) {
      clearTimeout(timer);
      toastTimers.delete(id);
    }
}, []);

  const clearAllToasts = useCallback(() => {
    toastTimers.forEach((t) => clearTimeout(t));
    toastTimers.clear();
    setToasts([]);
  }, []);

  useEffect(() => {
    const handleAdd: ToastListener = (toastItem) => {
      setToasts((prev) => [...prev, toastItem]);

      const delay = toastItem.autoClose ?? autoClose;
      const timer = window.setTimeout(() => removeToast(toastItem.id), delay);
      timersRef.current.set(toastItem.id, timer);
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

  const orderedToasts = newestOnTop ? [...toasts].reverse() : toasts;

  return createPortal(
    <div className={cn(containerClass, className)}>
      {orderedToasts.map((toastItem) => {
        const resolvedToastClass =
          typeof toastClassName === "function"
            ? toastClassName({ type: toastItem.type })
            : toastClassName;

        const resolvedClose =
          typeof closeButton === "function"
            ? closeButton({ closeToast: () => removeToast(toastItem.id) })
            : closeButton;

        return (
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
                "border-[rgba(96,165,250,0.5)] text-blue-200",
              resolvedToastClass
            )}
          >
            {icon !== false && icon}
            <span className={cn("text-sm leading-5", bodyClassName)}>
              {toastItem.message}
            </span>
            {resolvedClose === false ? null : resolvedClose ?? (
              <button
                type="button"
                onClick={() => removeToast(toastItem.id)}
                className="ml-auto text-xs uppercase tracking-wide text-[rgba(255,255,255,0.6)] transition hover:text-white"
              >
                Kapat
              </button>
            )}
          </div>
        );
      })}
      {progressClassName ? (
        <div className={progressClassName} aria-hidden />
      ) : null}
    </div>,
    document.body
  );
}

export type {
  CloseButtonProps,
  ToastContentProps,
  ToastContainerProps,
  ToastOptions,
  ToastPosition,
  ToastTheme,
};
