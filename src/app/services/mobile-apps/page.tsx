"use client";

import SiteShell from "@/components/layout/site-shell";
import { useTranslation } from "@tengra/language";
import { motion } from "framer-motion";
import { Smartphone, SmartphoneIcon, ShieldCheck, WifiOff } from "lucide-react";

export default function MobileAppsPage() {
    const { t } = useTranslation("ServicesPage.mobile");

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
                            <Smartphone className="w-3 h-3" />
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
                    <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[1, 2, 3].map((index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="bg-[rgba(255,255,255,0.03)] p-8 rounded-3xl border border-[rgba(255,255,255,0.05)] text-center group hover:bg-[rgba(255,255,255,0.05)] transition-all"
                            >
                                <div className="w-14 h-14 mx-auto mb-6 rounded-2xl bg-[rgba(255,255,255,0.05)] flex items-center justify-center text-[var(--color-turkish-blue-400)] group-hover:scale-110 transition-transform">
                                    {index === 1 ? <SmartphoneIcon className="w-7 h-7" /> : index === 2 ? <ShieldCheck className="w-7 h-7" /> : <WifiOff className="w-7 h-7" />}
                                </div>
                                <h3 className="text-lg font-bold text-white mb-3">{t(`feature${index as 1 | 2 | 3}Title`)}</h3>
                                <p className="text-sm text-[rgba(255,255,255,0.5)] leading-relaxed">
                                    {t(`feature${index as 1 | 2 | 3}Desc`)}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </SiteShell>
    );
}
