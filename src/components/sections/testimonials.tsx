"use client";

import { motion } from "framer-motion";
import { useTranslation } from "@tengra/language";
import { Quote } from "lucide-react";

export default function Testimonials() {
    const { t } = useTranslation("Testimonials");

    const testimonials = [
        { key: "user1", delay: 0 },
        { key: "user2", delay: 0.1 },
        { key: "user3", delay: 0.2 },
    ];

    return (
        <section className="py-24 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[var(--color-turkish-blue-900)] rounded-full blur-[120px] opacity-10 pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                        {t("title")}
                    </h2>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: item.delay }}
                            className="relative p-8 rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] backdrop-blur-sm hover:bg-[rgba(255,255,255,0.05)] transition-colors group"
                        >
                            <Quote className="w-10 h-10 text-[var(--color-turkish-blue-400)] opacity-20 mb-6 group-hover:scale-110 transition-transform" />

                            <p className="text-lg text-[rgba(255,255,255,0.8)] mb-6 leading-relaxed italic">
                                "{t(`items.${item.key}.text`)}"
                            </p>

                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-turkish-blue-400)] to-purple-600 flex items-center justify-center text-sm font-bold text-white">
                                    {t(`items.${item.key}.author`)[0]}
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-sm">
                                        {t(`items.${item.key}.author`)}
                                    </h4>
                                    <p className="text-xs text-[rgba(255,255,255,0.4)] uppercase tracking-wider">
                                        {t(`items.${item.key}.role`)}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
