"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { resolveCdnUrl } from "@/lib/constants";

const HERO_LOGO_SRC = resolveCdnUrl("/uploads/tengra_without_text.png");

type TypingTextProps = {
  texts: string[];
};

function TypingText({ texts }: TypingTextProps) {
  const [index, setIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (texts.length === 0) {
      return;
    }

    const fullText = texts[index];
    const speed = isDeleting ? 120 : 180;
    const pause = 2500;
    let timeout: ReturnType<typeof setTimeout> | undefined;

    if (!isDeleting && displayed.length < fullText.length) {
      timeout = setTimeout(() => {
        setDisplayed(fullText.slice(0, displayed.length + 1));
      }, speed);
    } else if (isDeleting && displayed.length > 0) {
      timeout = setTimeout(() => {
        setDisplayed(fullText.slice(0, displayed.length - 1));
      }, speed / 1.4);
    } else if (!isDeleting && displayed.length === fullText.length) {
      timeout = setTimeout(() => {
        setIsDeleting(true);
      }, pause);
    } else if (isDeleting && displayed.length === 0) {
      timeout = setTimeout(() => {
        setIsDeleting(false);
        setIndex((prev) => (prev + 1) % texts.length);
      }, 240);
    }

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [displayed, index, isDeleting, texts]);

  return (
    <motion.h1
      key={`${index}-${texts[index] ?? ""}`}
      className="mt-6 text-4xl md:text-5xl tracking-[0.18em] font-display glow-text select-none tengra-text"
    >
      {displayed}
      <span className="border-r-2 border-[rgba(0,167,197,0.7)] ml-1 animate-cursor" />
    </motion.h1>
  );
}

export default function Hero() {
  const t = useTranslations("Hero");
  const texts = useMemo(() => [t("typingWordOne"), t("typingWordTwo")], [t]);

  return (
    <section
      id="hero"
      className="relative flex flex-col items-center justify-center min-h-[100vh] w-full overflow-hidden px-4"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] rounded-full bg-[radial-gradient(circle,rgba(0,167,197,0.12)_0%,transparent_70%)] blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.4, ease: "easeOut" }}
        className="relative z-10 flex w-full max-w-6xl flex-col items-center gap-12 md:flex-row md:items-center"
      >
        <div className="flex flex-1 flex-col items-start text-left">
          <motion.div
            animate={{
              opacity: [0.75, 1, 0.75],
              scale: [1, 1.02, 1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="inline-flex items-center gap-3 rounded-full border border-[rgba(0,167,197,0.35)] bg-[rgba(2,10,14,0.85)] px-4 py-2 text-[11px] uppercase tracking-[0.25em] text-[rgba(255,255,255,0.7)]"
          >
            <span className="size-1.5 rounded-full bg-[color:var(--color-turkish-blue-400)] shadow-[0_0_12px_rgba(0,167,197,0.6)]" />
            {t("eyebrow")}
          </motion.div>

          <h2 className="mt-6 text-xs md:text-sm tracking-[0.18em] font-light uppercase text-[color:var(--color-turkish-blue-400)]">
            {t("taglineLine1")}
            <br />
            {t("taglineLine2")}
          </h2>

          <TypingText key={texts.join("|")} texts={texts} />

          <p className="mt-6 max-w-xl text-sm md:text-base text-[color:var(--text-muted)] leading-relaxed">
            {t("intro")}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <motion.a
              href="#projects"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="btn btn-primary btn-ripple text-xs md:text-sm tracking-[0.18em] uppercase"
            >
              {t("primaryCta")}
            </motion.a>
            <motion.a
              href="#network"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="btn btn-ghost text-xs md:text-sm tracking-[0.18em] uppercase"
            >
              {t("secondaryCta")}
            </motion.a>
          </div>

          <div className="mt-8 flex flex-wrap gap-4 text-[11px] md:text-xs text-[rgba(255,255,255,0.65)]">
            <span className="badge-muted">{t("pillOne")}</span>
            <span className="badge-muted">{t("pillTwo")}</span>
            <span className="badge-muted">{t("pillThree")}</span>
          </div>

          <motion.a
            href="#goals"
            whileHover={{ y: -3 }}
            className="mt-10 inline-flex items-center gap-2 text-[11px] tracking-[0.25em] text-[rgba(255,255,255,0.6)] hover:text-[color:var(--color-turkish-blue-300)] transition-colors"
          >
            <span className="size-1.5 rounded-full bg-[rgba(0,167,197,0.6)] shadow-[0_0_12px_rgba(0,167,197,0.6)]" />
            {t("scrollCta")}
          </motion.a>
        </div>

        <motion.div
          className="mt-10 flex flex-1 items-center justify-center md:mt-0"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <div className="relative h-[260px] w-[260px] md:h-[320px] md:w-[320px] rounded-full border border-[rgba(0,167,197,0.25)] bg-[radial-gradient(circle,rgba(0,167,197,0.18)_0%,transparent_68%)] shadow-[0_30px_80px_rgba(0,0,0,0.85)]">
            <div className="aura rounded-full" />
            <motion.div
              animate={{
                opacity: [0.8, 1, 0.8],
                scale: [1, 1.04, 1],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative flex h-full w-full items-center justify-center"
            >
              <Image
                crossOrigin="anonymous"
                src={HERO_LOGO_SRC}
                alt={t("symbolAlt")}
                width={160}
                height={160}
                priority
                fetchPriority="high"
                className="drop-shadow-[0_0_30px_rgba(0,167,197,0.7)]"
              />
            </motion.div>
          </div>
        </motion.div>
      </motion.div>

      <div className="pointer-events-none absolute top-1/2 left-1/2 h-[900px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[rgba(0,167,197,0.09)]" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-[1200px] w-[1200px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[rgba(0,167,197,0.04)]" />
    </section>
  );
}
