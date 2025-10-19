import { redirect } from "next/navigation";

import { routing } from "@/i18n/routing";

export default function BlogPostRedirect({
  params,
}: {
  params: { id: string };
}) {
  redirect(`/${routing.defaultLocale}/blogs/${params.id}`);
}
