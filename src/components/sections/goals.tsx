"use client";

import { motion } from "framer-motion";
import { Code, Globe, Infinity, Sparkles, Zap } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";

type GoalKey = "inception" | "creation" | "expansion" | "harmony" | "beyond";

type GoalDefinition = {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  key: GoalKey;
};

const goals: GoalDefinition[] = [
  { icon: Sparkles, key: "inception" },
  { icon: Code, key: "creation" },
  { icon: Globe, key: "expansion" },
  { icon: Infinity, key: "harmony" },
  { icon: Zap, key: "beyond" },
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
    <section id="goals" className="relative flex flex-col items-center justify-center py-32 px-4 text-center">
      <h2 className="section-title neon-text">{t("title")}</h2>
      <div className="w-16 h-[1px] mx-auto mt-3 mb-10 bg-[rgba(0,167,197,0.4)]" />
      <div className="absolute left-1/2 top-0 -translate-x-1/2 h-full w-[2px] timeline-line opacity-30" />

      <div className="relative w-full max-w-3xl mx-auto">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 h-full w-[2px] bg-[rgba(0,167,197,0.2)]" />

        <ol className="space-y-16 relative z-10">
          {(adminGoals.length > 0
            ? adminGoals.map((g, idx) => ({ icon: goals[idx % goals.length].icon, title: g.title, description: g.body }))
            : goals.map(({ icon, key }) => ({ icon, title: t(`items.${key}.title` as const), description: t(`items.${key}.description` as const) }))
          ).map(({ icon: Icon, title, description }, index) => {
            const isLeft = index % 2 === 0;

            return (
              <motion.li
                key={`${title}-${index}`}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                className={`relative flex flex-col ${isLeft ? "md:flex-row-reverse" : "md:flex-row"} items-center justify-between gap-6`}
              >
                <div className="absolute left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-[rgba(0,167,197,0.1)] border border-[rgba(0,167,197,0.4)] flex items-center justify-center shadow-[0_0_12px_rgba(0,167,197,0.4)]">
                  <Icon className="w-3.5 h-3.5 text-[color:var(--color-turkish-blue-400)]" />
                </div>

                <div className={`relative mt-12 w-full md:w-[46%] ${isLeft ? "md:ml-auto" : "md:mr-auto"}`}>
                  <div className="p-[1px] rounded-2xl bg-gradient-to-br from-[rgba(110,211,225,0.25)]/40 via-transparent to-transparent">
                    <div className="rounded-[calc(1rem-1px)] border border-[rgba(110,211,225,0.18)] bg-[rgba(6,20,27,0.6)]/80 backdrop-blur-xl p-6 shadow-[0_25px_70px_rgba(0,0,0,0.45)]">
                      <h3 className="text-xl font-display text-[color:var(--color-turkish-blue-300)] mb-2">{title}</h3>
                      <p className="text-sm text-[color:var(--text-muted)]">{description}</p>
                    </div>
                  </div>
                </div>
              </motion.li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
