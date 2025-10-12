"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";

import Img from "../../../public/tengra_without_text.png";

export default function Hero() {
  const t = useTranslations("Hero");
  const [index, setIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const texts = useMemo(() => [t("typingWordOne"), t("typingWordTwo")], [t]);

  useEffect(() => {
    setDisplayed("");
    setIndex(0);
    setIsDeleting(false);
  }, [texts]);

  useEffect(() => {
    const fullText = texts[index];
    const speed = isDeleting ? 120 : 180;
    const pause = 2500;

    if (!isDeleting && displayed.length < fullText.length) {
      const timeout = setTimeout(() => setDisplayed(fullText.slice(0, displayed.length + 1)), speed);
      return () => clearTimeout(timeout);
    }

    if (isDeleting && displayed.length > 0) {
      const timeout = setTimeout(() => setDisplayed(fullText.slice(0, displayed.length - 1)), speed / 1.4);
      return () => clearTimeout(timeout);
    }

    if (!isDeleting && displayed.length === fullText.length) {
      const pauseTimer = setTimeout(() => setIsDeleting(true), pause);
      return () => clearTimeout(pauseTimer);
    }

    if (isDeleting && displayed.length === 0) {
      setIsDeleting(false);
      setIndex((prev) => (prev + 1) % texts.length);
    }
  }, [displayed, index, isDeleting, texts]);

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
            src={Img.src}
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

        <motion.h1
          key={`${index}-${texts[index]}`}
          className="mt-10 text-4xl md:text-5xl tracking-[0.35em] font-display neon-text select-none tengra-text"
        >
          {displayed}
          <span className="border-r-2 border-[rgba(0,167,197,0.7)] ml-1 animate-cursor" />
        </motion.h1>

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
