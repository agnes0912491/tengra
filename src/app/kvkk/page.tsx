import SiteShell from "@/components/layout/site-shell";
import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/page-metadata";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildPageMetadata({
  title: "KVKK Notice | Tengra Studio",
  description: "Personal data processing notice under the KVKK framework.",
  path: "/kvkk",
});

export default function KvkkPage() {
    return (
        <SiteShell disableAnimation>
            <div className="mx-auto max-w-4xl px-4 py-16 space-y-10 text-[color:var(--foreground)]">
                <header className="space-y-3">
                    <p className="text-[11px] uppercase tracking-[0.3em] text-[color:var(--color-turkish-blue-300)]">
                        Kişisel Verilerin Korunması
                    </p>
                    <h1 className="text-3xl font-display tracking-[0.08em] text-white">KVKK Aydınlatma Metni</h1>
                    <p className="text-sm text-[color:var(--text-muted)]">
                        Tengra olarak kişisel verilerinizi 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında nasıl işlediğimize dair bilgilendirme.
                    </p>
                </header>

                <section className="space-y-3 rounded-2xl border border-[rgba(110,211,225,0.15)] bg-[rgba(6,18,26,0.75)] p-6 shadow-[0_22px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl">
                    <h2 className="text-lg font-semibold text-white">Veri Sorumlusu</h2>
                    <p className="text-sm text-[color:var(--text-muted)]">
                        6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, kişisel verileriniz; veri sorumlusu olarak Tengra ("Şirket") tarafından aşağıda açıklanan kapsamda işlenebilecektir.
                    </p>
                </section>

                <section className="space-y-3 rounded-2xl border border-[rgba(110,211,225,0.15)] bg-[rgba(6,18,26,0.75)] p-6 shadow-[0_22px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl">
                    <h2 className="text-lg font-semibold text-white">Kişisel Verilerin İşlenme Amaçları</h2>
                    <ul className="list-disc space-y-2 pl-5 text-sm text-[color:var(--text-muted)]">
                        <li>Ürün ve hizmetlerimizden faydalanmanızın sağlanması.</li>
                        <li>Şirketimiz ve iş ilişkisi içerisinde olduğumuz kişilerin hukuki ve ticari güvenliğinin temini.</li>
                        <li>Müşteri memnuniyeti aktivitelerinin planlanması ve icrası.</li>
                        <li>Talep ve şikayetlerin takibi.</li>
                    </ul>
                </section>

                <section className="space-y-3 rounded-2xl border border-[rgba(110,211,225,0.15)] bg-[rgba(6,18,26,0.75)] p-6 shadow-[0_22px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl">
                    <h2 className="text-lg font-semibold text-white">İşlenen Kişisel Veriler</h2>
                    <p className="text-sm text-[color:var(--text-muted)]">
                        Kimlik, İletişim, Müşteri İşlem, İşlem Güvenliği ve Pazarlama bilgileri kategorilerindeki verileriniz işlenmektedir.
                    </p>
                </section>

                <section className="space-y-3 rounded-2xl border border-[rgba(110,211,225,0.15)] bg-[rgba(6,18,26,0.75)] p-6 shadow-[0_22px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl">
                    <h2 className="text-lg font-semibold text-white">Haklarınız</h2>
                    <ul className="list-disc space-y-2 pl-5 text-sm text-[color:var(--text-muted)]">
                        <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme,</li>
                        <li>İşlenmişse buna ilişkin bilgi talep etme,</li>
                        <li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme,</li>
                        <li>Yurt içinde veya yurt dışında aktarıldığı 3. kişileri bilme,</li>
                        <li>Eksik veya yanlış işlenmişse düzeltilmesini isteme haklarına sahipsiniz.</li>
                    </ul>
                </section>

                <section className="space-y-2 rounded-2xl border border-[rgba(110,211,225,0.15)] bg-[rgba(6,18,26,0.75)] p-6 shadow-[0_22px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl">
                    <h2 className="text-lg font-semibold text-white">İletişim</h2>
                    <p className="text-sm text-[color:var(--text-muted)]">
                        Haklarınızı kullanmak için taleplerinizi <a className="text-[color:var(--color-turkish-blue-300)] underline" href="mailto:info@tengra.studio">info@tengra.studio</a> adresine iletebilirsiniz.
                    </p>
                </section>
            </div>
        </SiteShell>
    );
}
