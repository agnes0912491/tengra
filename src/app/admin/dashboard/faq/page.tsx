import AdminPageHeader from "@/components/admin/admin-page-header";
import FaqAdmin from "@/components/admin/faq/faq-admin";

export default function AdminFaqPage() {
    return (
        <div className="flex flex-col gap-8">
            <AdminPageHeader
                title="S.S.S."
                description="Sıkça sorulan soruları çok dilli olarak yönetin."
            />
            <FaqAdmin />
        </div>
    );
}

