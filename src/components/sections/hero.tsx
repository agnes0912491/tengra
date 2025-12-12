"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { resolveCdnUrl } from "@/lib/constants";
import { ArrowRight, Sparkles } from "lucide-react";

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
    const speed = isDeleting ? 80 : 120;
    const pause = 3000;
    let timeout: ReturnType<typeof setTimeout> | undefined;

    if (!isDeleting && displayed.length < fullText.length) {
      timeout = setTimeout(() => {
        setDisplayed(fullText.slice(0, displayed.length + 1));
      }, speed);
    } else if (isDeleting && displayed.length > 0) {
      timeout = setTimeout(() => {
        setDisplayed(fullText.slice(0, displayed.length - 1));
      }, speed / 1.5);
    } else if (!isDeleting && displayed.length === fullText.length) {
      timeout = setTimeout(() => {
        setIsDeleting(true);
      }, pause);
    } else if (isDeleting && displayed.length === 0) {
      timeout = setTimeout(() => {
        setIsDeleting(false);
        setIndex((prev) => (prev + 1) % texts.length);
      }, 300);
    }

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [displayed, index, isDeleting, texts]);

  return (
    <span className="inline-flex items-center">
      <span className="bg-gradient-to-r from-[var(--color-turkish-blue-300)] via-[var(--color-turkish-blue-400)] to-[var(--color-turkish-blue-500)] bg-clip-text text-transparent tengra-text">
        {displayed}
      </span>
      <span className="ml-1 w-[3px] h-[1.1em] bg-[var(--color-turkish-blue-400)] animate-cursor rounded-full" />
    </span>
  );
}

export default function Hero() {
  const t = useTranslations("Hero");
  const texts = useMemo(() => [t("typingWordOne"), t("typingWordTwo")], [t]);

  return (
    <section
      id="hero"
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8 pt-16"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Main Gradient Orb */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-[radial-gradient(circle,rgba(30,184,255,0.15)_0%,transparent_60%)] blur-3xl" />

        {/* Secondary Orbs */}
        <div className="absolute top-1/2 right-0 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(72,213,255,0.1)_0%,transparent_70%)] blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(0,120,171,0.1)_0%,transparent_70%)] blur-3xl" />

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(30,184,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(30,184,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-start text-left"
          >
            {/* Eyebrow Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[rgba(30,184,255,0.1)] border border-[rgba(72,213,255,0.2)] backdrop-blur-sm"
            >
              <Sparkles className="w-4 h-4 text-[var(--color-turkish-blue-400)]" />
              <span className="text-xs font-medium tracking-wider text-[var(--color-turkish-blue-300)] uppercase">
                {t("eyebrow")}
              </span>
            </motion.div>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mt-6 text-sm md:text-base font-medium tracking-wide uppercase text-[var(--text-muted)]"
            >
              {t("taglineLine1")}
              <br />
              <span className="text-[var(--color-turkish-blue-400)]">{t("taglineLine2")}</span>
            </motion.p>

            {/* Main Heading with Typing Effect */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-display font-bold tracking-tight text-[var(--text-primary)]"
            >
              <TypingText key={texts.join("|")} texts={texts} />
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="mt-6 max-w-xl text-base md:text-lg text-[var(--text-secondary)] leading-relaxed"
            >
              {t("intro")}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="mt-8 flex flex-wrap items-center gap-4"
            >
              <a
                href="#projects"
                className="group inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-xl bg-gradient-to-r from-[var(--color-turkish-blue-500)] to-[var(--color-turkish-blue-600)] text-white shadow-[0_8px_30px_rgba(30,184,255,0.3)] hover:shadow-[0_12px_40px_rgba(30,184,255,0.4)] hover:scale-[1.02] transition-all duration-300"
              >
                {t("primaryCta")}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="#network"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-xl border border-[rgba(72,213,255,0.3)] text-[var(--color-turkish-blue-300)] bg-[rgba(30,184,255,0.05)] hover:bg-[rgba(30,184,255,0.1)] hover:border-[rgba(72,213,255,0.5)] backdrop-blur-sm transition-all duration-300"
              >
                {t("secondaryCta")}
              </a>
            </motion.div>

            {/* Feature Pills */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="mt-10 flex flex-wrap gap-3"
            >
              {[t("pillOne"), t("pillTwo"), t("pillThree")].map((pill, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[rgba(148,163,184,0.08)] border border-[rgba(148,163,184,0.15)] text-[var(--text-muted)]"
                >
                  {pill}
                </span>
              ))}
            </motion.div>

            {/* Scroll Indicator */}
            <motion.a
              href="#goals"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="mt-12 hidden lg:inline-flex items-center gap-2 text-xs font-medium tracking-wider text-[var(--text-muted)] hover:text-[var(--color-turkish-blue-300)] transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-[var(--color-turkish-blue-500)] shadow-[0_0_12px_rgba(30,184,255,0.6)] animate-pulse" />
              {t("scrollCta")}
            </motion.a>
          </motion.div>

          {/* Right Content - Logo/Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
            className="relative flex items-center justify-center"
          >
            {/* Outer Ring */}
            <div className="absolute w-[320px] h-[320px] md:w-[420px] md:h-[420px] rounded-full border border-[rgba(72,213,255,0.1)]" />
            <div className="absolute w-[380px] h-[380px] md:w-[500px] md:h-[500px] rounded-full border border-[rgba(72,213,255,0.05)]" />

            {/* Main Logo Container */}
            <div className="relative w-[260px] h-[260px] md:w-[340px] md:h-[340px] rounded-full">
              {/* Glow Background */}
              <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(30,184,255,0.2)_0%,transparent_70%)]" />

              {/* Glass Container */}
              <div className="absolute inset-4 rounded-full bg-[rgba(15,31,54,0.6)] border border-[rgba(72,213,255,0.15)] backdrop-blur-xl shadow-[0_30px_60px_rgba(0,0,0,0.5),0_0_60px_rgba(30,184,255,0.15)]">
                {/* Aura Effect */}
                <div className="aura rounded-full" />

                {/* Logo */}
                <motion.div
                  animate={{
                    scale: [1, 1.03, 1],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="relative flex h-full w-full items-center justify-center"
                >
                  <Image
                    crossOrigin="anonymous"
                    src={HERO_LOGO_SRC}
                    alt={t("symbolAlt")}
                    width={180}
                    height={180}
                    priority
                    fetchPriority="high"
                    className="drop-shadow-[0_0_40px_rgba(30,184,255,0.5)] md:w-[220px] md:h-[220px]"
                  />
                </motion.div>
              </div>

              {/* Floating Particles */}
              <motion.div
                animate={{ y: [-10, 10, -10] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-4 right-8 w-3 h-3 rounded-full bg-[var(--color-turkish-blue-400)] shadow-[0_0_20px_rgba(72,213,255,0.6)]"
              />
              <motion.div
                animate={{ y: [10, -10, 10] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-8 -left-4 w-2 h-2 rounded-full bg-[var(--color-turkish-blue-500)] shadow-[0_0_15px_rgba(30,184,255,0.5)]"
              />
              <motion.div
                animate={{ y: [-8, 8, -8] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1/2 -right-6 w-2 h-2 rounded-full bg-[var(--color-turkish-blue-300)] shadow-[0_0_12px_rgba(131,232,255,0.5)]"
              />
            </div>
          </motion.div>
        </div>
      </div>


    </section>
  );
}
