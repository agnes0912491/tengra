"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getFaqs, type FaqItem } from "@/lib/db";
import { useTranslation } from "@tengra/language";
import { ChevronDown, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function FaqSection() {
  const { language: locale } = useTranslation();
  const { t: tNav } = useTranslation("Navigation");
  const { t } = useTranslation("Faq");
  const [items, setItems] = useState<FaqItem[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const list = await getFaqs(locale).catch(() => []);
      if (mounted) setItems(list);
    })();
    return () => {
      mounted = false;
    };
  }, [locale]);

  if (!items.length) return null;

  return (
    <section className="relative py-24 md:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-[radial-gradient(circle,rgba(30,184,255,0.06)_0%,transparent_60%)]" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="section-title">{tNav("faq")}</h2>
          <div className="divider mt-6 mb-6" />
          <p className="text-[var(--text-secondary)]">
            {t("description")}
          </p>
        </motion.div>

        {/* FAQ Items */}
        <div className="space-y-3">
          {items.map((it, index) => (
            <motion.div
              key={it.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.4 }}
              viewport={{ once: true }}
              className="rounded-2xl bg-[rgba(15,31,54,0.6)] border border-[rgba(72,213,255,0.12)] backdrop-blur-xl overflow-hidden hover:border-[rgba(72,213,255,0.25)] transition-all duration-300"
            >
              <button
                type="button"
                onClick={() => setOpenId((p) => (p === it.id ? null : it.id))}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                    openId === it.id
                      ? "bg-[var(--color-turkish-blue-500)] text-white"
                      : "bg-[rgba(30,184,255,0.1)] text-[var(--color-turkish-blue-400)]"
                  )}>
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <span className={cn(
                    "font-medium text-sm md:text-base transition-colors",
                    openId === it.id ? "text-[var(--color-turkish-blue-300)]" : "text-[var(--text-primary)]"
                  )}>
                    {it.question}
                  </span>
                </div>
                <ChevronDown
                  className={cn(
                    "w-5 h-5 flex-shrink-0 text-[var(--text-muted)] transition-transform duration-300",
                    openId === it.id && "rotate-180 text-[var(--color-turkish-blue-400)]"
                  )}
                />
              </button>

              <AnimatePresence>
                {openId === it.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-5 pl-[4.25rem]">
                      <p className="text-sm md:text-base text-[var(--text-secondary)] leading-relaxed">
                        {it.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
