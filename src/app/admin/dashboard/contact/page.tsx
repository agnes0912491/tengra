import AdminPageHeader from "@/components/admin/admin-page-header";
import ContactAdmin from "@/components/admin/contact/contact-admin";
import { resolvePreferredLocale } from "@/i18n/resolve-preferred-locale";
import { getMessages } from "@/i18n/get-messages";

export default async function AdminContactPage() {
  const locale = await resolvePreferredLocale();
  const messages = await getMessages(locale);
  const title = (messages as any)?.Navigation?.contact ?? "İletişim";
  const description =
    (messages as any)?.AdminContent?.contactDescription ??
    "İletişim formu kayıtlarını görüntüleyin.";

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader title={title} description={description} />
      <ContactAdmin />
    </div>
  );
}
