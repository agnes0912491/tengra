"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

import AdminPageHeader from "@/components/admin/admin-page-header";
import { getAllUsers, getUserWithToken } from "@/lib/db";
import type { Role, User, UserSource } from "@/lib/auth/users";
import { resolveCdnUrl } from "@/lib/constants";
import {
  Users,
  Shield,
  UserCog,
  User as UserIcon,
  Search,
  Filter,
  ChevronDown,
  Globe,
  Smartphone,
  Monitor,
  Clock,
  Mail,
  MoreVertical,
  Edit,
  Trash2,
  ShieldCheck,
  ShieldOff,
} from "lucide-react";

const ROLE_CONFIG: Record<Role, { label: string; color: string; icon: typeof Shield }> = {
  admin: { label: "Yönetici", color: "from-purple-500 to-purple-600", icon: Shield },
  moderator: { label: "Moderatör", color: "from-blue-500 to-blue-600", icon: UserCog },
  user: { label: "Kullanıcı", color: "from-gray-500 to-gray-600", icon: UserIcon },
};

const SOURCE_CONFIG: Record<UserSource, { label: string; color: string }> = {
  tengra: { label: "Tengra", color: "bg-[rgba(30,184,255,0.15)] text-[var(--color-turkish-blue-300)]" },
  geofrontier: { label: "GeoFrontier", color: "bg-emerald-500/15 text-emerald-400" },
  lova: { label: "Lova", color: "bg-pink-500/15 text-pink-400" },
  biodefenders: { label: "BioDefenders", color: "bg-amber-500/15 text-amber-400" },
};

