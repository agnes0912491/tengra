import {
  Bug,
  Code,
  Gamepad2,
  HelpCircle,
  Lightbulb,
  LucideIcon,
  Megaphone,
  MessageCircle,
  MessageSquare,
  Palette,
} from "lucide-react";

export type ForumCategoryMeta = {
  icon: LucideIcon;
  colorClass: string;
  section: string;
  description?: string;
  bgGradient?: string;
};

const DEFAULT_META: ForumCategoryMeta = {
  icon: MessageCircle,
  colorClass: "text-[var(--color-turkish-blue-400)]",
  section: "Forum.sections.community",
  bgGradient: "from-[var(--color-turkish-blue-600)] to-[var(--color-turkish-blue-400)]",
  description: "Forum.descriptions.default"
};


export const FORUM_CATEGORY_META: Record<string, ForumCategoryMeta> = {
  "duyurular": {
    icon: Megaphone,
    colorClass: "text-amber-400",
    section: "Forum.sections.tengraStudio",
    description: "Forum.descriptions.duyurular",
    bgGradient: "from-amber-500 to-orange-600",
  },
  "genel-tartisma": {
    icon: MessageSquare,
    colorClass: "text-blue-400",
    section: "Forum.sections.tengraStudio",
    description: "Forum.descriptions.genelTartisma",
    bgGradient: "from-blue-500 to-cyan-600",
  },
  "genel": {
    icon: MessageSquare,
    colorClass: "text-blue-400",
    section: "Forum.sections.tengraStudio",
    description: "Forum.descriptions.genel",
    bgGradient: "from-blue-500 to-cyan-600",
  },
  "oyunlar": {
    icon: Gamepad2,
    colorClass: "text-purple-400",
    section: "Forum.sections.projectsDev",
    description: "Forum.descriptions.oyunlar",
    bgGradient: "from-purple-500 to-pink-600",
  },
  "gelistirici": {
    icon: Code,
    colorClass: "text-emerald-400",
    section: "Forum.sections.projectsDev",
    description: "Forum.descriptions.gelistirici",
    bgGradient: "from-emerald-500 to-teal-600",
  },
  "tasarim": {
    icon: Palette,
    colorClass: "text-rose-400",
    section: "Forum.sections.projectsDev",
    description: "Forum.descriptions.tasarim",
    bgGradient: "from-rose-500 to-red-600",
  },
  "oneriler": {
    icon: Lightbulb,
    colorClass: "text-yellow-400",
    section: "Forum.sections.supportCommunity",
    description: "Forum.descriptions.oneriler",
    bgGradient: "from-yellow-500 to-amber-600",
  },
  "destek": {
    icon: HelpCircle,
    colorClass: "text-sky-400",
    section: "Forum.sections.supportCommunity",
    description: "Forum.descriptions.destek",
    bgGradient: "from-sky-500 to-blue-600",
  },
  "bug-raporlari": {
    icon: Bug,
    colorClass: "text-red-400",
    section: "Forum.sections.supportCommunity",
    description: "Forum.descriptions.bugRaporlari",
    bgGradient: "from-red-500 to-rose-600",
  },
};

export const getCategoryMeta = (slug: string): ForumCategoryMeta => FORUM_CATEGORY_META[slug] ?? DEFAULT_META;
