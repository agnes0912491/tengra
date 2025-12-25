"use client";

import { useTranslation } from "@tengra/language";

const testimonialKeys = ["alex", "sarah", "marcus", "elena", "david"] as const;

export default function Testimonials() {
    const { t } = useTranslation("TestimonialsMarquee");
    const testimonials = testimonialKeys.map((key) => ({
        name: t(`items.${key}.name`),
        role: t(`items.${key}.role`),
        text: t(`items.${key}.text`),
    }));

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
