"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

export default function Network() {
  const t = useTranslations("Network");

  return (
    <section id="network" className="relative flex flex-col items-center justify-center text-center py-32 px-4 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
        className="relative z-10 max-w-3xl mx-auto"
      >
        <h2 className="section-title mb-8 neon-text">{t("title")}</h2>

        <p className="text-sm md:text-base text-[rgba(255,255,255,0.7)] leading-relaxed mb-10">{t("description")}</p>

        <motion.a
          href="/forum"
          className="relative inline-flex items-center justify-center px-8 py-3 font-medium tracking-widest uppercase text-sm text-[color:var(--color-turkish-blue-400)] border border-[rgba(0,167,197,0.4)] rounded-lg btn-ripple"
        >
          {t("cta")}
          <span className="absolute inset-0 rounded-lg opacity-30 bg-[radial-gradient(circle,rgba(0,167,197,0.6)_0%,transparent_80%)] blur-xl" />
        </motion.a>
      </motion.div>
    </section>
  );
}
