"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Code, Globe, Infinity, Sparkles, Zap } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

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
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll progress for the entire section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });

  const beamHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

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

  const activeGoals = adminGoals.length > 0
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
    }));

  return (
    <section ref={containerRef} id="goals" className="relative py-32 md:py-48 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-full bg-[linear-gradient(90deg,transparent,rgba(30,184,255,0.03),transparent)]" />
        <div className="absolute top-1/4 left-0 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(30,184,255,0.04)_0%,transparent_70%)] blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(72,213,255,0.04)_0%,transparent_70%)] blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-24 md:mb-32"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(30,184,255,0.1)] border border-[rgba(30,184,255,0.2)] mb-6">
            <span className="w-2 h-2 rounded-full bg-[var(--color-turkish-blue-400)] animate-pulse" />
            <span className="text-xs font-medium text-[var(--color-turkish-blue-300)] uppercase tracking-widest">Roadmap</span>
          </div>
          <h2 className="section-title text-4xl md:text-5xl lg:text-6xl mb-6">{t("title")}</h2>
          <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto">
            Our journey from concept to reality, building the future one milestone at a time.
          </p>
        </motion.div>

        {/* Constellation Timeline */}
        <div className="relative">
          {/* Central Beam Container */}
          <div className="absolute left-[20px] md:left-1/2 top-0 bottom-0 w-px -translate-x-1/2 md:-translate-x-1/2 bg-[rgba(255,255,255,0.05)]">
            {/* The Active Beam */}
            <motion.div
              style={{ height: beamHeight }}
              className="absolute top-0 left-0 w-full bg-gradient-to-b from-[var(--color-turkish-blue-400)] via-[var(--color-turkish-blue-500)] to-[var(--color-turkish-blue-300)] shadow-[0_0_15px_rgba(30,184,255,0.5)]"
            />
          </div>

          <div className="space-y-24 md:space-y-32 pl-12 md:pl-0">
            {activeGoals.map(({ icon: Icon, color, title, description }, index) => {
              const isLeft = index % 2 === 0;

              return (
                <div key={`${title}-${index}`} className="relative">
                  {/* Timeline Node (Stargate) */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    viewport={{ once: true, margin: "-100px" }}
                    className="absolute left-[-29px] md:left-1/2 top-0 md:-translate-x-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-[18px] h-[18px]"
                  >
                    <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${color} blur-sm opacity-50 animate-pulse`} />
                    <div className="w-3 h-3 rounded-full bg-[var(--color-surface-900)] border-2 border-[var(--color-turkish-blue-400)] shadow-[0_0_10px_var(--color-turkish-blue-400)]" />
                  </motion.div>

                  {/* Content Layout */}
                  <div className={`flex flex-col md:flex-row items-center gap-8 md:gap-24 ${!isLeft ? "md:flex-row-reverse" : ""}`}>

                    {/* Empty spacer for opposite side */}
                    <div className="hidden md:block flex-1" />

                    {/* Content Card */}
                    <motion.div
                      initial={{ opacity: 0, x: isLeft ? -50 : 50, rotateY: isLeft ? 15 : -15 }}
                      whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      viewport={{ once: true, margin: "-50px" }}
                      className="flex-1 w-full"
                    >
                      <div className="group relative p-1 rounded-3xl bg-gradient-to-br from-[rgba(255,255,255,0.05)] to-transparent hover:from-[var(--color-turkish-blue-500)]/30 transition-all duration-500">
                        {/* Inner Glass Card */}
                        <div className="relative h-full p-8 rounded-[22px] bg-[rgba(15,31,54,0.85)] border border-[rgba(72,213,255,0.1)] backdrop-blur-2xl overflow-hidden">
                          {/* Hover Glow */}
                          <div className={`absolute top-0 right-0 w-[300px] h-[300px] rounded-full bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 blur-[80px] transition-opacity duration-700 pointer-events-none`} />

                          <div className="relative z-10">
                            {/* Icon & Number Header */}
                            <div className="flex items-center justify-between mb-6">
                              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} p-0.5 shadow-lg`}>
                                <div className="w-full h-full rounded-[10px] bg-[var(--color-surface-800)] flex items-center justify-center">
                                  <Icon className="w-6 h-6 text-white" />
                                </div>
                              </div>
                              <span className="text-4xl font-display font-bold text-[rgba(255,255,255,0.05)] group-hover:text-[rgba(255,255,255,0.1)] transition-colors">
                                {String(index + 1).padStart(2, "0")}
                              </span>
                            </div>

                            <h3 className="text-2xl font-display font-bold text-[var(--text-primary)] mb-3 group-hover:text-[var(--color-turkish-blue-300)] transition-colors">
                              {title}
                            </h3>
                            <p className="text-[var(--text-secondary)] leading-relaxed">
                              {description}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
