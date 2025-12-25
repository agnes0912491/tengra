"use client";

import { useTranslation } from "@tengra/language";
import { ArrowRight } from "lucide-react";
import AnimatedButton from "@/components/ui/animated-button";
import GlowCard from "@/components/ui/glow-card";
import { motion } from "framer-motion";

export default function Cta() {
    const { t } = useTranslation("Cta");

    return (
        <section className="py-24 px-4">
            <div className="container mx-auto max-w-4xl">
                <GlowCard className="bg-gradient-to-br from-[rgba(255,255,255,0.03)] to-[rgba(255,255,255,0.01)] border border-[rgba(255,255,255,0.05)] overflow-hidden relative">
                    {/* Background Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-turkish-blue-900)]/20 to-purple-900/20 blur-xl" />

                    <div className="relative z-10 p-12 md:p-20 text-center flex flex-col items-center">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-4xl md:text-6xl font-bold text-white mb-6"
                        >
                            {t("title")}
                        </motion.h2>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-xl text-[rgba(255,255,255,0.6)] mb-10 max-w-lg"
                        >
                            {t("description")}
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                        >
                            <AnimatedButton size="lg" className="px-8 text-lg">
                                {t("button")} <ArrowRight className="ml-2 w-5 h-5" />
                            </AnimatedButton>
                        </motion.div>
                    </div>
                </GlowCard>
            </div>
        </section>
    );
}
