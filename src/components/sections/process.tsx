"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "@tengra/language";
import { CheckCircle2, MessageSquare, Rocket, Sparkles, Wrench } from "lucide-react";
import GradientText from "@/components/ui/gradient-text";

export default function Process() {
    const { t } = useTranslation("Process");

    const steps = [
        { id: 1, key: "discovery", icon: MessageSquare },
        { id: 2, key: "design", icon: Sparkles },
        { id: 3, key: "build", icon: Wrench },
        { id: 4, key: "launch", icon: Rocket },
    ];

    return (
        <section id="process" className="relative py-24 px-4 bg-[rgba(6,20,27,0.4)] border-y border-[rgba(255,255,255,0.05)]">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-5xl font-bold text-white mb-6"
                    >
                        {t("title")}
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-[rgba(255,255,255,0.6)]"
                    >
                        {t("description")}
                    </motion.p>
                </div>

                <div className="relative">
                    {/* Connector Line (Desktop) */}
                    <div className="hidden lg:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[rgba(110,211,225,0.2)] to-transparent -translate-y-1/2" />

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
                        {steps.map((step, index) => (
                            <motion.div
                                key={step.key}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.2 }}
                                className="relative flex flex-col items-center text-center"
                            >
                                {/* Step Number Badge */}
                                <div className="w-16 h-16 rounded-2xl bg-[rgba(6,20,27,0.8)] border border-[rgba(110,211,225,0.3)] shadow-[0_0_20px_rgba(110,211,225,0.15)] flex items-center justify-center text-[color:var(--color-turkish-blue-400)] mb-6 relative z-10 transition-transform hover:scale-110 duration-300">
                                    <step.icon className="w-8 h-8" />
                                    <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-[color:var(--color-turkish-blue-500)] text-white text-sm font-bold flex items-center justify-center shadow-lg border border-[rgba(6,20,27,1)]">
                                        {step.id}
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold text-white mb-3">
                                    {t(`steps.${step.key}.title`)}
                                </h3>
                                <p className="text-[rgba(255,255,255,0.6)] text-sm leading-relaxed">
                                    {t(`steps.${step.key}.description`)}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};
