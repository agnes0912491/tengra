import SiteShell from "@/components/layout/site-shell";
import ContactForm from "@/components/contact/contact-form";

export default function ContactPage() {
  return (
    <SiteShell>
      <div className="px-4 py-16 md:px-10">
        <ContactForm />
      </div>
    </SiteShell>
  );
}
