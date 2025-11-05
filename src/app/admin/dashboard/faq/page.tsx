import AdminPageHeader from "@/components/admin/admin-page-header";
import FaqAdmin from "@/components/admin/faq/faq-admin";
import { cookies, headers } from "next/headers";
import { resolvePreferredLocale } from "@/i18n/resolve-preferred-locale";
import { getMessages } from "@/i18n/get-messages";

export default async function AdminFaqPage() {
  const cookieStore = await cookies();
  const headersList = await headers();
  const { locale } = resolvePreferredLocale({
    cookieLocale: cookieStore.get("NEXT_LOCALE")?.value,
    acceptLanguage: headersList.get("accept-language"),
  });
  const { messages } = getMessages(locale);
  const title = messages?.Navigation?.faq ?? "S.S.S.";
  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title={title}
        description="Sıkça sorulan soruları çok dilli olarak yönetin."
      />
      <FaqAdmin />
    </div>
  );
}
