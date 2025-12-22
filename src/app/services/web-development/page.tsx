"use client";

import SiteShell from "@/components/layout/site-shell";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Globe, Code, Layers, Zap } from "lucide-react";

export default function WebDevPage() {
    const t = useTranslations("ServicesPage.web");

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
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(0,167,197,0.1)] border border-[rgba(0,167,197,0.2)] text-[var(--color-turkish-blue-400)] text-xs font-bold uppercase tracking-wider mb-6">
                            <Globe className="w-3 h-3" />
                            {t("subtitle")}
                        </div>
                        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
                            {t("title")}
                        </h1>
                        <p className="mt-8 text-lg leading-8 text-[rgba(255,255,255,0.7)] max-w-2xl mx-auto">
                            {t("description")}
                        </p>
                    </motion.div>

                    {/* Features */}
                    <div className="mt-24 space-y-12">
                        {[1, 2, 3].map((index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: index % 2 === 0 ? 20 : -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6 }}
                                viewport={{ once: true }}
                                className="flex flex-col md:flex-row gap-8 items-center bg-[rgba(255,255,255,0.02)] p-8 rounded-3xl border border-[rgba(255,255,255,0.05)]"
                            >
                                <div className="w-16 h-16 shrink-0 rounded-2xl bg-gradient-to-br from-[var(--color-turkish-blue-400)] to-blue-600 flex items-center justify-center text-white">
                                    {index === 1 ? <Zap className="w-8 h-8" /> : index === 2 ? <Layers className="w-8 h-8" /> : <Code className="w-8 h-8" />}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-2">{t(`feature${index as 1 | 2 | 3}Title`)}</h3>
                                    <p className="text-[rgba(255,255,255,0.6)] leading-relaxed">
                                        {t(`feature${index as 1 | 2 | 3}Desc`)}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </SiteShell>
    );
}
