"use client";

import { motion } from "framer-motion";
import { useTranslation } from "@tengra/language";
import { ArrowRight, Users, Globe, Handshake } from "lucide-react";

export default function Network() {
  const { t } = useTranslation("Network");

  const features = [
    { icon: Users, label: t("features.builders") },
    { icon: Globe, label: t("features.players") },
    { icon: Handshake, label: t("features.partners") },
  ];

  return (
    <section id="network" className="relative py-24 md:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] rounded-full bg-[radial-gradient(circle,rgba(30,184,255,0.1)_0%,transparent_50%)]" />
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(30,184,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(30,184,255,0.02)_1px,transparent_1px)] bg-[size:80px_80px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="relative z-10 max-w-4xl mx-auto"
      >
        {/* Main Content Card */}
        <div className="relative p-8 md:p-12 rounded-3xl bg-[rgba(15,31,54,0.6)] border border-[rgba(72,213,255,0.15)] backdrop-blur-xl shadow-[0_30px_60px_rgba(0,0,0,0.4)]">
          {/* Corner Accents */}
          <div className="absolute top-0 left-0 w-20 h-20 border-l-2 border-t-2 border-[rgba(72,213,255,0.3)] rounded-tl-3xl" />
          <div className="absolute bottom-0 right-0 w-20 h-20 border-r-2 border-b-2 border-[rgba(72,213,255,0.3)] rounded-br-3xl" />

          <div className="text-center">
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              className="section-title"
            >
              {t("title")}
            </motion.h2>

            <div className="divider mt-6 mb-8" />

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              viewport={{ once: true }}
              className="text-base md:text-lg text-[var(--text-secondary)] leading-relaxed max-w-2xl mx-auto"
            >
              {t("description")}
            </motion.p>

            {/* Feature Pills */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              viewport={{ once: true }}
              className="mt-10 flex flex-wrap justify-center gap-4"
            >
              {features.map((feature, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[rgba(30,184,255,0.08)] border border-[rgba(72,213,255,0.15)]"
                >
                  <feature.icon className="w-4 h-4 text-[var(--color-turkish-blue-400)]" />
                  <span className="text-sm text-[var(--text-secondary)]">{feature.label}</span>
                </div>
              ))}
            </motion.div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              viewport={{ once: true }}
              className="mt-10"
            >
              <a
                href="/forum"
                className="group inline-flex items-center gap-3 px-8 py-4 text-base font-semibold rounded-2xl bg-gradient-to-r from-[var(--color-turkish-blue-500)] to-[var(--color-turkish-blue-600)] text-white shadow-[0_10px_40px_rgba(30,184,255,0.3)] hover:shadow-[0_15px_50px_rgba(30,184,255,0.4)] hover:scale-[1.02] transition-all duration-300"
              >
                {t("cta")}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
            </motion.div>
          </div>
        </div>

        {/* Floating Elements */}
        <motion.div
          animate={{ y: [-8, 8, -8] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-6 -right-6 w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-turkish-blue-500)] to-[var(--color-turkish-blue-700)] opacity-20 blur-sm"
        />
        <motion.div
          animate={{ y: [8, -8, 8] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-6 -left-6 w-12 h-12 rounded-full bg-gradient-to-br from-[var(--color-turkish-blue-400)] to-[var(--color-turkish-blue-600)] opacity-20 blur-sm"
        />
      </motion.div>
    </section>
  );
}
