"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Code2, Globe, Palette, Sparkles } from "lucide-react";
import GlowCard from "@/components/ui/glow-card";
import GradientText from "@/components/ui/gradient-text";

const Features = () => {
    const t = useTranslations("Features");

    const items = [
        {
            key: "design",
            icon: Palette,
            color: "rgba(236, 72, 153, 0.4)", // pink
            iconColor: "text-pink-400",
            bg: "bg-pink-400/10",
        },
        {
            key: "dev",
            icon: Code2,
            color: "rgba(110, 211, 225, 0.4)", // cyan
            iconColor: "text-[color:var(--color-turkish-blue-400)]",
            bg: "bg-[rgba(110,211,225,0.1)]",
        },
        {
            key: "ai",
            icon: Sparkles,
            color: "rgba(168, 85, 247, 0.4)", // purple
            iconColor: "text-purple-400",
            bg: "bg-purple-400/10",
        },
        {
            key: "uiux",
            icon: Globe,
            color: "rgba(59, 130, 246, 0.4)", // blue
            iconColor: "text-blue-400",
            bg: "bg-blue-400/10",
        },
    ];

    return (
        <section id="features" className="relative py-24 px-4 bg-[var(--color-background)] overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[rgba(110,211,225,0.03)] via-transparent to-transparent pointer-events-none" />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-3xl md:text-5xl font-bold text-white mb-6"
                    >
                        {t("title")}
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-lg text-[rgba(255,255,255,0.6)]"
                    >
                        {t("description")}
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {items.map((item, index) => (
                        <motion.div
                            key={item.key}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <GlowCard className="h-full p-8" glowColor={item.color}>
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${item.bg} ${item.iconColor}`}>
                                    <item.icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">
                                    {t(`items.${item.key}.title`)}
                                </h3>
                                <p className="text-[rgba(255,255,255,0.6)] leading-relaxed">
                                    {t(`items.${item.key}.description`)}
                                </p>
                            </GlowCard>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;
