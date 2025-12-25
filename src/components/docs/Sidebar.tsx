"use client";

import { Search, X, Globe, Server } from "lucide-react";
import { ApiDoc } from "@/data/api-docs";
import { ApiCard } from "./ApiCard";

interface SidebarProps {
    apis: ApiDoc[];
    activeApi: string;
    setActiveApi: (id: string) => void;
    searchQuery: string;
    setSearchQuery: (q: string) => void;
    isMobileOpen: boolean;
    setIsMobileOpen: (open: boolean) => void;
}

export function Sidebar({
    apis,
    activeApi,
    setActiveApi,
    searchQuery,
    setSearchQuery,
    isMobileOpen,
    setIsMobileOpen
}: SidebarProps) {
    const currentApi = apis.find(api => api.id === activeApi);

    return (
        <>
            {/* Mobile overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
        fixed lg:sticky top-16 left-0 z-50 lg:z-0
        w-80 h-[calc(100vh-4rem)] 
        bg-[rgba(2,6,23,0.95)] lg:bg-transparent
        border-r border-[rgba(72,213,255,0.1)] lg:border-none
        transform transition-transform duration-300
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        overflow-y-auto
        p-6
      `}>
                {/* Mobile close button */}
                <button
                    onClick={() => setIsMobileOpen(false)}
                    className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 lg:hidden"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Search */}
                <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                    <input
                        id="docs-search"
                        name="search"
                        type="search"
                        autoComplete="off"
                        aria-label="Endpoint ara"
                        placeholder="Endpoint ara..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[rgba(0,0,0,0.3)] border border-[rgba(72,213,255,0.15)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[rgba(72,213,255,0.3)]"
                    />
                </div>

                {/* API Selector */}
                <div className="space-y-3 mb-8">
                    {apis.map((api) => (
                        <ApiCard
                            key={api.id}
                            api={api}
                            isActive={activeApi === api.id}
                            onClick={() => setActiveApi(api.id)}
                        />
                    ))}
                </div>

                {/* Section Navigation */}
                {currentApi && (
                    <div>
                        <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">
                            Bölümler
                        </p>
                        <nav className="space-y-1">
                            {currentApi.sections.map((section) => (
                                <a
                                    key={section.id}
                                    href={`#${section.id}`}
                                    onClick={() => setIsMobileOpen(false)}
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[rgba(30,184,255,0.1)] transition-colors"
                                >
                                    {section.icon}
                                    {section.title}
                                </a>
                            ))}
                        </nav>
                    </div>
                )}

                {/* Base URL Info */}
                {currentApi && (
                    <div className="mt-8 p-4 rounded-xl bg-[rgba(0,0,0,0.3)] border border-[rgba(72,213,255,0.1)]">
                        <p className="text-xs font-semibold text-[var(--text-muted)] mb-2">Base URL</p>
                        <div className="flex items-center gap-2 mb-2">
                            <Globe className="w-4 h-4 text-emerald-400" />
                            <code className="text-xs text-[var(--text-secondary)]">{currentApi.baseUrl}</code>
                        </div>
                        <div className="flex items-center gap-2">
                            <Server className="w-4 h-4 text-amber-400" />
                            <code className="text-xs text-[var(--text-secondary)]">{currentApi.localUrl}</code>
                        </div>
                    </div>
                )}
            </aside>
        </>
    );
}
