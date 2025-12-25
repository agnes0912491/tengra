"use client";

import { Section } from "@/data/api-docs";
import { EndpointCard } from "./EndpointCard";

export function ApiSection({ section }: { section: Section }) {
    return (
        <div id={section.id} className="scroll-mt-24">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-[rgba(30,184,255,0.2)] to-[rgba(139,92,246,0.2)] border border-[rgba(72,213,255,0.2)]">
                    {section.icon}
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-[var(--text-primary)]">{section.title}</h3>
                    <p className="text-sm text-[var(--text-muted)]">{section.description}</p>
                </div>
            </div>
            <div className="space-y-2">
                {section.endpoints.map((endpoint, idx) => (
                    <EndpointCard key={idx} endpoint={endpoint} />
                ))}
            </div>
        </div>
    );
}
