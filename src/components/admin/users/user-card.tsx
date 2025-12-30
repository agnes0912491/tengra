"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import {
    Users,
    Shield,
    UserCog,
    User as UserIcon,
    Phone,
    Monitor,
    Clock,
    Mail,
    MoreVertical,
    Edit,
    Trash2,
    ShieldCheck,
    ShieldOff,
    Smartphone,
    Globe,
    Crown,
} from "lucide-react";
import { useState } from "react";
import type { User, Role, UserSource } from "@/lib/auth/users";
import { resolveCdnUrl } from "@/lib/constants";
import { useTranslation } from "@tengra/language";

const ROLE_CONFIG: Record<Role, { labelKey: string; color: string; icon: typeof Shield }> = {
    admin: { labelKey: "roles.admin", color: "from-purple-500 to-purple-600", icon: Shield },
    moderator: { labelKey: "roles.moderator", color: "from-blue-500 to-blue-600", icon: UserCog },
    user: { labelKey: "roles.user", color: "from-gray-500 to-gray-600", icon: UserIcon },
};

const SOURCE_CONFIG: Record<UserSource, { labelKey: string; color: string }> = {
    tengra: { labelKey: "sources.tengra", color: "bg-[rgba(30,184,255,0.15)] text-[var(--color-turkish-blue-300)]" },
    geofrontier: { labelKey: "sources.geofrontier", color: "bg-emerald-500/15 text-emerald-400" },
    lova: { labelKey: "sources.lova", color: "bg-pink-500/15 text-pink-400" },
    biodefenders: { labelKey: "sources.biodefenders", color: "bg-amber-500/15 text-amber-400" },
    both: { labelKey: "sources.multi", color: "bg-indigo-500/15 text-indigo-400" }, // Added 'both' handling
};

type UserCardProps = {
    user: User;
    isCurrentUser: boolean;
    currentUserRole?: Role;
    isSelected: boolean;
    isOnline?: boolean; // Real-time presence from Redis
    onSelect: (userId: string, selected: boolean) => void;
    onDelete: (userId: string) => void;
    onRoleChange: (userId: string, role: Role) => void;
    onEdit: (user: User) => void;
};

