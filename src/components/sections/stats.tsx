"use client";

import { motion, useInView } from "framer-motion";
import { useTranslation } from "@tengra/language";
import { useRef, useEffect, useState } from "react";

const Counter = ({ to, suffix = "" }: { to: number; suffix?: string }) => {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    useEffect(() => {
        if (isInView) {
            const duration = 2000; // ms
            const steps = 60;
            const stepTime = duration / steps;
            let current = 0;
            const increment = to / steps;

            const timer = setInterval(() => {
                current += increment;
                if (current >= to) {
                    setCount(to);
                    clearInterval(timer);
                } else {
                    setCount(Math.floor(current));
                }
            }, stepTime);

            return () => clearInterval(timer);
        }
    }, [isInView, to]);

    return (
        <span ref={ref} className="tabular-nums">
            {count}
            {suffix}
        </span>
    );
};

export default function Stats() {
    const { t } = useTranslation("Stats");

    const stats = [
        { key: "projects", value: 42, suffix: "+" },
        { key: "experience", value: 8, suffix: "" },
        { key: "clients", value: 35, suffix: "+" },
        { key: "coffee", value: 1200, suffix: "+" },
    ];

    return (
        <section className="py-20 border-y border-[rgba(255,255,255,0.05)] bg-[rgba(6,20,27,0.5)]">
            <div className="container mx-auto px-4 max-w-7xl">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={stat.key}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="text-center"
                        >
                            <div className="text-4xl md:text-6xl font-bold text-white mb-2 font-display bg-clip-text text-transparent bg-gradient-to-b from-white to-[rgba(255,255,255,0.5)]">
                                <Counter to={stat.value} suffix={stat.suffix} />
                            </div>
                            <p className="text-sm md:text-base text-[var(--color-turkish-blue-400)] uppercase tracking-widest font-medium">
                                {t(stat.key)}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
