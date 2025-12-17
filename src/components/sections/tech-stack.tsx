"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Shield } from "lucide-react"; // Keep Lucide icon or use SiLucide if available (keeping Shield for safety)
// Import brand icons
import {
    SiNextdotjs,
    SiReact,
    SiTypescript,
    SiNodedotjs,
    SiTailwindcss,
    SiFramer,
    SiRadixui
} from "react-icons/si";

// Realistic Tech Stack based on user feedback and project scan
// Realistic Tech Stack based on package.json
const tools = [
    { name: "Next.js", icon: SiNextdotjs },
    { name: "React", icon: SiReact },
    { name: "TypeScript", icon: SiTypescript },
    { name: "Node.js", icon: SiNodedotjs },
    { name: "Tailwind CSS", icon: SiTailwindcss },
    { name: "Framer Motion", icon: SiFramer },
    { name: "Radix UI", icon: SiRadixui },
    { name: "Lucide", icon: Shield },
];



// Duplicate for marquee effect
const marqueeTools = [...tools, ...tools, ...tools];

export default function TechStack() {
    const t = useTranslations("TechStack");

    return (
        <section className="py-16 overflow-hidden bg-[rgba(255,255,255,0.02)] border-y border-[rgba(255,255,255,0.05)]">
            <div className="container mx-auto px-4 mb-10 text-center">
                <p className="text-sm font-bold text-[rgba(255,255,255,0.4)] uppercase tracking-[0.2em]">
                    {t("title")}
                </p>
            </div>

            <div className="relative flex w-full max-w-[100vw] overflow-hidden">
                {/* Gradients to fade edges */}
                <div className="absolute left-0 top-0 bottom-0 w-32 z-10 bg-gradient-to-r from-[var(--color-background)] to-transparent pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-32 z-10 bg-gradient-to-l from-[var(--color-background)] to-transparent pointer-events-none" />

                <motion.div
                    className="flex gap-16 items-center whitespace-nowrap px-4"
                    animate={{ x: [0, -1000] }} // Adjust depending on total width, simpler marquee
                    transition={{
                        repeat: Infinity,
                        duration: 40,
                        ease: "linear",
                    }}
                >
                    {marqueeTools.map((tool, i) => (
                        <div key={i} className="flex items-center gap-4 text-[rgba(255,255,255,0.4)] transition-all duration-300 hover:text-white hover:scale-110 cursor-default group grayscale hover:grayscale-0">
                            <tool.icon className="w-8 h-8 group-hover:text-[var(--color-turkish-blue-400)] transition-colors" />
                            <span className="text-xl font-bold font-display tracking-wide">{tool.name}</span>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
