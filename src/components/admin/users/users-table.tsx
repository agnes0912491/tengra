"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "react-toastify";
import { User as UserIcon, Shield, UserCog, Mail, MoreVertical } from "lucide-react";
import { useTranslations } from "next-intl";

import type { Role, User } from "@/lib/auth/users";
import { updateUserRole } from "@/lib/db";
import { useAdminToken } from "@/hooks/use-admin-token";
import { AdminCard, AdminBadge } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

const ROLE_OPTIONS: { value: Role; labelKey: string; icon: React.ReactNode }[] = [
  { value: "admin", labelKey: "roles.admin", icon: <Shield className="h-3.5 w-3.5" /> },
  { value: "moderator", labelKey: "roles.moderator", icon: <UserCog className="h-3.5 w-3.5" /> },
  { value: "user", labelKey: "roles.user", icon: <UserIcon className="h-3.5 w-3.5" /> },
];

const normalizeRoleValue = (role: string | Role | null | undefined): Role => {
  const lowered = (role ?? "").toString().toLowerCase();
  if (lowered === "admin") return "admin";
  if (lowered === "moderator") return "moderator";
  return "user";
};

type Props = {
  initialUsers: User[];
  currentUserId?: string;
  currentUserRole?: Role;
};

type LocalUser = User & {
  isUpdating?: boolean;
};

const roleRank: Record<Role, number> = { user: 0, moderator: 1, admin: 2 };

const isHigherRole = (a: Role, b: Role | undefined) => {
  if (!b) return false;
  return roleRank[a] > roleRank[b];
};

const getRoleBadgeVariant = (role: Role): "default" | "success" | "warning" | "danger" | "info" => {
  switch (role) {
    case "admin": return "danger";
    case "moderator": return "warning";
    default: return "default";
  }
};

