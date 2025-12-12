"use client";

import type { CloseButtonProps } from "react-toastify";
import { ToastContainer } from "react-toastify";

import { cn } from "@/lib/utils";

const toastBaseClass =
  "pointer-events-auto relative flex min-w-[280px] max-w-md items-start gap-3 rounded-2xl border px-4 py-3 shadow-[0_0_25px_rgba(0,167,197,0.18)] backdrop-blur-xl";

const variantClasses: Record<"default" | "success" | "error" | "info", string> = {
  default:
    "border-[rgba(0,167,197,0.25)] bg-[rgba(5,18,24,0.92)] text-[rgba(223,241,246,0.92)]",
  success:
    "border-[rgba(45,212,191,0.45)] bg-[rgba(2,22,18,0.92)] text-[rgba(204,254,235,0.9)]",
  error:
    "border-[rgba(248,113,113,0.45)] bg-[rgba(28,6,9,0.92)] text-[rgba(255,216,222,0.9)]",
  info:
    "border-[rgba(96,165,250,0.45)] bg-[rgba(4,16,28,0.92)] text-[rgba(210,232,255,0.9)]",
};

function CloseButton({ closeToast }: CloseButtonProps) {
  return (
    <button
      type="button"
      onClick={closeToast}
      className="ml-auto inline-flex h-6 w-6 items-center justify-center rounded-full border border-[rgba(255,255,255,0.25)] text-xs text-[rgba(255,255,255,0.65)] transition hover:border-[rgba(0,167,197,0.6)] hover:text-white"
      aria-label="Dismiss notification"
    >
      ×
    </button>
  );
}

export default function GlobalToastContainer() {
  return (
    <ToastContainer
      position="bottom-right"
      newestOnTop
      closeButton={(props) => <CloseButton {...props} />}
      className="pointer-events-none !w-auto"
      toastClassName={({ type }) => cn(toastBaseClass, variantClasses[type ?? "default"])}
      bodyClassName="flex flex-col gap-1 text-sm leading-relaxed"
      progressClassName="!bg-[rgba(0,167,197,0.65)]"
      theme="dark"
      icon={false}
    />
  );
}
