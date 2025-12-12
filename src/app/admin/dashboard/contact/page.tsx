import AdminPageHeader from "@/components/admin/admin-page-header";
import ContactAdmin from "@/components/admin/contact/contact-admin";
import { cookies, headers } from "next/headers";
import { resolvePreferredLocale } from "@/i18n/resolve-preferred-locale";
import { getMessages } from "@/i18n/get-messages";

export default function AdminContactPage() {
  const cookieStore = cookies();
  const headersList = headers();
  const { locale } = resolvePreferredLocale({
    cookieLocale: cookieStore.get("NEXT_LOCALE")?.value,
    acceptLanguage: headersList.get("accept-language"),
  });
  const { messages } = getMessages(locale);
  const title = (messages as { Navigation?: Record<string, string> })?.Navigation?.contact ?? "İletişim";
  const description =
    (messages as { AdminContent?: { contactDescription?: string } })?.AdminContent?.contactDescription ??
    "İletişim formu kayıtlarını görüntüleyin.";

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader title={title} description={description} />
      <ContactAdmin />
    </div>
  );
}
