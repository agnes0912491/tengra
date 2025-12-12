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
  section: "Topluluk",
  bgGradient: "from-[var(--color-turkish-blue-600)] to-[var(--color-turkish-blue-400)]",
};

export const FORUM_CATEGORY_META: Record<string, ForumCategoryMeta> = {
  "duyurular": {
    icon: Megaphone,
    colorClass: "text-amber-400",
    section: "Tengra Studio",
    description: "Tengra Studio'dan resmi duyurular ve güncellemeler.",
    bgGradient: "from-amber-500 to-orange-600",
  },
  "genel-tartisma": {
    icon: MessageSquare,
    colorClass: "text-blue-400",
    section: "Tengra Studio",
    description: "Topluluk sohbetleri ve genel gündem.",
    bgGradient: "from-blue-500 to-cyan-600",
  },
  "genel": {
    icon: MessageSquare,
    colorClass: "text-blue-400",
    section: "Tengra Studio",
    description: "Topluluk sohbetleri ve genel gündem.",
    bgGradient: "from-blue-500 to-cyan-600",
  },
  "oyunlar": {
    icon: Gamepad2,
    colorClass: "text-purple-400",
    section: "Projeler & Geliştirme",
    description: "Tengra oyunları ve etkinlikleri.",
    bgGradient: "from-purple-500 to-pink-600",
  },
  "gelistirici": {
    icon: Code,
    colorClass: "text-emerald-400",
    section: "Projeler & Geliştirme",
    description: "API, SDK ve teknik entegrasyon tartışmaları.",
    bgGradient: "from-emerald-500 to-teal-600",
  },
  "tasarim": {
    icon: Palette,
    colorClass: "text-rose-400",
    section: "Projeler & Geliştirme",
    description: "UI/UX, sanat ve kreatif paylaşımlar.",
    bgGradient: "from-rose-500 to-red-600",
  },
  "oneriler": {
    icon: Lightbulb,
    colorClass: "text-yellow-400",
    section: "Destek & Topluluk",
    description: "Öneriler ve geliştirme fikirleri.",
    bgGradient: "from-yellow-500 to-amber-600",
  },
  "destek": {
    icon: HelpCircle,
    colorClass: "text-sky-400",
    section: "Destek & Topluluk",
    description: "Teknik destek ve hesap sorunları.",
    bgGradient: "from-sky-500 to-blue-600",
  },
  "bug-raporlari": {
    icon: Bug,
    colorClass: "text-red-400",
    section: "Destek & Topluluk",
    description: "Hata bildirimleri ve çözümler.",
    bgGradient: "from-red-500 to-rose-600",
  },
};

export const getCategoryMeta = (slug: string): ForumCategoryMeta => FORUM_CATEGORY_META[slug] ?? DEFAULT_META;
