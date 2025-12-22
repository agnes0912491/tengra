"use client";

import SiteShell from "@/components/layout/site-shell";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

export default function AboutPage() {
  const t = useTranslations("About");

  return (
    <SiteShell>
      <div className="relative isolate px-6 pt-14 lg:px-8 overflow-hidden">
        {/* Decorative background blur */}
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#00a7c5] to-[#7775D6] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
        </div>

        <div className="mx-auto max-w-4xl py-24 sm:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h2 className="text-sm font-semibold leading-7 text-[var(--color-turkish-blue-400)] tracking-widest uppercase">
              {t("subtitle")}
            </h2>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-6xl">
              {t("title")}
            </h1>
            <div className="mt-10 space-y-8 text-lg leading-8 text-[rgba(255,255,255,0.7)]">
              <p>{t("description1")}</p>
              <p>{t("description2")}</p>
            </div>
          </motion.div>

          {/* Vision & Mission sections */}
          <div className="mt-20 grid grid-cols-1 gap-12 sm:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-[rgba(255,255,255,0.03)] p-8 rounded-2xl border border-[rgba(255,255,255,0.05)]"
            >
              <h3 className="text-xl font-bold text-white mb-4">{t("vision")}</h3>
              <p className="text-[rgba(255,255,255,0.6)] leading-relaxed">
                {t("visionText")}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
              className="bg-[rgba(255,255,255,0.03)] p-8 rounded-2xl border border-[rgba(255,255,255,0.05)]"
            >
              <h3 className="text-xl font-bold text-white mb-4">{t("mission")}</h3>
              <p className="text-[rgba(255,255,255,0.6)] leading-relaxed">
                {t("missionText")}
              </p>
            </motion.div>
          </div>
        </div>

        {/* Lower background blur */}
        <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]" aria-hidden="true">
          <div className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#00a7c5] opacity-10 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"></div>
        </div>
      </div>
    </SiteShell>
  );
}
