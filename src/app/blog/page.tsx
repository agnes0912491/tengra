"use client";

import SiteShell from "@/components/layout/site-shell";
import { useTranslation } from "@tengra/language";
import { motion } from "framer-motion";
import { BookOpen, PenTool, Rss } from "lucide-react";

export default function BlogPage() {
    const { t } = useTranslation("BlogPage");

    return (
        <SiteShell>
            <div className="relative isolate px-6 pt-14 lg:px-8">
                <div className="mx-auto max-w-7xl py-24 sm:py-32">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(0,167,197,0.1)] border border-[rgba(0,167,197,0.2)] text-[var(--color-turkish-blue-400)] text-xs font-bold uppercase tracking-wider mb-6">
                            <Rss className="w-3 h-3" />
                            Blog
                        </div>
                        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
                            {t("title")}
                        </h1>
                        <p className="mt-8 text-lg leading-8 text-[rgba(255,255,255,0.7)] max-w-2xl mx-auto">
                            {t("description")}
                        </p>
                    </motion.div>

                    {/* Coming Soon */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="mt-16 max-w-2xl mx-auto"
                    >
                        <div className="bg-[rgba(255,255,255,0.03)] p-12 rounded-3xl border border-[rgba(255,255,255,0.05)] text-center">
                            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[rgba(255,255,255,0.05)] flex items-center justify-center text-[var(--color-turkish-blue-400)]">
                                <PenTool className="w-10 h-10" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-4">
                                {t("comingSoon")}
                            </h2>
                            <p className="text-[rgba(255,255,255,0.6)] leading-relaxed">
                                {t("comingSoonDesc")}
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </SiteShell>
    );
}
