import { getAllProjects } from "@/lib/db";
import type { Project } from "@/types/project";
import Link from "next/link";
import { resolveCdnUrl, getLocalizedText } from "@/lib/constants";
import { cookies, headers } from "next/headers";
import { resolvePreferredLocale } from "@/i18n/resolve-preferred-locale";
import SiteShell from "@/components/layout/site-shell";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
    const cookieStore = await cookies();
    const headersList = await headers();
    const { locale } = resolvePreferredLocale({
        cookieLocale: cookieStore.get("NEXT_LOCALE")?.value,
        acceptLanguage: headersList.get("accept-language"),
    });

    const projects: Project[] = await getAllProjects().catch(() => []);

    return (
        <SiteShell>
            <div className="relative px-6 py-16 md:px-20">
                <h1 className="section-title text-center">Projeler</h1>
                <div className="mx-auto mt-3 mb-10 h-[1px] w-16 bg-[rgba(0,167,197,0.4)]" />

                {projects.length === 0 ? (
                    <p className="mx-auto max-w-2xl text-center text-[rgba(255,255,255,0.7)]">
                        Henüz listelenecek bir proje bulunamadı.
                    </p>
                ) : (
                    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                        {projects.map((proj) => (
                            <Link
                                key={proj.id}
                                href={`/projects/${proj.id}`}
                                className="group rounded-2xl border border-[rgba(110,211,225,0.18)] bg-[rgba(8,28,38,0.55)]/80 p-5 backdrop-blur-xl transition hover:border-[rgba(110,211,225,0.35)] hover:bg-[rgba(8,28,38,0.65)]"
                            >
                                <article>
                                    <header className="mb-3 flex items-center gap-3">
                                        {proj.logoUrl ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={resolveCdnUrl(proj.logoUrl)}
                                                alt="logo"
                                                className="h-8 w-8 rounded object-contain"
                                            />
                                        ) : null}
                                        <h2 className="font-display text-lg tracking-widest text-white">
                                            {proj.name}
                                        </h2>
                                    </header>
                                    {proj.description ? (
                                        <p className="text-sm text-[rgba(255,255,255,0.8)]">
                                            {getLocalizedText(proj.description, locale)}
                                        </p>
                                    ) : null}
                                    <footer className="mt-4 text-xs uppercase tracking-[0.3em] text-[color:var(--color-turkish-blue-200)]">
                                        {proj.status ? formatStatus(proj.status) : ""}
                                    </footer>
                                </article>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </SiteShell>
    );
}

function formatStatus(status?: Project["status"]) {
    switch (status) {
        case "draft":
            return "Taslak";
        case "in_progress":
            return "Geliştiriliyor";
        case "on_hold":
            return "Beklemede";
        case "completed":
            return "Tamamlandı";
        case "archived":
            return "Arşivlendi";
        default:
            return "";
    }
}
