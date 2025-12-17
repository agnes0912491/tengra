"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import { Globe } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function LocaleSwitcher() {
    const t = useTranslations("LocaleSwitcher");
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const [isPending, startTransition] = useTransition();

    const onSelectChange = (nextLocale: string) => {
        startTransition(() => {
            // Replace the locale in the pathname
            // Assuming pathname starts with /en or /tr, or we rely on middleware
            // simple approach: cookie based or just reload?
            // Next-intl usually implies prefix routing like /en/about

            // If we are using prefix routing:
            // const segments = pathname.split('/');
            // segments[1] = nextLocale;
            // router.replace(segments.join('/'));

            // But looking at get-messages, we might be using cookie based + prefix?
            // Let's assume standard cookie approach for now:
            document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=31536000; SameSite=Lax`;
            router.refresh();
        });
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="outline-none">
                <div className="p-2 rounded-full hover:bg-[rgba(255,255,255,0.1)] transition-colors text-[rgba(255,255,255,0.8)]">
                    <Globe className="w-5 h-5" />
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[rgba(6,20,27,0.95)] border border-[rgba(255,255,255,0.1)] text-white backdrop-blur-xl">
                <DropdownMenuItem
                    onClick={() => onSelectChange("en")}
                    className={`cursor-pointer ${locale === 'en' ? 'text-[var(--color-turkish-blue-400)]' : ''}`}
                >
                    🇺🇸 English
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => onSelectChange("tr")}
                    className={`cursor-pointer ${locale === 'tr' ? 'text-[var(--color-turkish-blue-400)]' : ''}`}
                >
                    🇹🇷 Türkçe
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
