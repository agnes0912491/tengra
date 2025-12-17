"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Send, Loader2 } from "lucide-react";
import GlowCard from "@/components/ui/glow-card";
import GradientText from "@/components/ui/gradient-text";
import AnimatedButton from "@/components/ui/animated-button";

export default function ContactSection() {
    const t = useTranslations("Contact");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setSuccess(false);
        setError(false);

        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData);

        try {
            // Temporary mock submission - later wire to real API
            await new Promise(resolve => setTimeout(resolve, 1500));
            setSuccess(true);
            (e.target as HTMLFormElement).reset();
        } catch (err) {
            setError(true);
        } finally {
            setLoading(false);
        }
    }

    return (
        <section id="contact" className="py-24 px-4 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--color-turkish-blue-900)] rounded-full blur-[150px] opacity-10 pointer-events-none" />

            <div className="container mx-auto max-w-4xl relative z-10">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-5xl font-bold text-white mb-6"
                    >
                        <GradientText>{t("title")}</GradientText>
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

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                >
                    <GlowCard className="p-8 md:p-12 bg-[rgba(6,20,27,0.6)] backdrop-blur-md border border-[rgba(255,255,255,0.1)]">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-[rgba(255,255,255,0.7)]">{t("name")}</label>
                                    <input
                                        name="name"
                                        required
                                        className="w-full px-4 py-3 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] text-white focus:outline-none focus:border-[var(--color-turkish-blue-400)] transition-colors"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-[rgba(255,255,255,0.7)]">{t("email")}</label>
                                    <input
                                        name="email"
                                        type="email"
                                        required
                                        className="w-full px-4 py-3 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] text-white focus:outline-none focus:border-[var(--color-turkish-blue-400)] transition-colors"
                                        placeholder="john@example.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[rgba(255,255,255,0.7)]">{t("subject")}</label>
                                <input
                                    name="subject"
                                    required
                                    className="w-full px-4 py-3 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] text-white focus:outline-none focus:border-[var(--color-turkish-blue-400)] transition-colors"
                                    placeholder="Project Inquiry"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[rgba(255,255,255,0.7)]">{t("message")}</label>
                                <textarea
                                    name="message"
                                    required
                                    rows={5}
                                    className="w-full px-4 py-3 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] text-white focus:outline-none focus:border-[var(--color-turkish-blue-400)] transition-colors resize-none"
                                    placeholder="Tell us about your project..."
                                />
                            </div>

                            <div className="pt-4">
                                <AnimatedButton
                                    type="submit"
                                    disabled={loading}
                                    className="h-12 w-full text-base font-bold bg-white text-black hover:bg-gray-200"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                            {t("saving")}
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-5 h-5 mr-2" />
                                            {t("submit")}
                                        </>
                                    )}
                                </AnimatedButton>
                            </div>

                            {success && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-center"
                                >
                                    {t("success")}
                                </motion.div>
                            )}

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-center"
                                >
                                    {t("error")}
                                </motion.div>
                            )}
                        </form>
                    </GlowCard>
                </motion.div>
            </div>
        </section>
    );
}
