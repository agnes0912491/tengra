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
      className="mt-10 text-4xl md:text-5xl tracking-[0.35em] font-display neon-text select-none tengra-text"
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
      className="relative flex flex-col items-center justify-center min-h-[100vh] w-full text-center overflow-hidden"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] rounded-full bg-[radial-gradient(circle,rgba(0,167,197,0.12)_0%,transparent_70%)] blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.4, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center"
      >
        <motion.div
          animate={{
            opacity: [0.7, 1, 0.7],
            scale: [1, 1.03, 1],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Image
            src={HERO_LOGO_SRC}
            alt={t("symbolAlt")}
            width={140}
            height={140}
            priority
            className="drop-shadow-[0_0_30px_rgba(0,167,197,0.6)]"
          />
        </motion.div>

        <h2 className="mt-10 text-[color:var(--color-turkish-blue-400)] text-sm md:text-base tracking-[0.25em] font-light uppercase neon-text">
          {t("taglineLine1")}
          <br />
          {t("taglineLine2")}
        </h2>

        <TypingText key={texts.join("|")} texts={texts} />

        <div className="w-24 h-[1px] mt-10 bg-[rgba(0,167,197,0.5)] shadow-[0_0_10px_rgba(0,167,197,0.6)]" />

        <motion.a
          href="#goals"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mt-10 text-xs tracking-widest text-[rgba(255,255,255,0.6)] hover:text-[color:var(--color-turkish-blue-300)] transition-all"
        >
          {t("scrollCta")}
        </motion.a>
      </motion.div>

      <div className="absolute w-[800px] h-[800px] rounded-full border border-[rgba(0,167,197,0.1)] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse-slow" />
      <div className="absolute w-[1200px] h-[1200px] rounded-full border border-[rgba(0,167,197,0.05)] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
    </section>
  );
}
