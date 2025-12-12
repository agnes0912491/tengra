import { redirect } from "next/navigation";

// Redirect to dashboard login
export default function LoginRedirect() {
  redirect("/login?next=/admin/dashboard");
}
