import SiteShell from "@/components/layout/site-shell";

export const dynamic = "force-dynamic";

export default function TermsPage() {
  return (
    <SiteShell disableAnimation>
      <div className="mx-auto max-w-4xl px-4 py-16 space-y-10 text-[color:var(--foreground)]">
        <header className="space-y-3">
          <p className="text-[11px] uppercase tracking-[0.3em] text-[color:var(--color-turkish-blue-300)]">
            Terms of Use
          </p>
          <h1 className="text-3xl font-display tracking-[0.08em] text-white">Terms &amp; Conditions</h1>
          <p className="text-sm text-[color:var(--text-muted)]">
            The rules for using Tengra sites, forums, and admin tools. By accessing our services, you agree to these terms.
          </p>
        </header>

        <section className="space-y-3 rounded-2xl border border-[rgba(110,211,225,0.15)] bg-[rgba(6,18,26,0.75)] p-6 shadow-[0_22px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <h2 className="text-lg font-semibold text-white">Accounts & access</h2>
          <ul className="list-disc space-y-2 pl-5 text-sm text-[color:var(--text-muted)]">
            <li>Provide accurate registration details and keep credentials confidential.</li>
            <li>You are responsible for activities under your account; notify us of any unauthorized use.</li>
            <li>Admin areas are restricted to authorized users only.</li>
          </ul>
        </section>

        <section className="space-y-3 rounded-2xl border border-[rgba(110,211,225,0.15)] bg-[rgba(6,18,26,0.75)] p-6 shadow-[0_22px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <h2 className="text-lg font-semibold text-white">Acceptable use</h2>
          <ul className="list-disc space-y-2 pl-5 text-sm text-[color:var(--text-muted)]">
            <li>No illegal, abusive, fraudulent, or infringing content or behavior.</li>
            <li>Do not attempt to disrupt, reverse engineer, or overload our services.</li>
            <li>Respect the community: no harassment, hate speech, or spam.</li>
          </ul>
        </section>

        <section className="space-y-3 rounded-2xl border border-[rgba(110,211,225,0.15)] bg-[rgba(6,18,26,0.75)] p-6 shadow-[0_22px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <h2 className="text-lg font-semibold text-white">Content & ownership</h2>
          <p className="text-sm text-[color:var(--text-muted)]">
            You retain rights to your content but grant us a limited license to host and display it on our services.
            Tengra retains all rights to site design, code, trademarks, and original assets.
          </p>
        </section>

        <section className="space-y-3 rounded-2xl border border-[rgba(110,211,225,0.15)] bg-[rgba(6,18,26,0.75)] p-6 shadow-[0_22px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <h2 className="text-lg font-semibold text-white">Disclaimers & liability</h2>
          <p className="text-sm text-[color:var(--text-muted)]">
            Services are provided “as-is” without warranties. To the fullest extent permitted by law, Tengra is not liable
            for indirect or consequential damages arising from your use of the services.
          </p>
        </section>

        <section className="space-y-3 rounded-2xl border border-[rgba(110,211,225,0.15)] bg-[rgba(6,18,26,0.75)] p-6 shadow-[0_22px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <h2 className="text-lg font-semibold text-white">Termination</h2>
          <p className="text-sm text-[color:var(--text-muted)]">
            We may suspend or terminate access for violations of these terms or legal requirements. You may stop using the
            services at any time; some data may remain where required by law or legitimate interests.
          </p>
        </section>

        <section className="space-y-2 rounded-2xl border border-[rgba(110,211,225,0.15)] bg-[rgba(6,18,26,0.75)] p-6 shadow-[0_22px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <h2 className="text-lg font-semibold text-white">Contact</h2>
          <p className="text-sm text-[color:var(--text-muted)]">
            Questions about these terms? Reach us at{" "}
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
