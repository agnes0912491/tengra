"use client";

import { useMemo, useState, useTransition } from "react";
import Cookies from "js-cookie";
import { toast } from "react-toastify";

import type { Role, User } from "@/lib/auth/users";
import { ADMIN_SESSION_COOKIE_CANDIDATES } from "@/lib/auth";
import { updateUserRole } from "@/lib/db";

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: "admin", label: "Yönetici" },
  { value: "moderator", label: "Moderatör" },
  { value: "user", label: "Standart" },
];

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

export default function UsersTable({ initialUsers, currentUserId, currentUserRole }: Props) {
  const [users, setUsers] = useState<LocalUser[]>(() =>
    initialUsers.map((user) => ({ ...user, isUpdating: false }))
  );
  const [isPending, startTransition] = useTransition();

  const handleRoleChange = (userId: string, role: Role) => {
    if (currentUserId && currentUserId === userId) {
      toast.error("Kendi rolünüzü değiştiremezsiniz.");
      return;
    }
    const token = ADMIN_SESSION_COOKIE_CANDIDATES.map((name) => Cookies.get(name)).find(
      (value): value is string => Boolean(value)
    );
    if (!token) {
      toast.error("Yetkilendirme bilgisi bulunamadı.");
      return;
    }

    setUsers((current) =>
      current.map((user) =>
        user.id === userId ? { ...user, role, isUpdating: true } : user
      )
    );

    startTransition(async () => {
      try {
        const updatedUser = await updateUserRole(userId, role, token);
        setUsers((current) =>
          current.map((user) =>
            user.id === userId
              ? { ...updatedUser, isUpdating: false }
              : { ...user, isUpdating: false }
          )
        );
        toast.success("Kullanıcı rolü güncellendi.");
      } catch (error) {
        console.error("Failed to update user role", error);
        setUsers((current) =>
          current.map((user) =>
            user.id === userId ? { ...user, isUpdating: false } : user
          )
        );
        toast.error("Rol güncellenemedi. Lütfen tekrar deneyin.");
      }
    });
  };

  const isBusy = useMemo(
    () => isPending || users.some((user) => user.isUpdating),
    [isPending, users]
  );

  if (users.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-[rgba(110,211,225,0.2)] bg-[rgba(6,20,27,0.6)]/60 p-10 text-center text-sm text-[rgba(255,255,255,0.55)]">
        Kullanıcı verisi yüklenemedi. Daha sonra tekrar deneyin.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-[rgba(110,211,225,0.16)] bg-[rgba(6,20,27,0.55)]/80 shadow-[0_25px_70px_rgba(0,0,0,0.45)] backdrop-blur-xl">
      <table className="min-w-full divide-y divide-[rgba(110,211,225,0.15)]">
        <thead className="bg-[rgba(8,24,32,0.8)] text-[rgba(255,255,255,0.65)]">
          <tr>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.35em]">
              Kullanıcı
            </th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.35em]">
              Rol
            </th>
            <th scope="col" className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-[0.35em]">
              İşlem
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[rgba(110,211,225,0.08)] text-sm text-[rgba(255,255,255,0.8)]">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-[rgba(8,32,42,0.55)]">
              <td className="px-6 py-4">
                <p className="font-semibold text-white">{user.displayName ?? user.email}</p>
                <p className="text-xs text-[rgba(255,255,255,0.55)]">{user.email}</p>
              </td>
              <td className="px-6 py-4">
                <div className="inline-flex rounded-full border border-[rgba(110,211,225,0.3)] bg-[rgba(8,28,38,0.65)] px-3 py-2 text-xs uppercase tracking-[0.3em] text-[rgba(255,255,255,0.75)]">
                  {ROLE_OPTIONS.find((option) => option.value === user.role)?.label ?? "Bilinmiyor"}
                </div>
              </td>
              <td className="px-6 py-4 text-right">
                {currentUserId !== user.id && !isHigherRole(user.role as Role, currentUserRole) ? (
                  <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(110,211,225,0.25)] bg-[rgba(8,28,38,0.55)] px-3 py-2">
                    <label htmlFor={`role-${user.id}`} className="text-[10px] uppercase tracking-[0.35em] text-[rgba(255,255,255,0.45)]">
                      Rolü değiştir
                    </label>
                    <select
                      id={`role-${user.id}`}
                      value={user.role}
                      disabled={isBusy}
                      onChange={(event) => handleRoleChange(user.id, event.target.value as Role)}
                      className="rounded-full border border-[rgba(110,211,225,0.25)] bg-[rgba(4,18,24,0.85)] px-3 py-1 text-xs text-[rgba(255,255,255,0.85)] focus:border-[rgba(110,211,225,0.55)] focus:outline-none"
                    >
                      {ROLE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
