"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { CopyButton } from "./CopyButton";
import { Endpoint, HttpMethod } from "@/data/api-docs";

const methodColors: Record<HttpMethod, string> = {
    GET: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    POST: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    PATCH: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    DELETE: "bg-red-500/20 text-red-400 border-red-500/30",
    PUT: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

export function EndpointCard({ endpoint }: { endpoint: Endpoint }) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="group rounded-xl border border-[rgba(72,213,255,0.1)] bg-[rgba(2,6,23,0.5)] hover:border-[rgba(72,213,255,0.2)] transition-all duration-200">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full px-4 py-3 flex items-center gap-3"
            >
                <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${methodColors[endpoint.method]}`}>
                    {endpoint.method}
                </span>
                <code className="flex-1 text-left text-sm font-mono text-[var(--text-primary)]">
                    {endpoint.path}
                </code>
                <div className="flex items-center gap-2">
                    {endpoint.auth && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            Auth
                        </span>
                    )}
                    {endpoint.admin && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                            Admin
                        </span>
                    )}
                    <ChevronRight className={`w-4 h-4 text-[var(--text-muted)] transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                </div>
            </button>

            {isExpanded && (
                <div className="px-4 pb-4 pt-2 border-t border-[rgba(72,213,255,0.1)] space-y-3">
                    <p className="text-sm text-[var(--text-secondary)]">{endpoint.description}</p>

                    {endpoint.body && (
                        <div>
                            <p className="text-xs font-semibold text-[var(--text-muted)] mb-2">Request Body</p>
                            <div className="flex items-center gap-2 p-3 rounded-lg bg-[rgba(0,0,0,0.3)] border border-[rgba(72,213,255,0.1)]">
                                <code className="flex-1 text-xs font-mono text-[var(--text-secondary)]">
                                    {`{ ${endpoint.body.join(", ")} }`}
                                </code>
                                <CopyButton text={`{ ${endpoint.body.join(", ")} }`} />
                            </div>
                        </div>
                    )}

                    {endpoint.response && (
                        <div>
                            <p className="text-xs font-semibold text-[var(--text-muted)] mb-2">Response</p>
                            <div className="flex items-center gap-2 p-3 rounded-lg bg-[rgba(0,0,0,0.3)] border border-[rgba(72,213,255,0.1)]">
                                <code className="flex-1 text-xs font-mono text-emerald-400">
                                    {endpoint.response}
                                </code>
                                <CopyButton text={endpoint.response} />
                            </div>
                        </div>
                    )}

                    {endpoint.note && (
                        <p className="text-xs text-[var(--text-muted)] italic">
                            📌 {endpoint.note}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