export default function UsersTable({ initialUsers, currentUserId, currentUserRole }: Props) {
  const t = useTranslations("AdminUsers");
  const [users, setUsers] = useState<LocalUser[]>(() =>
    initialUsers.map((user) => ({ ...user, role: normalizeRoleValue(user.role), isUpdating: false }))
  );
  const [isPending, startTransition] = useTransition();
  const { token } = useAdminToken();

  const handleRoleChange = (userId: string, role: Role) => {
    if (currentUserId && currentUserId === userId) {
      toast.error(t("table.toast.selfRoleChange"));
      return;
    }
    if (!token) {
      toast.error(t("table.toast.authMissing"));
      return;
    }

    const previousRole = users.find((u) => u.id === userId)?.role ?? "user";

    setUsers((current) =>
      current.map((user) => (user.id === userId ? { ...user, role, isUpdating: true } : user))
    );

    startTransition(async () => {
      try {
        const updatedUser = await updateUserRole(userId, role, token);
        const normalized = { ...updatedUser, role: normalizeRoleValue(updatedUser.role) };
        setUsers((current) =>
          current.map((user) =>
            user.id === userId
              ? { ...normalized, isUpdating: false }
              : { ...user, isUpdating: false }
          )
        );
        toast.success(t("table.toast.roleUpdated"));
      } catch (error) {
        console.error("Failed to update user role", error);
        setUsers((current) =>
          current.map((user) =>
            user.id === userId ? { ...user, role: previousRole, isUpdating: false } : user
          )
        );
        toast.error(t("table.toast.roleUpdateFailed"));
      }
    });
  };

  const isBusy = useMemo(
    () => isPending || users.some((user) => user.isUpdating),
    [isPending, users]
  );

  const stats = useMemo(() => ({
    total: users.length,
    admins: users.filter(u => u.role === "admin").length,
    moderators: users.filter(u => u.role === "moderator").length,
    standard: users.filter(u => u.role === "user").length,
  }), [users]);

  if (users.length === 0) {
    return (
      <AdminCard variant="bordered" className="text-center py-12">
        <UserIcon className="h-12 w-12 mx-auto mb-3 text-[rgba(255,255,255,0.3)]" />
        <p className="text-[rgba(255,255,255,0.5)]">{t("table.empty")}</p>
      </AdminCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <AdminCard variant="elevated" padding="md">
          <div className="flex items-center gap-2 text-[rgba(255,255,255,0.5)] text-xs">
            <UserIcon className="h-4 w-4" />
            <span>{t("stats.total")}</span>
          </div>
          <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
        </AdminCard>
        <AdminCard variant="elevated" padding="md">
          <div className="flex items-center gap-2 text-red-400 text-xs">
            <Shield className="h-4 w-4" />
            <span>{t("roles.admin")}</span>
          </div>
          <p className="text-2xl font-bold text-white mt-1">{stats.admins}</p>
        </AdminCard>
        <AdminCard variant="elevated" padding="md">
          <div className="flex items-center gap-2 text-amber-400 text-xs">
            <UserCog className="h-4 w-4" />
            <span>{t("roles.moderator")}</span>
          </div>
          <p className="text-2xl font-bold text-white mt-1">{stats.moderators}</p>
        </AdminCard>
        <AdminCard variant="elevated" padding="md">
          <div className="flex items-center gap-2 text-[rgba(255,255,255,0.5)] text-xs">
            <UserIcon className="h-4 w-4" />
            <span>{t("roles.user")}</span>
          </div>
          <p className="text-2xl font-bold text-white mt-1">{stats.standard}</p>
        </AdminCard>
      </div>

      {/* Table */}
      <AdminCard variant="default" padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-[rgba(255,255,255,0.06)] bg-[rgba(0,0,0,0.2)]">
              <tr>
                <th className="px-4 py-3.5 text-left text-[11px] uppercase tracking-[0.15em] font-medium text-[rgba(255,255,255,0.45)]">
                  {t("table.columns.user")}
                </th>
                <th className="px-4 py-3.5 text-left text-[11px] uppercase tracking-[0.15em] font-medium text-[rgba(255,255,255,0.45)]">
                  {t("table.columns.email")}
                </th>
                <th className="px-4 py-3.5 text-left text-[11px] uppercase tracking-[0.15em] font-medium text-[rgba(255,255,255,0.45)]">
                  {t("table.columns.role")}
                </th>
                <th className="px-4 py-3.5 text-right text-[11px] uppercase tracking-[0.15em] font-medium text-[rgba(255,255,255,0.45)]">
                  {t("table.columns.action")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(255,255,255,0.04)]">
              {users.map((user) => (
                <tr
                  key={user.id}
                  className={cn(
                    "hover:bg-[rgba(72,213,255,0.04)] transition-colors",
                    user.isUpdating && "opacity-50"
                  )}
                >
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[rgba(72,213,255,0.2)] to-[rgba(72,213,255,0.05)] flex items-center justify-center text-[rgba(130,226,255,0.8)]">
                        <UserIcon className="h-4 w-4" />
                      </div>
                      <p className="font-medium text-white">{user.displayName ?? user.username ?? "—"}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2 text-[rgba(255,255,255,0.6)]">
                      <Mail className="h-3.5 w-3.5" />
                      <span>{user.email}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <AdminBadge variant={getRoleBadgeVariant(user.role as Role)} size="md">
                      {ROLE_OPTIONS.find((o) => o.value === user.role)?.icon}
                      {ROLE_OPTIONS.find((o) => o.value === user.role)?.labelKey
                        ? t(ROLE_OPTIONS.find((o) => o.value === user.role)?.labelKey as string)
                        : t("labels.unknown")}
                    </AdminBadge>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    {currentUserId !== user.id && !isHigherRole(user.role as Role, currentUserRole) ? (
                      <select
                        value={user.role}
                        disabled={isBusy}
                        onChange={(e) => handleRoleChange(user.id, e.target.value as Role)}
                        className="rounded-lg border border-[rgba(72,213,255,0.15)] bg-[rgba(8,18,26,0.8)] px-3 py-1.5 text-xs text-white outline-none focus:border-[rgba(72,213,255,0.3)] transition-colors"
                      >
                        {ROLE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {t(option.labelKey)}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-xs text-[rgba(255,255,255,0.3)]">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminCard>
    </div>
  );
}