function parseUserAgent(ua: string | null | undefined): { device: string; browser: string; os: string } {
  if (!ua) return { device: "Bilinmiyor", browser: "Bilinmiyor", os: "Bilinmiyor" };

  let device = "Masaüstü";
  let browser = "Bilinmiyor";
  let os = "Bilinmiyor";

  // Device detection
  if (/mobile/i.test(ua)) device = "Mobil";
  else if (/tablet|ipad/i.test(ua)) device = "Tablet";

  // Browser detection
  if (/chrome/i.test(ua) && !/edge|edg/i.test(ua)) browser = "Chrome";
  else if (/firefox/i.test(ua)) browser = "Firefox";
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = "Safari";
  else if (/edge|edg/i.test(ua)) browser = "Edge";
  else if (/opera|opr/i.test(ua)) browser = "Opera";

  // OS detection
  if (/windows/i.test(ua)) os = "Windows";
  else if (/macintosh|mac os/i.test(ua)) os = "macOS";
  else if (/linux/i.test(ua) && !/android/i.test(ua)) os = "Linux";
  else if (/android/i.test(ua)) os = "Android";
  else if (/iphone|ipad|ipod/i.test(ua)) os = "iOS";

  return { device, browser, os };
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getRelativeTime(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "—";

  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Az önce";
  if (minutes < 60) return `${minutes} dk önce`;
  if (hours < 24) return `${hours} saat önce`;
  if (days < 7) return `${days} gün önce`;
  return formatDate(dateStr);
}

type UserCardProps = {
  user: User;
  isCurrentUser: boolean;
  currentUserRole?: Role;
};

function UserCard({ user, isCurrentUser, currentUserRole }: UserCardProps) {
  const [showActions, setShowActions] = useState(false);
  const roleConfig = ROLE_CONFIG[user.role];
  const sourceConfig = SOURCE_CONFIG[user.source || "tengra"];
  const deviceInfo = parseUserAgent(user.lastLoginDevice);
  const RoleIcon = roleConfig.icon;

  const canManageUser = currentUserRole === "admin" && !isCurrentUser && user.role !== "admin";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative rounded-2xl bg-[rgba(15,31,54,0.6)] border border-[rgba(72,213,255,0.12)] backdrop-blur-xl overflow-hidden hover:border-[rgba(72,213,255,0.25)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.3),0_0_25px_rgba(30,184,255,0.08)] transition-all duration-300"
    >
      {/* Header with avatar and basic info */}
      <div className="relative p-5 pb-4">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="relative">
            <div className="w-14 h-14 rounded-xl overflow-hidden bg-[rgba(30,184,255,0.1)] border border-[rgba(72,213,255,0.2)]">
              {user.avatar ? (
                <Image
                  src={resolveCdnUrl(user.avatar)}
                  alt={user.displayName || user.username || "User"}
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
            {/* Online indicator */}
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[rgba(15,31,54,1)]" />
          </div>

          {/* User info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-[var(--text-primary)] truncate">
                {user.displayName || user.username || "İsimsiz"}
              </h3>
              {isCurrentUser && (
                <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-[rgba(30,184,255,0.15)] text-[var(--color-turkish-blue-300)]">
                  Sen
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
                  <button className="w-full px-4 py-2 text-left text-sm text-[var(--text-secondary)] hover:bg-[rgba(255,255,255,0.05)] flex items-center gap-2">
                    <Edit className="w-4 h-4" /> Düzenle
                  </button>
                  <button className="w-full px-4 py-2 text-left text-sm text-[var(--text-secondary)] hover:bg-[rgba(255,255,255,0.05)] flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" /> Moderatör Yap
                  </button>
                  <button className="w-full px-4 py-2 text-left text-sm text-[var(--text-secondary)] hover:bg-[rgba(255,255,255,0.05)] flex items-center gap-2">
                    <ShieldOff className="w-4 h-4" /> Yetkiyi Kaldır
                  </button>
                  <hr className="my-1 border-[rgba(72,213,255,0.1)]" />
                  <button className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-[rgba(255,255,255,0.05)] flex items-center gap-2">
                    <Trash2 className="w-4 h-4" /> Sil
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
            {roleConfig.label}
          </div>
          {/* Source badge */}
          <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium ${sourceConfig.color}`}>
            {sourceConfig.label}
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
            <span>Son Giriş:</span>
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
            {deviceInfo.device === "Mobil" ? (
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
            <span className="text-[var(--text-muted)]">IP:</span>
            <code className="px-2 py-0.5 rounded bg-[rgba(0,0,0,0.2)] text-[var(--text-secondary)] font-mono text-[10px]">
              {user.lastLoginIp}
            </code>
          </div>
        )}

        {/* Registration date */}
        <div className="text-[11px] text-[var(--text-muted)]">
          Kayıt: {formatDate(user.createdAt)}
        </div>
      </div>
    </motion.div>
  );
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "all">("all");
  const [sourceFilter, setSourceFilter] = useState<UserSource | "all">("all");

  useEffect(() => {
    let active = true;
    const token = typeof window !== "undefined" ? window.localStorage.getItem("authToken") : null;
    if (!token) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const [fetchedUsers, me] = await Promise.all([getAllUsers(token), getUserWithToken(token)]);
        if (!active) return;
        setUsers(fetchedUsers);
        setCurrentUser(me);
      } catch {
        if (!active) return;
        setUsers([]);
        setCurrentUser(null);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          user.email.toLowerCase().includes(query) ||
          user.username?.toLowerCase().includes(query) ||
          user.displayName?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }
      // Role filter
      if (roleFilter !== "all" && user.role !== roleFilter) return false;
      // Source filter
      if (sourceFilter !== "all" && user.source !== sourceFilter) return false;
      return true;
    });
  }, [users, searchQuery, roleFilter, sourceFilter]);

  const stats = useMemo(() => {
    const total = users.length;
    const admins = users.filter((u) => u.role === "admin").length;
    const moderators = users.filter((u) => u.role === "moderator").length;
    const regular = users.filter((u) => u.role === "user").length;
    return { total, admins, moderators, regular };
  }, [users]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleRoleChange = (userId: string, role: Role) => {
    // TODO: Implement role change API call
    console.log("Change role", userId, role);
  };

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title="Kullanıcılar"
        description="Platforma kayıtlı kullanıcıların rollerini, oturumlarını ve erişimlerini yönetin."
        ctaLabel="Yeni Kullanıcı"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl bg-[rgba(15,31,54,0.6)] border border-[rgba(72,213,255,0.12)] p-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-[rgba(30,184,255,0.1)]">
              <Users className="w-5 h-5 text-[var(--color-turkish-blue-400)]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.total}</p>
              <p className="text-xs text-[var(--text-muted)]">Toplam Kullanıcı</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-xl bg-[rgba(15,31,54,0.6)] border border-[rgba(72,213,255,0.12)] p-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-purple-500/10">
              <Shield className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.admins}</p>
              <p className="text-xs text-[var(--text-muted)]">Yönetici</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl bg-[rgba(15,31,54,0.6)] border border-[rgba(72,213,255,0.12)] p-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-blue-500/10">
              <UserCog className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.moderators}</p>
              <p className="text-xs text-[var(--text-muted)]">Moderatör</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-xl bg-[rgba(15,31,54,0.6)] border border-[rgba(72,213,255,0.12)] p-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-gray-500/10">
              <UserIcon className="w-5 h-5 text-gray-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.regular}</p>
              <p className="text-xs text-[var(--text-muted)]">Standart</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col md:flex-row gap-4"
      >
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Kullanıcı ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-[rgba(15,31,54,0.6)] border border-[rgba(72,213,255,0.12)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[rgba(72,213,255,0.3)] focus:outline-none transition-colors"
          />
        </div>

        {/* Role filter */}
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as Role | "all")}
            className="appearance-none pl-11 pr-10 py-3 rounded-xl bg-[rgba(15,31,54,0.6)] border border-[rgba(72,213,255,0.12)] text-sm text-[var(--text-primary)] focus:border-[rgba(72,213,255,0.3)] focus:outline-none transition-colors cursor-pointer"
          >
            <option value="all">Tüm Roller</option>
            <option value="admin">Yönetici</option>
            <option value="moderator">Moderatör</option>
            <option value="user">Standart</option>
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
        </div>

        {/* Source filter */}
        <div className="relative">
          <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value as UserSource | "all")}
            className="appearance-none pl-11 pr-10 py-3 rounded-xl bg-[rgba(15,31,54,0.6)] border border-[rgba(72,213,255,0.12)] text-sm text-[var(--text-primary)] focus:border-[rgba(72,213,255,0.3)] focus:outline-none transition-colors cursor-pointer"
          >
            <option value="all">Tüm Kaynaklar</option>
            <option value="tengra">Tengra</option>
            <option value="geofrontier">GeoFrontier</option>
            <option value="lova">Lova</option>
            <option value="biodefenders">BioDefenders</option>
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
        </div>
      </motion.div>

      {/* Users Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-64 rounded-2xl bg-[rgba(15,31,54,0.4)] border border-[rgba(72,213,255,0.08)] animate-pulse"
            />
          ))}
        </div>
      ) : filteredUsers.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-2xl border border-dashed border-[rgba(72,213,255,0.15)] bg-[rgba(15,31,54,0.4)] p-12 text-center"
        >
          <Users className="w-12 h-12 mx-auto text-[var(--text-muted)] mb-4" />
          <p className="text-[var(--text-muted)]">
            {searchQuery || roleFilter !== "all" || sourceFilter !== "all"
              ? "Filtrelere uygun kullanıcı bulunamadı."
              : "Henüz kullanıcı bulunmuyor."}
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              isCurrentUser={currentUser?.id === user.id}
              currentUserRole={currentUser?.role}
            />
          ))}
        </div>
      )}
    </div>
  );
}
