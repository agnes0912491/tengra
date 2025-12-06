"use client";

import { motion } from "framer-motion";
import { Code, Globe, Infinity, Sparkles, Zap } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";

type GoalKey = "inception" | "creation" | "expansion" | "harmony" | "beyond";

type GoalDefinition = {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  key: GoalKey;
  color: string;
};

const goals: GoalDefinition[] = [
  { icon: Sparkles, key: "inception", color: "from-[#f0b429] to-[#f59e0b]" },
  { icon: Code, key: "creation", color: "from-[var(--color-turkish-blue-400)] to-[var(--color-turkish-blue-600)]" },
  { icon: Globe, key: "expansion", color: "from-[#10b981] to-[#059669]" },
  { icon: Infinity, key: "harmony", color: "from-[#8b5cf6] to-[#7c3aed]" },
  { icon: Zap, key: "beyond", color: "from-[var(--color-turkish-blue-300)] to-[var(--color-turkish-blue-500)]" },
];

export default function Goals() {
  const t = useTranslations("Goals");
  const locale = useLocale();
  const [adminGoals, setAdminGoals] = useState<Array<{ title: string; body: string }>>([]);

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const res = await fetch("/api/homepage", { cache: "no-store" });
        if (!res.ok) return;
        const json = await res.json().catch(() => ({}));
        const rawTargets = json?.targets;
        let targets: Array<{ title: string; body: string }> = [];
        if (Array.isArray(rawTargets)) {
          targets = rawTargets;
        } else if (rawTargets && typeof rawTargets === "object") {
          const map = rawTargets as Record<string, Array<{ title: string; body: string }>>;
          targets = Array.isArray(map[locale]) ? map[locale]! : [];
        }
        if (!cancel) setAdminGoals(targets);
      } catch {
        // ignore
      }
    })();
    return () => {
      cancel = true;
    };
  }, [locale]);

  return (
    <section id="goals" className="relative py-24 md:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-[radial-gradient(circle,rgba(30,184,255,0.08)_0%,transparent_60%)]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="section-title">{t("title")}</h2>
          <div className="divider mt-6 mb-6" />
          <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
            Our journey from concept to reality, building the future one milestone at a time.
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-[var(--color-turkish-blue-500)] to-transparent opacity-30 hidden md:block" />

          <div className="space-y-12 md:space-y-0">
            {(adminGoals.length > 0
              ? adminGoals.map((g, idx) => ({
                icon: goals[idx % goals.length].icon,
                color: goals[idx % goals.length].color,
                title: g.title,
                description: g.body,
              }))
              : goals.map(({ icon, key, color }) => ({
                icon,
                color,
                title: t(`defaults.${key}.title` as never),
                description: t(`defaults.${key}.body` as never),
              })))
              .map(({ icon: Icon, color, title, description }, index) => {
                const isLeft = index % 2 === 0;

                return (
                  <motion.div
                    key={`${title}-${index}`}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.6 }}
                    viewport={{ once: true }}
                    className={`relative flex flex-col md:flex-row items-center gap-8 ${isLeft ? "md:flex-row" : "md:flex-row-reverse"
                      }`}
                  >
                    {/* Content Card */}
                    <div className={`flex-1 ${isLeft ? "md:text-right md:pr-12" : "md:text-left md:pl-12"}`}>
                      <div className={`group relative p-6 rounded-2xl bg-[rgba(15,31,54,0.6)] border border-[rgba(72,213,255,0.12)] backdrop-blur-xl hover:border-[rgba(72,213,255,0.3)] transition-all duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.4),0_0_30px_rgba(30,184,255,0.1)] ${isLeft ? "md:ml-auto" : "md:mr-auto"} max-w-lg`}>
                        {/* Gradient Accent */}
                        <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

                        <div className={`flex items-start gap-4 ${isLeft ? "md:flex-row-reverse" : ""}`}>
                          {/* Icon Container - Mobile */}
                          <div className={`md:hidden flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>

                          <div className="flex-1">
                            <h3 className={`text-xl font-display font-semibold text-[var(--text-primary)] mb-2 ${isLeft ? "md:text-right" : ""}`}>
                              {title}
                            </h3>
                            <p className={`text-sm text-[var(--text-secondary)] leading-relaxed ${isLeft ? "md:text-right" : ""}`}>
                              {description}
                            </p>
                          </div>
                        </div>

                        {/* Step Number */}
                        <div className={`absolute -bottom-3 ${isLeft ? "right-6" : "left-6"} px-3 py-1 rounded-full bg-[var(--color-surface-800)] border border-[rgba(72,213,255,0.2)] text-xs font-semibold text-[var(--color-turkish-blue-400)]`}>
                          {String(index + 1).padStart(2, "0")}
                        </div>
                      </div>
                    </div>

                    {/* Center Icon - Desktop */}
                    <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 z-10">
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-[0_8px_30px_rgba(0,0,0,0.3)] ring-4 ring-[var(--color-surface-900)]`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                    </div>

                    {/* Spacer for alignment */}
                    <div className="hidden md:block flex-1" />
                  </motion.div>
                );
              })}
          </div>
        </div>
      </div>
    </section>
  );
}
