import { redirect } from "next/navigation";

// Redirect to dashboard - notifications page not yet available in dashboard
export default function NotificationsRedirect() {
    redirect("/admin/dashboard");
}
