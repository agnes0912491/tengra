"use client";

import SiteShell from "@/components/layout/site-shell";
import { useTranslation } from "@tengra/language";
import { motion } from "framer-motion";
import { Sparkles, Briefcase, Zap, GraduationCap } from "lucide-react";

export default function CareersPage() {
    const { t } = useTranslation("Careers");

    const icons = [Sparkles, Zap, Briefcase, GraduationCap];

    return (
        <SiteShell>
            <div className="relative isolate px-6 pt-14 lg:px-8">
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
                        <p className="mt-8 text-lg leading-8 text-[rgba(255,255,255,0.7)] max-w-2xl mx-auto">
                            {t("description")}
                        </p>
                    </motion.div>

                    {/* Benefits Grid */}
                    <div className="mt-24 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {[1, 2, 3, 4].map((index) => {
                            const Icon = icons[index - 1];
                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    viewport={{ once: true }}
                                    className="bg-[rgba(255,255,255,0.03)] p-6 rounded-2xl border border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.1)] transition-all"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-[rgba(0,167,197,0.1)] flex items-center justify-center text-[var(--color-turkish-blue-400)] mb-4">
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <h4 className="text-sm font-bold text-white">{t(`benefit${index as 1 | 2 | 3 | 4}`)}</h4>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Open Positions */}
                    <div className="mt-32">
                        <h3 className="text-2xl font-bold text-white mb-8 border-l-4 border-[var(--color-turkish-blue-400)] pl-4">
                            {t("openPositions")}
                        </h3>
                        <div className="bg-[rgba(255,255,255,0.02)] p-12 rounded-3xl border border-dashed border-[rgba(255,255,255,0.1)] text-center">
                            <p className="text-[rgba(255,255,255,0.5)] italic">
                                {t("noPositions")}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </SiteShell>
    );
}
