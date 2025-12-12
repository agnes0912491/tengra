import SiteShell from "@/components/layout/site-shell";

export const dynamic = "force-dynamic";

export default function PrivacyPage() {
  return (
    <SiteShell disableAnimation>
      <div className="mx-auto max-w-4xl px-4 py-16 space-y-10 text-[color:var(--foreground)]">
        <header className="space-y-3">
          <p className="text-[11px] uppercase tracking-[0.3em] text-[color:var(--color-turkish-blue-300)]">
            Privacy Notice
          </p>
          <h1 className="text-3xl font-display tracking-[0.08em] text-white">Privacy Policy</h1>
          <p className="text-sm text-[color:var(--text-muted)]">
            How Tengra collects, uses, and protects your information across our websites, forum, and admin tools.
          </p>
        </header>

        <section className="space-y-3 rounded-2xl border border-[rgba(110,211,225,0.15)] bg-[rgba(6,18,26,0.75)] p-6 shadow-[0_22px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <h2 className="text-lg font-semibold text-white">What we collect</h2>
          <ul className="list-disc space-y-2 pl-5 text-sm text-[color:var(--text-muted)]">
            <li>Account details you provide (email, username) for forum or admin access.</li>
            <li>Content you submit (messages, comments, uploads) when using our services.</li>
            <li>Usage data (pages visited, approximate locale, device/user-agent) for analytics and security.</li>
            <li>Cookies to remember language, sessions, and consent preferences.</li>
          </ul>
        </section>

        <section className="space-y-3 rounded-2xl border border-[rgba(110,211,225,0.15)] bg-[rgba(6,18,26,0.75)] p-6 shadow-[0_22px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <h2 className="text-lg font-semibold text-white">How we use it</h2>
          <ul className="list-disc space-y-2 pl-5 text-sm text-[color:var(--text-muted)]">
            <li>To provide the site, forum, and admin dashboards securely.</li>
            <li>To understand performance and fix issues through aggregated analytics.</li>
            <li>To communicate updates or respond to your requests.</li>
            <li>To prevent abuse and protect the service from fraud or spam.</li>
          </ul>
        </section>

        <section className="space-y-3 rounded-2xl border border-[rgba(110,211,225,0.15)] bg-[rgba(6,18,26,0.75)] p-6 shadow-[0_22px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <h2 className="text-lg font-semibold text-white">Sharing</h2>
          <p className="text-sm text-[color:var(--text-muted)]">
            We do not sell your data. Limited third parties help us run the service (hosting, analytics, CDN). They may
            process data under strict contractual terms and only for operating the site.
          </p>
        </section>

        <section className="space-y-3 rounded-2xl border border-[rgba(110,211,225,0.15)] bg-[rgba(6,18,26,0.75)] p-6 shadow-[0_22px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <h2 className="text-lg font-semibold text-white">Data retention & security</h2>
          <p className="text-sm text-[color:var(--text-muted)]">
            We keep personal data only as long as necessary for the purposes above or legal obligations. We apply access
            controls, encryption in transit, and regular monitoring, but no system is perfectly secure.
          </p>
        </section>

        <section className="space-y-3 rounded-2xl border border-[rgba(110,211,225,0.15)] bg-[rgba(6,18,26,0.75)] p-6 shadow-[0_22px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <h2 className="text-lg font-semibold text-white">Your choices</h2>
          <ul className="list-disc space-y-2 pl-5 text-sm text-[color:var(--text-muted)]">
            <li>Update or delete your account by contacting us or via available profile tools.</li>
            <li>Manage cookies via your browser; blocking strictly necessary cookies may limit functionality.</li>
            <li>Opt out of marketing emails via provided links (if we send any).</li>
          </ul>
        </section>

        <section className="space-y-2 rounded-2xl border border-[rgba(110,211,225,0.15)] bg-[rgba(6,18,26,0.75)] p-6 shadow-[0_22px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <h2 className="text-lg font-semibold text-white">Contact</h2>
          <p className="text-sm text-[color:var(--text-muted)]">
            Questions or requests? Email us at{" "}
            <a className="text-[color:var(--color-turkish-blue-300)] underline" href="mailto:hello@tengra.studio">
              hello@tengra.studio
            </a>
            .
          </p>
        </section>
      </div>
    </SiteShell>
  );
}
