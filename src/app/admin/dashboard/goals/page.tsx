import AdminPageHeader from "@/components/admin/admin-page-header";
import GoalsAdmin from "@/components/admin/goals/goals-admin";
import { resolvePreferredLocale } from "@/i18n/resolve-preferred-locale";
import { getMessages } from "@/i18n/get-messages";

export default async function AdminGoalsPage() {
  const locale = await resolvePreferredLocale();
  const messages = await getMessages(locale);
  const title = (messages as any)?.Navigation?.goals ?? "Hedefler";
  const description =
    (messages as any)?.AdminContent?.goalsDescription ??
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
