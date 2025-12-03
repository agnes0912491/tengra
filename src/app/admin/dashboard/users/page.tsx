"use client";

import { useEffect, useState } from "react";

import AdminPageHeader from "@/components/admin/admin-page-header";
import UsersTable from "@/components/admin/users/users-table";
import { getAllUsers, getUserWithToken } from "@/lib/db";
import type { Role, User } from "@/lib/auth/users";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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

  const currentRole: Role | undefined = currentUser?.role;

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title="Kullanıcılar"
        description="Platforma kayıtlı kullanıcıların rollerini ve erişimlerini yönetin."
        ctaLabel="Yeni Kullanıcı"
      />
      {loading ? (
        <div className="rounded-3xl border border-dashed border-[rgba(110,211,225,0.2)] bg-[rgba(6,20,27,0.6)]/60 p-10 text-center text-sm text-[rgba(255,255,255,0.55)]">
          Kullanıcılar yükleniyor...
        </div>
      ) : (
        <UsersTable initialUsers={users} currentUserId={currentUser?.id} currentUserRole={currentRole} />
      )}
    </div>
  );
}
