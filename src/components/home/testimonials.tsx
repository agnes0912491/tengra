"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

const testimonials = [
    {
        name: "Alex Rivera",
        role: "CTO, FinTech Co.",
        text: "Tengra transformed our infrastructure. The reliability is unmatched."
    },
    {
        name: "Sarah Chen",
        role: "Product Lead, StartUp Inc",
        text: "Incredible attention to detail. The UI polishing is world-class."
    },
    {
        name: "Marcus Johnson",
        role: "Founder, DevTools",
        text: "Fastest delivery we've ever seen without compromising quality."
    },
    {
        name: "Elena G.",
        role: "Director of Engineering",
        text: "A true partner in development. Solved complex scaling issues effortlessly."
    },
    {
        name: "David Kim",
        role: "Senior PM",
        text: "The 3D visualizations blew our investors away. Highly recommended."
    }
];

export default function Testimonials() {
    return (
        <div className="relative flex w-full flex-col items-center justify-center overflow-hidden py-10">
            <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-[#030c12] to-transparent z-10" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-[#030c12] to-transparent z-10" />

            <div className="flex w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)]">
                <div className="flex min-w-full shrink-0 animate-marquee gap-6 py-4">
                    {testimonials.map((item, idx) => (
                        <TestimonialCard key={idx} {...item} />
                    ))}
                    {testimonials.map((item, idx) => (
                        <TestimonialCard key={`dup-${idx}`} {...item} />
                    ))}
                </div>
            </div>
        </div>
    );
}

function TestimonialCard({ name, role, text }: { name: string; role: string; text: string }) {
    return (
        <div className="relative h-full w-[350px] shrink-0 rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] p-6 backdrop-blur-sm transition-colors hover:bg-[rgba(255,255,255,0.04)]">
            <blockquote className="text-sm leading-relaxed text-[rgba(255,255,255,0.8)]">
                "{text}"
            </blockquote>
            <div className="mt-4 flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[var(--color-turkish-blue-400)] to-purple-600" />
                <div>
                    <p className="text-sm font-semibold text-white">{name}</p>
                    <p className="text-xs text-[rgba(255,255,255,0.5)]">{role}</p>
                </div>
            </div>
        </div>
    );
}
