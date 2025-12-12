import { redirect } from "next/navigation";

// Redirect to dashboard - system page not yet available in dashboard
export default function SystemRedirect() {
    redirect("/admin/dashboard");
}
