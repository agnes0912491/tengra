import AdminPageHeader from "@/components/admin/admin-page-header";
import GoalsAdmin from "@/components/admin/goals/goals-admin";
import { cookies, headers } from "next/headers";
import { resolvePreferredLocale } from "@/i18n/resolve-preferred-locale";
import { getMessages } from "@/i18n/get-messages";

export default async function AdminGoalsPage() {
  const cookieStore = await cookies();
  const headersList = await headers();
  const { locale } = resolvePreferredLocale({
    cookieLocale: cookieStore.get("NEXT_LOCALE")?.value,
    acceptLanguage: headersList.get("accept-language"),
  });
  const { messages } = getMessages(locale);
  const title = messages?.Navigation?.goals ?? "Hedefler";
  const description =
    (messages as { AdminContent?: { goalsDescription?: string } })?.AdminContent?.goalsDescription ??
    "Hedefleri çok dilli olarak yönetin.";

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title={title}
        description={description}
      />
      <GoalsAdmin />
    </div>
  );
}
