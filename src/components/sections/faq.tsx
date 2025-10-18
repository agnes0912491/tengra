"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { cn } from "@/lib/utils";

interface FAQItem {
  question: string;
  answer: string;
}

export default function FAQ() {
  const t = useTranslations("faq");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs: FAQItem[] = [
    {
      question: t("q1.question"),
      answer: t("q1.answer"),
    },
    {
      question: t("q2.question"),
      answer: t("q2.answer"),
    },
    {
      question: t("q3.question"),
      answer: t("q3.answer"),
    },
    {
      question: t("q4.question"),
      answer: t("q4.answer"),
    },
    {
      question: t("q5.question"),
      answer: t("q5.answer"),
    },
    {
      question: t("q6.question"),
      answer: t("q6.answer"),
    },
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="relative w-full overflow-hidden py-24 px-6 sm:px-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(0,167,197,0.18),_transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(140deg,_rgba(3,11,16,0.6),_rgba(0,167,197,0.05))]" />

      <div className="relative mx-auto max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <div className="mx-auto mb-6 h-px w-32 bg-gradient-to-r from-transparent via-[rgba(0,167,197,0.6)] to-transparent" />
          <h2 className="section-title text-3xl uppercase tracking-[0.35em] text-[color:var(--color-turkish-blue-400)] md:text-4xl">
            {t("title")}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-[color:var(--text-muted)] md:text-lg">
            {t("subtitle")}
          </p>
        </motion.div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.08 }}
              className={cn(
                "group relative overflow-hidden rounded-2xl border border-[rgba(0,167,197,0.15)] bg-[rgba(5,18,24,0.78)]/90 backdrop-blur-xl transition-all",
                openIndex === index
                  ? "border-[rgba(0,167,197,0.45)] shadow-[0_0_35px_rgba(0,167,197,0.18)]"
                  : "hover:border-[rgba(0,167,197,0.35)] hover:shadow-[0_0_25px_rgba(0,167,197,0.12)]"
              )}
            >
              <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-[rgba(0,167,197,0.7)] via-[rgba(0,167,197,0.45)] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-80" />
              <button
                onClick={() => toggleFAQ(index)}
                className={cn(
                  "flex w-full items-center justify-between px-7 py-5 text-left transition-colors",
                  openIndex === index
                    ? "bg-[rgba(0,167,197,0.12)]"
                    : "hover:bg-[rgba(0,167,197,0.08)]"
                )}
                aria-expanded={openIndex === index}
              >
                <span className="pr-10 font-display text-lg uppercase tracking-[0.25em] text-[color:var(--color-turkish-blue-200)] md:text-xl">
                  {faq.question}
                </span>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.25 }}
                  className="flex-shrink-0 text-[rgba(0,167,197,0.6)]"
                >
                  <ChevronDown className="h-5 w-5" />
                </motion.div>
              </button>

              <AnimatePresence initial={false}>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.28 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-[rgba(0,167,197,0.2)] bg-[rgba(2,10,14,0.9)] px-7 pb-6 pt-4">
                      <p className="text-[15px] leading-relaxed text-[rgba(223,241,246,0.88)]">
                        {faq.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="relative mt-16 overflow-hidden rounded-2xl border border-[rgba(0,167,197,0.2)] bg-[rgba(3,11,16,0.85)] px-8 py-8 text-center shadow-[0_0_28px_rgba(0,167,197,0.12)] backdrop-blur-lg"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(0,167,197,0.22),_transparent_65%)]" />
          <div className="relative">
            <p className="mb-2 text-lg text-[color:var(--color-turkish-blue-200)]">
              {t("stillQuestions")}
            </p>
            <a
              href="mailto:info@tengra.studio"
              className="inline-flex items-center justify-center rounded-full border border-[rgba(0,167,197,0.45)] px-6 py-2 font-display text-sm uppercase tracking-[0.3em] text-[color:var(--color-turkish-blue-100)] transition hover:bg-[rgba(0,167,197,0.12)]"
            >
              info@tengra.studio
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
