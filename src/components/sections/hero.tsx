"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Rocket, Globe } from "lucide-react";
import { useTranslation } from "@tengra/language";
import GradientText from "@/components/ui/gradient-text";
import { Button } from "@/components/ui/button";

import LiveGlobe from "@/components/home/live-globe";

const Hero = () => {
  const { t } = useTranslation("Hero");
  const wordOne = t("typingWordOne");
  const wordTwo = t("typingWordTwo");
  const [displayText, setDisplayText] = useState(wordTwo);

  useEffect(() => {
    setDisplayText(wordTwo);
    const interval = setInterval(() => {
      setDisplayText(current => current === wordTwo ? wordOne : wordTwo);
    }, 3000);
    return () => clearInterval(interval);
  }, [wordOne, wordTwo]);

  return (
    <section className="relative w-full min-h-[90vh] flex flex-col items-center justify-center pt-24 pb-16 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-30 md:opacity-40">
          <LiveGlobe />
        </div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[rgba(0,167,197,0.15)] via-[rgba(6,20,27,0)] to-transparent blur-3xl opacity-60" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[rgba(110,211,225,0.08)] via-[rgba(6,20,27,0)] to-transparent blur-3xl opacity-40" />
      </div>

      <div className="container px-4 md:px-6 relative z-10 flex flex-col items-center text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[rgba(110,211,225,0.2)] bg-[rgba(110,211,225,0.05)] text-xs font-medium text-[rgba(130,226,255,0.9)] mb-8"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[rgba(110,211,225,0.8)] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[rgba(110,211,225,1)]"></span>
          </span>
          {t("eyebrow")}
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white max-w-4xl mb-6 leading-[1.1]"
        >
          {t("taglineLine1")} <br className="hidden md:block" />
          {t("taglineLine2")}
          <span className="inline-block relative ml-4">
            <AnimatePresence mode="wait">
              <motion.span
                key={displayText}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className={`block ${displayText === wordOne ? "font-serif" : "font-sans"}`}
              >
                <GradientText className="font-extrabold">{displayText}</GradientText>
              </motion.span>
            </AnimatePresence>
          </span>
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="text-lg md:text-xl text-[rgba(255,255,255,0.6)] max-w-2xl mb-10 leading-relaxed"
        >
          {t("intro")}
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          className="flex flex-col sm:flex-row items-center gap-4"
        >
          <Link href="/contact">
            <Button
              size="lg"
              className="h-12 px-8 rounded-xl bg-white text-black hover:bg-gray-100 font-semibold shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all hover:scale-105 active:scale-95"
            >
              {t("primaryCta")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/projects">
            <Button
              variant="outline"
              size="lg"
              className="h-12 px-8 rounded-xl border-[rgba(255,255,255,0.15)] text-white hover:bg-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.3)] backdrop-blur-sm transition-all hover:scale-105 active:scale-95"
            >
              {t("secondaryCta")}
            </Button>
          </Link>
        </motion.div>

        {/* Floating Cards (Decor) */}
        <div className="absolute top-1/2 left-0 w-full h-full pointer-events-none hidden lg:block -z-10">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="absolute top-20 left-[5%] p-4 rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(6,20,27,0.4)] backdrop-blur-md rotate-[-6deg]"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[rgba(110,211,225,0.1)] text-[color:var(--color-turkish-blue-400)]">
                <Rocket className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{t("floatingCards.performance")}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="absolute bottom-40 right-[5%] p-4 rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(6,20,27,0.4)] backdrop-blur-md rotate-[6deg]"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[rgba(168,85,247,0.1)] text-purple-400">
                <Globe className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{t("floatingCards.global")}</p>
              </div>
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
};

export default Hero;