export default function UserCard({ user, isCurrentUser, currentUserRole, isSelected, isOnline, onSelect, onDelete, onRoleChange, onEdit }: UserCardProps) {
    const { language: locale } = useTranslation();
    const { t } = useTranslation("AdminUsers");
    const [showActions, setShowActions] = useState(false);
    const roleConfig = ROLE_CONFIG[user.role];
    const sourceConfig = SOURCE_CONFIG[user.source || "tengra"];
    const roleLabel = t(roleConfig.labelKey);
    const sourceLabel = t(sourceConfig.labelKey);

    const parseUserAgent = (ua: string | null | undefined): { device: string; browser: string; os: string } => {
        if (!ua) return { device: t("device.unknown"), browser: t("browser.unknown"), os: t("os.unknown") };

        let device = t("device.desktop");
        let browser = t("browser.unknown");
        let os = t("os.unknown");

        // Device detection
        if (/mobile/i.test(ua)) device = t("device.mobile");
        else if (/tablet|ipad/i.test(ua)) device = t("device.tablet");

        // Browser detection
        if (/chrome/i.test(ua) && !/edge|edg/i.test(ua)) browser = t("browser.chrome");
        else if (/firefox/i.test(ua)) browser = t("browser.firefox");
        else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = t("browser.safari");
        else if (/edge|edg/i.test(ua)) browser = t("browser.edge");
        else if (/opera|opr/i.test(ua)) browser = t("browser.opera");

        // OS detection
        if (/windows/i.test(ua)) os = t("os.windows");
        else if (/macintosh|mac os/i.test(ua)) os = t("os.macos");
        else if (/linux/i.test(ua) && !/android/i.test(ua)) os = t("os.linux");
        else if (/android/i.test(ua)) os = t("os.android");
        else if (/iphone|ipad|ipod/i.test(ua)) os = t("os.ios");

        return { device, browser, os };
    };

    const formatDate = (dateStr: string | null | undefined): string => {
        if (!dateStr) return t("labels.empty");
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return t("labels.empty");
        return new Intl.DateTimeFormat(locale, {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(date);
    };

    const getRelativeTime = (dateStr: string | null | undefined): string => {
        if (!dateStr) return t("relative.never");
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return t("relative.never");

        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return t("relative.justNow");
        if (minutes < 60) return t("relative.minutesAgo", { minutes });
        if (hours < 24) return t("relative.hoursAgo", { hours });
        if (days < 7) return t("relative.daysAgo", { days });
        return formatDate(dateStr);
    };

    const getOnlineStatus = (lastLoginAt: string | null | undefined): { isOnline: boolean; statusColor: string; statusText: string } => {
        if (!lastLoginAt) {
            return { isOnline: false, statusColor: "bg-gray-500", statusText: t("relative.never") };
        }
        const date = new Date(lastLoginAt);
        if (isNaN(date.getTime())) {
            return { isOnline: false, statusColor: "bg-gray-500", statusText: t("labels.unknown") };
        }

        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 15) {
            return { isOnline: true, statusColor: "bg-emerald-500", statusText: t("online.online") };
        } else if (hours < 1) {
            return { isOnline: false, statusColor: "bg-yellow-500", statusText: t("online.minutesAgo", { minutes }) };
        } else if (hours < 24) {
            return { isOnline: false, statusColor: "bg-orange-500", statusText: t("online.hoursAgo", { hours }) };
        } else if (days < 7) {
            return { isOnline: false, statusColor: "bg-red-400", statusText: t("online.daysAgo", { days }) };
        } else {
            return { isOnline: false, statusColor: "bg-gray-500", statusText: t("online.offlineLong") };
        }
    };

    const deviceInfo = parseUserAgent(user.lastLoginDevice);
    const RoleIcon = roleConfig.icon;

    // Use real-time presence if provided, otherwise fall back to lastLoginAt calculation
    const onlineStatus = isOnline !== undefined
        ? {
            isOnline,
            statusColor: isOnline ? "bg-emerald-500" : "bg-gray-500",
            statusText: isOnline ? t("online.online") : getOnlineStatus(user.lastLoginAt).statusText
        }
        : getOnlineStatus(user.lastLoginAt);

    const canManageUser = currentUserRole === "admin" && !isCurrentUser && user.role !== "admin";

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`group relative rounded-2xl bg-[rgba(15,31,54,0.6)] border backdrop-blur-xl overflow-hidden transition-all duration-300 ${isSelected
                ? "border-[var(--color-turkish-blue-400)] shadow-[0_0_20px_rgba(30,184,255,0.15)]"
                : "border-[rgba(72,213,255,0.12)] hover:border-[rgba(72,213,255,0.25)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.3),0_0_25px_rgba(30,184,255,0.08)]"
                }`}
        >
            {/* Selection overlay when selected */}
            {isSelected && (
                <div className="absolute inset-0 bg-[rgba(30,184,255,0.03)] pointer-events-none" />
            )}

            {/* Header with avatar and basic info */}
            <div className="relative p-5 pb-4">
                <div className="flex items-start gap-4">
                    {/* Avatar and Checkbox */}
                    <div className="relative">
                        {/* Custom Checkbox - overlays avatar corner */}
                        {canManageUser && (
                            <label className="absolute -top-1.5 -left-1.5 z-10 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={(e) => onSelect(user.id, e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${isSelected
                                    ? "bg-[var(--color-turkish-blue-500)] border-[var(--color-turkish-blue-500)]"
                                    : "bg-[rgba(15,31,54,0.95)] border-[rgba(72,213,255,0.3)] hover:border-[var(--color-turkish-blue-400)]"
                                    }`}>
                                    {isSelected && (
                                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </div>
                            </label>
                        )}

                        {/* Avatar */}
                        <div className={`w-14 h-14 rounded-xl overflow-hidden bg-[rgba(30,184,255,0.1)] border transition-all duration-200 ${isSelected ? "border-[var(--color-turkish-blue-400)]" : "border-[rgba(72,213,255,0.2)]"
                            }`}>
                            {user.avatar ? (
                                <Image
                                    src={resolveCdnUrl(user.avatar)}
                                    alt={user.displayName || user.username || t("labels.avatarAlt")}
                                    width={56}
                                    height={56}
                                    className="w-full h-full object-cover"
                                    crossOrigin="anonymous"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-[var(--color-turkish-blue-400)]">
                                    <UserIcon className="w-7 h-7" />
                                </div>
                            )}
                        </div>

                        {/* Online status indicator */}
                        <div className="absolute -bottom-1 -right-1 group/status">
                            <div className={`w-4 h-4 rounded-full ${onlineStatus.statusColor} border-2 border-[rgba(15,31,54,1)] ${onlineStatus.isOnline ? "animate-pulse" : ""}`} />
                            {/* Tooltip */}
                            <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-[rgba(15,31,54,0.95)] border border-[rgba(72,213,255,0.2)] rounded-lg text-[10px] text-white whitespace-nowrap opacity-0 group-hover/status:opacity-100 transition-opacity pointer-events-none">
                                {onlineStatus.statusText}
                            </div>
                        </div>
                    </div>

                    {/* User info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <h3 className="text-base font-semibold text-[var(--text-primary)] truncate">
                                {user.displayName || user.username || t("labels.unnamed")}
                            </h3>
                            {isCurrentUser && (
                                <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-[rgba(30,184,255,0.15)] text-[var(--color-turkish-blue-300)]">
                                    {t("labels.you")}
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-[var(--text-muted)] truncate flex items-center gap-1.5 mt-0.5">
                            <Mail className="w-3.5 h-3.5" />
                            {user.email}
                        </p>
                    </div>

                    {/* Actions menu */}
                    {canManageUser && (
                        <div className="relative">
                            <button
                                onClick={() => setShowActions(!showActions)}
                                className="p-2 rounded-lg hover:bg-[rgba(255,255,255,0.05)] transition-colors"
                            >
                                <MoreVertical className="w-4 h-4 text-[var(--text-muted)]" />
                            </button>
                            {showActions && (
                                <div className="absolute right-0 top-full mt-1 w-48 rounded-xl bg-[rgba(15,31,54,0.95)] border border-[rgba(72,213,255,0.15)] shadow-xl backdrop-blur-xl z-10 py-1">
                                    <button
                                        onClick={() => {
                                            onEdit(user);
                                            setShowActions(false);
                                        }}
                                        className="w-full px-4 py-2 text-left text-sm text-[var(--text-secondary)] hover:bg-[rgba(255,255,255,0.05)] flex items-center gap-2"
                                    >
                                        <Edit className="w-4 h-4" /> {t("actions.edit")}
                                    </button>
                                    {user.role !== "moderator" && (
                                        <button
                                            onClick={() => {
                                                onRoleChange(user.id, "moderator");
                                                setShowActions(false);
                                            }}
                                            className="w-full px-4 py-2 text-left text-sm text-[var(--text-secondary)] hover:bg-[rgba(255,255,255,0.05)] flex items-center gap-2"
                                        >
                                            <ShieldCheck className="w-4 h-4" /> {t("actions.makeModerator")}
                                        </button>
                                    )}
                                    {user.role !== "user" && (
                                        <button
                                            onClick={() => {
                                                onRoleChange(user.id, "user");
                                                setShowActions(false);
                                            }}
                                            className="w-full px-4 py-2 text-left text-sm text-[var(--text-secondary)] hover:bg-[rgba(255,255,255,0.05)] flex items-center gap-2"
                                        >
                                            <ShieldOff className="w-4 h-4" /> {t("actions.removePrivileges")}
                                        </button>
                                    )}
                                    <hr className="my-1 border-[rgba(72,213,255,0.1)]" />
                                    <button
                                        onClick={() => {
                                            onDelete(user.id);
                                            setShowActions(false);
                                        }}
                                        className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-[rgba(255,255,255,0.05)] flex items-center gap-2"
                                    >
                                        <Trash2 className="w-4 h-4" /> {t("actions.delete")}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Tags row */}
                <div className="flex items-center gap-2 mt-4">
                    {/* Role badge */}
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r ${roleConfig.color} text-white text-[11px] font-medium`}>
                        <RoleIcon className="w-3 h-3" />
                        {roleLabel}
                    </div>
                    {/* Premium badge */}
                    {user.subscription === "premium" && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-200 to-yellow-500 text-black text-[11px] font-bold shadow-[0_2px_10px_rgba(251,191,36,0.2)]">
                            <Crown className="w-3 h-3" />
                            {t("labels.premium")}
                        </div>
                    )}
                    {/* Source badge */}
                    <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium ${sourceConfig.color}`}>
                        {sourceLabel}
                    </div>
                </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-[rgba(72,213,255,0.15)] to-transparent" />

            {/* Details section */}
            <div className="p-5 pt-4 space-y-3">
                {/* Last login info */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                        <Clock className="w-3.5 h-3.5 text-[var(--color-turkish-blue-400)]" />
                        <span>{t("labels.lastLogin")}</span>
                        <span className="text-[var(--text-secondary)]">{getRelativeTime(user.lastLoginAt)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                        <Globe className="w-3.5 h-3.5 text-[var(--color-turkish-blue-400)]" />
                        <span className="text-[var(--text-secondary)]">{user.lastLoginCountry || "—"}</span>
                        {user.lastLoginCity && <span className="text-[var(--text-muted)]">/ {user.lastLoginCity}</span>}
                    </div>
                </div>

                {/* Device info */}
                <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
                        {deviceInfo.device === t("device.mobile") ? (
                            <Smartphone className="w-3.5 h-3.5 text-[var(--color-turkish-blue-400)]" />
                        ) : (
                            <Monitor className="w-3.5 h-3.5 text-[var(--color-turkish-blue-400)]" />
                        )}
                        <span className="text-[var(--text-secondary)]">{deviceInfo.device}</span>
                    </div>
                    <span className="text-[var(--text-muted)]">•</span>
                    <span className="text-[var(--text-secondary)]">{deviceInfo.browser}</span>
                    <span className="text-[var(--text-muted)]">•</span>
                    <span className="text-[var(--text-secondary)]">{deviceInfo.os}</span>
                </div>

                {/* IP Address */}
                {user.lastLoginIp && (
                    <div className="flex items-center gap-2 text-xs">
                        <span className="text-[var(--text-muted)]">{t("labels.ip")}</span>
                        <code className="px-2 py-0.5 rounded bg-[rgba(0,0,0,0.2)] text-[var(--text-secondary)] font-mono text-[10px]">
                            {user.lastLoginIp}
                        </code>
                    </div>
                )}

                {/* Registration date */}
                <div className="text-[11px] text-[var(--text-muted)]">
                    {t("labels.registered")} {formatDate(user.createdAt)}
                </div>
            </div>
        </motion.div>
    );
}
