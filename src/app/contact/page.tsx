import { Metadata } from "next";
import SiteShell from "@/components/layout/site-shell";
import ContactForm from "@/components/contact/contact-form";

export const metadata: Metadata = {
  title: "Contact Us | Tengra Studio",
  description: "Get in touch with Tengra Studio. We are a creative tech studio based in Istanbul, Turkey. Reach out for web development, mobile apps, and design services.",
  keywords: ["contact tengra", "İstanbul yazılım şirketi iletişim", "web geliştirme teklif"],
  openGraph: {
    title: "Contact Tengra Studio",
    description: "Let's build something extraordinary together. Contact us for your next project.",
    url: "https://tengra.studio/contact",
  },
};

export default function ContactPage() {
  return (
    <SiteShell>
      <div className="px-4 py-16 md:px-10">
        <ContactForm />
      </div>
    </SiteShell>
  );
}
