"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Img from "../../../public/tengra_without_text.png";
import { useEffect, useState } from "react";

export default function Hero() {
  const [index, setIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Daha yavaş ve akıcı typing effect
  useEffect(() => {
    const texts = ["𐱅𐰭𐰍𐰺𐰀", "TENGRA"];
    const fullText = texts[index];
    const speed = isDeleting ? 120 : 180; // yavaşlatıldı
    const pause = 2500; // kelime sonunda bekleme süresi

    if (!isDeleting && displayed.length < fullText.length) {
      const timeout = setTimeout(
        () => setDisplayed(fullText.slice(0, displayed.length + 1)),
        speed
      );
      return () => clearTimeout(timeout);
    }

    if (isDeleting && displayed.length > 0) {
      const timeout = setTimeout(
        () => setDisplayed(fullText.slice(0, displayed.length - 1)),
        speed / 1.4
      );
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
  }, [displayed, isDeleting, index]);

  return (
    <section
      id="hero"
      className="relative flex flex-col items-center justify-center min-h-[100vh] w-full text-center overflow-hidden"
    >
      {/* ---- Background Layers ----  
      <div className="absolute inset-0 bg-[#0A0F12]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,167,197,0.08)_0%,transparent_70%)]" />
      <div className="absolute inset-0 pointer-events-none bg-[url('/images/stars.png')] bg-center bg-cover opacity-20" />*/}

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] rounded-full bg-[radial-gradient(circle,rgba(0,167,197,0.12)_0%,transparent_70%)] blur-3xl" />
      </div>

      {/* ---- Symbol ---- */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.4, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center"
      >
        {/* Tengri symbol */}
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
            alt="Tengra Symbol"
            width={140}
            height={140}
            priority
            className="drop-shadow-[0_0_30px_rgba(0,167,197,0.6)]"
          />
        </motion.div>

        {/* Slogan */}
        <h2 className="mt-10 text-[color:var(--color-turkish-blue-400)] text-sm md:text-base tracking-[0.25em] font-light uppercase neon-text">
          Forging the Divine
          <br />
          and the Technological
        </h2>

        {/* Göktürk yazısı */}
        <motion.h1
          key={index}
          className="mt-10 text-4xl md:text-5xl tracking-[0.35em] font-display neon-text select-none tengra-text"
        >
          {displayed}
          <span className="border-r-2 border-[rgba(0,167,197,0.7)] ml-1 animate-cursor" />
        </motion.h1>

        {/* Line divider */}
        <div className="w-24 h-[1px] mt-10 bg-[rgba(0,167,197,0.5)] shadow-[0_0_10px_rgba(0,167,197,0.6)]" />

        {/* Scroll CTA */}
        <motion.a
          href="#goals"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mt-10 text-xs tracking-widest text-[rgba(255,255,255,0.6)] hover:text-[color:var(--color-turkish-blue-300)] transition-all"
        >
          SCROLL DOWN
        </motion.a>
      </motion.div>

      {/* Glow rings */}
      <div className="absolute w-[800px] h-[800px] rounded-full border border-[rgba(0,167,197,0.1)] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse-slow" />
      <div className="absolute w-[1200px] h-[1200px] rounded-full border border-[rgba(0,167,197,0.05)] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
    </section>
  );
}
