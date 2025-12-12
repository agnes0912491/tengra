import { redirect } from "next/navigation";

// Redirect to dashboard users page
export default function UsersRedirect() {
  redirect("/admin/dashboard/users");
}
