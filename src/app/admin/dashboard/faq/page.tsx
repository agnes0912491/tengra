import AdminPageHeader from "@/components/admin/admin-page-header";
import FaqAdmin from "@/components/admin/faq/faq-admin";
import { resolvePreferredLocale } from "@/i18n/resolve-preferred-locale";
import { getMessages } from "@/i18n/get-messages";

export default async function AdminFaqPage() {
  const locale = await resolvePreferredLocale();
  const messages = await getMessages(locale);
  const title = (messages as any)?.Navigation?.faq ?? "S.S.S.";
  const description =
    (messages as any)?.AdminContent?.faqDescription ??
    "Sıkça sorulan soruları çok dilli olarak yönetin.";
  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title={title}
        description={description}
      />
      <FaqAdmin />
    </div>
  );
}
