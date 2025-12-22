"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { Dialog, DialogContent, DialogTitle } from "@radix-ui/react-dialog";
import {
    Calculator,
    Calendar,
    CreditCard,
    Settings,
    Smile,
    User,
    Search,
    FileText,
    Mail,
    Home,
    LayoutDashboard,
    Laptop
} from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";

export function CommandMenu() {
    const router = useRouter();
    const [open, setOpen] = React.useState(false);
    const { setTheme } = useTheme();
    const t = useTranslations("CommandMenu");

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    const runCommand = React.useCallback((command: () => void) => {
        setOpen(false);
        command();
    }, []);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="fixed left-1/2 top-[20%] -translate-x-1/2 p-0 shadow-2xl bg-[rgba(15,25,35,0.95)] backdrop-blur-xl border border-[rgba(255,255,255,0.1)] rounded-xl overflow-hidden w-full max-w-lg z-50">
                <DialogTitle className="sr-only">{t("title")}</DialogTitle>
                <Command className="w-full bg-transparent">
                    <div className="flex items-center border-b border-[rgba(255,255,255,0.1)] px-4" cmdk-input-wrapper="">
                        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50 text-white" />
                        <Command.Input
                            placeholder={t("searchPlaceholder")}
                            className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-[rgba(255,255,255,0.5)] text-white disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>
                    <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden p-2">
                        <Command.Empty className="py-6 text-center text-sm text-[rgba(255,255,255,0.5)]">
                            {t("empty")}
                        </Command.Empty>

                        <Command.Group heading={t("groups.navigation")} className="px-2 py-1.5 text-xs font-medium text-[rgba(255,255,255,0.5)]">
                            <Command.Item
                                onSelect={() => runCommand(() => router.push("/"))}
                                className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-[rgba(255,255,255,0.1)] aria-selected:text-white data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                            >
                                <Home className="mr-2 h-4 w-4" />
                                <span>{t("items.home")}</span>
                            </Command.Item>
                            <Command.Item
                                onSelect={() => runCommand(() => router.push("/blogs"))}
                                className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-[rgba(255,255,255,0.1)] aria-selected:text-white"
                            >
                                <FileText className="mr-2 h-4 w-4" />
                                <span>{t("items.blog")}</span>
                            </Command.Item>
                            {/* <Command.Item
                onSelect={() => runCommand(() => router.push("/projects"))}
                className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-[rgba(255,255,255,0.1)] aria-selected:text-white"
              >
                <Laptop className="mr-2 h-4 w-4" />
                <span>Projects</span>
              </Command.Item> */}
                            <Command.Item
                                onSelect={() => runCommand(() => router.push("/contact"))}
                                className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-[rgba(255,255,255,0.1)] aria-selected:text-white"
                            >
                                <Mail className="mr-2 h-4 w-4" />
                                <span>{t("items.contact")}</span>
                            </Command.Item>
                        </Command.Group>

                        <Command.Separator className="my-1 h-px bg-[rgba(255,255,255,0.1)]" />

                        <Command.Group heading={t("groups.settings")} className="px-2 py-1.5 text-xs font-medium text-[rgba(255,255,255,0.5)]">
                            <Command.Item
                                onSelect={() => runCommand(() => router.push("/admin"))}
                                className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-[rgba(255,255,255,0.1)] aria-selected:text-white"
                            >
                                <LayoutDashboard className="mr-2 h-4 w-4" />
                                <span>{t("items.adminDashboard")}</span>
                            </Command.Item>
                            <Command.Item
                                onSelect={() => runCommand(() => setTheme("dark"))}
                                className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-[rgba(255,255,255,0.1)] aria-selected:text-white"
                            >
                                <User className="mr-2 h-4 w-4" />
                                <span>{t("items.profile")}</span>
                            </Command.Item>
                        </Command.Group>

                        <Command.Group heading={t("groups.theme")} className="px-2 py-1.5 text-xs font-medium text-[rgba(255,255,255,0.5)]">
                            <Command.Item
                                onSelect={() => runCommand(() => setTheme("light"))}
                                className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-[rgba(255,255,255,0.1)] aria-selected:text-white"
                            >
                                <Smile className="mr-2 h-4 w-4" />
                                <span>{t("items.lightMode")}</span>
                            </Command.Item>
                            <Command.Item
                                onSelect={() => runCommand(() => setTheme("dark"))}
                                className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-[rgba(255,255,255,0.1)] aria-selected:text-white"
                            >
                                <Settings className="mr-2 h-4 w-4" />
                                <span>{t("items.darkMode")}</span>
                            </Command.Item>
                        </Command.Group>

                    </Command.List>
                </Command>
            </DialogContent>
        </Dialog>
    );
}
