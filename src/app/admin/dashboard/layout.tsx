import { ReactNode } from "react";
import AdminShell from "@/components/admin/admin-shell";

type Props = {
  children: ReactNode;
};

export default async function AdminLayout({ children }: Props) {
  return <AdminShell>{children}</AdminShell>;
}
