import { redirect } from "next/navigation";

// Redirect to dashboard analytics
export default function AnalyticsRedirect() {
    redirect("/admin/dashboard");
}
