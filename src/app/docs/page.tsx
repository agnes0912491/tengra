"use client";

import { useState } from "react";
import { Book, Shield, Upload, ChevronRight, Menu } from "lucide-react";
import Header from "@/components/layout/header";
import { tengraApi, lovaApi } from "@/data/api-docs";
import { Sidebar } from "@/components/docs/Sidebar";
import { ApiSection } from "@/components/docs/ApiSection";

// Main component
export default function ApiDocsPage() {
  const [activeApi, setActiveApi] = useState("tengra");
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const apis = [tengraApi, lovaApi];
  const currentApi = apis.find(api => api.id === activeApi);

  // Filter sections based on search
  const filteredSections = currentApi?.sections.filter(section => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      section.title.toLowerCase().includes(query) ||
      section.endpoints.some(
        ep => ep.path.toLowerCase().includes(query) || ep.description.toLowerCase().includes(query)
      )
    );
  });

  return (
    <div className="min-h-screen bg-[var(--color-surface-900)]">
      <Header />

      {/* Hero */}
      <div className="relative overflow-hidden pt-16">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute w-[800px] h-[800px] bg-[radial-gradient(circle_at_center,rgba(30,184,255,0.12),transparent_50%)] -top-40 -left-40 blur-3xl" />
          <div className="absolute w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.1),transparent_55%)] top-0 right-[-200px] blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 py-16">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[rgba(30,184,255,0.1)] border border-[rgba(72,213,255,0.2)] mb-4">
                <Book className="w-4 h-4 text-[var(--color-turkish-blue-400)]" />
                <span className="text-xs font-medium text-[var(--color-turkish-blue-300)]">API Documentation</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[var(--text-primary)] mb-3">
                Tengra & Lova API
              </h1>
              <p className="text-lg text-[var(--text-secondary)] max-w-2xl">
                Tüm endpoint&apos;ler, authentication kuralları ve kullanım örnekleri tek bir yerde.
              </p>
            </div>

            {/* Status Card */}
            <div className="flex-shrink-0 p-5 rounded-2xl bg-[rgba(2,6,23,0.8)] backdrop-blur-xl border border-[rgba(72,213,255,0.15)] shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
              <div className="flex items-center gap-3 mb-4">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                </span>
                <span className="text-sm font-semibold text-[var(--text-primary)]">Tüm sistemler çalışıyor</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-[var(--text-muted)] text-xs mb-1">Tengra Core</p>
                  <p className="text-emerald-400 font-mono">api.tengra.studio</p>
                </div>
                <div>
                  <p className="text-[var(--text-muted)] text-xs mb-1">Lova API</p>
                  <p className="text-emerald-400 font-mono">api.lova.tengra.studio</p>
                </div>
                <div>
                  <p className="text-[var(--text-muted)] text-xs mb-1">CDN</p>
                  <p className="text-[var(--text-secondary)] font-mono text-xs">cdn.tengra.studio</p>
                </div>
                <div>
                  <p className="text-[var(--text-muted)] text-xs mb-1">Version</p>
                  <p className="text-[var(--text-secondary)] font-mono text-xs">v1.0</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu button */}
      <div className="lg:hidden fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="p-4 rounded-full bg-gradient-to-r from-[var(--color-turkish-blue-500)] to-[var(--color-turkish-blue-600)] text-white shadow-[0_8px_32px_rgba(30,184,255,0.4)]"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Main Content */}
      <div className="relative mx-auto max-w-7xl px-6 pb-20">
        <div className="flex gap-8">
          {/* Sidebar */}
          <Sidebar
            apis={apis}
            activeApi={activeApi}
            setActiveApi={setActiveApi}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            isMobileOpen={isMobileOpen}
            setIsMobileOpen={setIsMobileOpen}
          />

          {/* Content */}
          <main className="flex-1 min-w-0">
            {/* Auth Info Banner */}
            <div className="mb-8 p-4 rounded-2xl bg-gradient-to-r from-[rgba(30,184,255,0.1)] to-[rgba(139,92,246,0.1)] border border-[rgba(72,213,255,0.15)]">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-[var(--color-turkish-blue-400)] mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-[var(--text-primary)] mb-1">Authentication</p>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Korumalı endpoint&apos;ler için <code className="px-1.5 py-0.5 rounded bg-[rgba(0,0,0,0.3)] text-[var(--color-turkish-blue-300)]">Authorization: Bearer &lt;token&gt;</code> header&apos;ı gereklidir.
                  </p>
                </div>
              </div>
            </div>

            {/* Sections */}
            <div className="space-y-10">
              {filteredSections?.map((section) => (
                <ApiSection key={section.id} section={section} />
              ))}
            </div>

            {/* CDN Info */}
            <div className="mt-12 p-6 rounded-2xl bg-[rgba(2,6,23,0.5)] border border-[rgba(72,213,255,0.1)]">
              <div className="flex items-center gap-3 mb-4">
                <Upload className="w-5 h-5 text-[var(--color-turkish-blue-400)]" />
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">CDN & Uploads</h3>
              </div>
              <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
                  CDN Base URL: <code className="px-1.5 py-0.5 rounded bg-[rgba(0,0,0,0.3)] text-emerald-400">cdn.tengra.studio</code>
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
                  Avatar ve medya dosyaları CDN üzerinden sunulur
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
                  Production&apos;da lokal <code className="px-1.5 py-0.5 rounded bg-[rgba(0,0,0,0.3)]">uploads/</code> dizini yayına açık değildir
                </li>
              </ul>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
