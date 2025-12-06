"use client";

import { useState } from "react";
import {
  Book,
  Shield,
  Zap,
  Users,
  Bell,
  Key,
  Upload,
  Globe,
  Copy,
  Check,
  ChevronRight,
  Search,
  Menu,
  X,
  Server
} from "lucide-react";
import Header from "@/components/layout/header";

// Types
type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE" | "PUT";

type Endpoint = {
  method: HttpMethod;
  path: string;
  description: string;
  auth?: boolean;
  admin?: boolean;
  body?: string[];
  response?: string;
  note?: string;
};

type Section = {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  endpoints: Endpoint[];
};

type ApiDoc = {
  id: string;
  title: string;
  subtitle: string;
  baseUrl: string;
  localUrl: string;
  sections: Section[];
};

// Method badge colors
const methodColors: Record<HttpMethod, string> = {
  GET: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  POST: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  PATCH: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  DELETE: "bg-red-500/20 text-red-400 border-red-500/30",
  PUT: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

// API Documentation Data
const tengraApi: ApiDoc = {
  id: "tengra",
  title: "Tengra Core API",
  subtitle: "Auth ve kullanıcı yönetimi",
  baseUrl: "https://api.tengra.studio",
  localUrl: "http://localhost:5000",
  sections: [
    {
      id: "health",
      title: "Health",
      icon: <Zap className="w-5 h-5" />,
      description: "Sistem durumu kontrolü",
      endpoints: [
        { method: "GET", path: "/health", description: "Sistem durumu", response: "{ status, service, version, timestamp }" },
      ],
    },
    {
      id: "auth",
      title: "Authentication",
      icon: <Key className="w-5 h-5" />,
      description: "Oturum yönetimi",
      endpoints: [
        { method: "POST", path: "/auth/login", description: "Giriş yap", body: ["email | username", "password"], response: "{ token, user }" },
        { method: "POST", path: "/auth/register", description: "Kayıt ol", body: ["username", "email", "password", "displayName", "phone?"] },
      ],
    },
    {
      id: "notifications",
      title: "Notifications",
      icon: <Bell className="w-5 h-5" />,
      description: "Bildirim yönetimi",
      endpoints: [
        { method: "GET", path: "/notifications", description: "Bildirimleri listele", auth: true },
        { method: "POST", path: "/notifications/:id/read", description: "Okundu işaretle", auth: true },
      ],
    },
  ],
};

const lovaApi: ApiDoc = {
  id: "lova",
  title: "Lova API",
  subtitle: "Mobil/web için auth, profil, partner ve notification uçları",
  baseUrl: "https://api.lova.tengra.studio",
  localUrl: "http://localhost:4001",
  sections: [
    {
      id: "lova-auth",
      title: "Authentication",
      icon: <Key className="w-5 h-5" />,
      description: "Kullanıcı kimlik doğrulama",
      endpoints: [
        { method: "POST", path: "/auth/register", description: "Kayıt ol", body: ["email", "password", "firstName", "lastName", "username", "...profil alanları"] },
        { method: "POST", path: "/auth/login", description: "Giriş yap", body: ["email", "password"] },
        { method: "GET", path: "/auth/me", description: "Mevcut kullanıcı bilgisi", auth: true },
        { method: "POST", path: "/auth/logout", description: "Çıkış yap", auth: true },
      ],
    },
    {
      id: "lova-profile",
      title: "Profile & Preferences",
      icon: <Users className="w-5 h-5" />,
      description: "Profil ve tercih yönetimi",
      endpoints: [
        { method: "GET", path: "/account/profile", description: "Profil bilgilerini getir", auth: true },
        { method: "POST", path: "/account/profile", description: "Profil güncelle", auth: true, body: ["displayName", "bio", "avatar", "locationLabel", "tags", "hobbies", "orientation", "lookingFor", "musicTastes"] },
        { method: "GET", path: "/account/preferences", description: "Tercihleri getir", auth: true, response: "{ privacy, notifications }" },
        { method: "POST", path: "/account/preferences", description: "Tercihleri güncelle", auth: true, body: ["privacy", "notifications"] },
      ],
    },
    {
      id: "lova-partner",
      title: "Partner Links",
      icon: <Shield className="w-5 h-5" />,
      description: "Partner bağlantı yönetimi",
      endpoints: [
        { method: "GET", path: "/account/partner-links", description: "Partner bağlantılarını listele", auth: true },
        { method: "POST", path: "/account/partner-links/:id/status", description: "Bağlantı durumunu güncelle", auth: true, body: ["status: Accepted | Rejected"] },
      ],
    },
    {
      id: "lova-notifications",
      title: "Notifications",
      icon: <Bell className="w-5 h-5" />,
      description: "Bildirim yönetimi",
      endpoints: [
        { method: "GET", path: "/notifications", description: "Bildirimleri listele", auth: true },
        { method: "POST", path: "/notifications/:id/read", description: "Okundu işaretle", auth: true },
      ],
    },
  ],
};

// Copy button component
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
      title="Kopyala"
    >
      {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-[var(--text-muted)]" />}
    </button>
  );
}

// Endpoint card component
function EndpointCard({ endpoint }: { endpoint: Endpoint }) {
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

// Section component
function ApiSection({ section }: { section: Section }) {
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

// API Card component
function ApiCard({ api, isActive, onClick }: { api: ApiDoc; isActive: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 ${isActive
        ? "bg-gradient-to-br from-[rgba(30,184,255,0.15)] to-[rgba(139,92,246,0.1)] border-[rgba(72,213,255,0.3)] shadow-[0_0_30px_rgba(30,184,255,0.15)]"
        : "bg-[rgba(2,6,23,0.5)] border-[rgba(72,213,255,0.1)] hover:border-[rgba(72,213,255,0.2)]"
        }`}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className={`font-semibold ${isActive ? "text-[var(--color-turkish-blue-300)]" : "text-[var(--text-primary)]"}`}>
          {api.title}
        </h3>
        {isActive && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
      </div>
      <p className="text-sm text-[var(--text-muted)]">{api.subtitle}</p>
    </button>
  );
}

// Sidebar component
function Sidebar({
  apis,
  activeApi,
  setActiveApi,
  searchQuery,
  setSearchQuery,
  isMobileOpen,
  setIsMobileOpen
}: {
  apis: ApiDoc[];
  activeApi: string;
  setActiveApi: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}) {
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
            type="text"
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
