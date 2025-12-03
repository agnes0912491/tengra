"use client";

import * as React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { resolveCdnUrl } from "@/lib/constants";
import { createContactSubscription } from "@/lib/db";
import { AgentBadge } from "./footer/agent-badge";

export default function Footer() {
  const tFooter = useTranslations("Footer");
  const tSub = useTranslations("FooterSubscribe");
  const [email, setEmail] = React.useState("");
  const [status, setStatus] = React.useState<"idle" | "success" | "error">("idle");
  const [submitting, setSubmitting] = React.useState(false);

  const Content = (
    <div className="mx-auto max-w-7xl px-4 py-6 text-sm text-[color:var(--text-muted)]">
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex items-center gap-3">
            <Image
              crossOrigin="anonymous"
              src={resolveCdnUrl("/uploads/tengra_without_text.png")}
              alt="Tengra"
              width={38}
              height={38}
              className="opacity-85"
            />
            <div className="flex flex-col">
              <span className="font-display text-sm tracking-[0.28em] text-[color:var(--color-turkish-blue-300)] soft-glow">
                TENGRA
              </span>
              <span className="text-[12px] text-[rgba(255,255,255,0.6)]">
                {tFooter("copyright", { year: new Date().getFullYear() })}
              </span>
            </div>
          </div>
          <div className="hidden md:block">
            <AgentBadge />
          </div>
        </div>

        <div className="w-full max-w-md self-stretch rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(4,14,20,0.7)] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.25)] backdrop-blur">
          <p className="text-sm text-[rgba(255,255,255,0.85)]">{tSub("title")}</p>
          <form
            className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center"
            onSubmit={async (e) => {
              e.preventDefault();
              setStatus("idle");
              setSubmitting(true);
              try {
                const created = await createContactSubscription(email.trim());
                if (created) {
                  setStatus("success");
                  setEmail("");
                } else {
                  setStatus("error");
                }
              } catch (err) {
                console.error("Failed to save subscription", err);
                setStatus("error");
              } finally {
                setSubmitting(false);
              }
            }}
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              placeholder={tSub("placeholder")}
              className="w-full rounded-lg border border-[rgba(255,255,255,0.12)] bg-[rgba(6,16,22,0.9)] px-3 py-2 text-white focus:border-[rgba(0,167,197,0.5)] focus:outline-none"
            />
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center rounded-lg bg-[color:var(--color-turkish-blue-500)] px-4 py-2 text-sm font-semibold text-[color:var(--color-base-black)] transition hover:bg-[color:var(--color-turkish-blue-400)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? "…" : tSub("button")}
            </button>
          </form>
          {status === "success" && <p className="text-xs text-emerald-400">{tSub("success")}</p>}
          {status === "error" && <p className="text-xs text-red-400">{tSub("error")}</p>}
        </div>
        <div className="md:hidden">
          <AgentBadge />
        </div>
      </div>
    </div>
  );

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="border-t border-[rgba(255,255,255,0.1)] bg-[rgba(6,20,26,0.65)] backdrop-blur-xl"
    >
      {Content}
    </motion.footer>
  );
}
