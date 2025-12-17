"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

import AdminPageHeader from "@/components/admin/admin-page-header";
import UserEditModal from "@/components/admin/users/user-edit-modal";
import { getAllUsers, getUserWithToken, deleteUser, updateUserRole, getUsersPresence, UserPresenceMap } from "@/lib/db";
import UserCreateModal from "@/components/admin/users/user-create-modal";
import type { User, Role, UserSource } from "@/lib/auth/users";
import { toast } from "react-toastify";
import UserCard from "@/components/admin/users/user-card";
import {
  Users,
  Shield,
  UserCog,
  User as UserIcon,
  Search,
  Filter,
  ChevronDown,
  Globe,
  Trash2
} from "lucide-react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "all">("all");
  const [sourceFilter, setSourceFilter] = useState<UserSource | "all">("all");
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [presenceMap, setPresenceMap] = useState<UserPresenceMap>({});

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

        // Fetch initial presence
        const userIds = fetchedUsers.map(u => Number(u.id));
        const presence = await getUsersPresence(token, userIds);
        if (active) setPresenceMap(presence);
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

  // Poll presence every 15 seconds
  useEffect(() => {
    const token = typeof window !== "undefined" ? window.localStorage.getItem("authToken") : null;
    if (!token || users.length === 0) return;

    const fetchPresence = async () => {
      try {
        const userIds = users.map(u => Number(u.id));
        const presence = await getUsersPresence(token, userIds);
        setPresenceMap(presence);
      } catch (err) {
        console.error("[presence] polling error", err);
      }
    };

    const interval = setInterval(fetchPresence, 15000);
    return () => clearInterval(interval);
  }, [users]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          user.email.toLowerCase().includes(query) ||
          (user.username && user.username.toLowerCase().includes(query)) ||
          (user.displayName && user.displayName.toLowerCase().includes(query));
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

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(new Set(filteredUsers.map((u) => u.id)));
    } else {
      setSelectedUsers(new Set());
    }
  };

  const handleSelectUser = (userId: string, selected: boolean) => {
    const newSelected = new Set(selectedUsers);
    if (selected) {
      newSelected.add(userId);
    } else {
      newSelected.delete(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedUsers);
    if (ids.length === 0) return;

    // Optimistic update: remove users from UI immediately
    setUsers((prev) => prev.filter((u) => !selectedUsers.has(u.id)));
    setSelectedUsers(new Set());
    toast.info(`${ids.length} kullanıcı siliniyor...`);

    const token = localStorage.getItem("authToken");
    if (!token) return;

    try {
      await Promise.all(ids.map((id) => deleteUser(id, token)));
      toast.success("Seçili kullanıcılar silindi.");
      refreshUsers();
    } catch {
      toast.error("Toplu silme sırasında hata oluştu.");
      refreshUsers(); // Revert on error
    }
  };

  const handleRoleChange = async (userId: string, role: Role) => {
    // ... same ...
  };

  const handleDelete = async (userId: string) => {
    // Direct delete without confirmation
    const token = localStorage.getItem("authToken");
    if (!token) return;

    // Optimistic update
    setUsers(prev => prev.filter(u => u.id !== userId));
    toast.info("Kullanıcı siliniyor...");

    try {
      const success = await deleteUser(userId, token);
      if (success) {
        toast.success("Kullanıcı silindi.");
      } else {
        toast.error("Silme işlemi başarısız.");
        refreshUsers(); // Revert
      }
    } catch {
      toast.error("Silme işlemi başarısız.");
      refreshUsers(); // Revert
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setEditModalOpen(true);
  };

  const refreshUsers = () => {
    const token = typeof window !== "undefined" ? window.localStorage.getItem("authToken") : null;
    if (!token) return;
    getAllUsers(token).then(setUsers).catch(console.error);
  };

  return (
    <div className="flex flex-col gap-8">
      <UserCreateModal
        open={userModalOpen}
        onClose={() => setUserModalOpen(false)}
        onSuccess={refreshUsers}
      />
      <UserEditModal
        user={editingUser}
        open={editModalOpen}
        onClose={() => { setEditModalOpen(false); setEditingUser(null); }}
        onSuccess={refreshUsers}
      />
      <div className="flex items-center justify-between">
        <AdminPageHeader
          title="Kullanıcılar"
          description="Platforma kayıtlı kullanıcıların rollerini, oturumlarını ve erişimlerini yönetin."
          ctaLabel="Yeni Kullanıcı"
          onCtaClick={() => setUserModalOpen(true)}
        />
        <div className="flex items-center gap-3">
          {/* Select All - Custom Checkbox */}
          <label className="flex items-center gap-3 bg-[rgba(15,31,54,0.6)] border border-[rgba(72,213,255,0.12)] px-4 py-2.5 rounded-xl cursor-pointer hover:border-[rgba(72,213,255,0.25)] transition-all group">
            <div className="relative">
              <input
                type="checkbox"
                checked={selectedUsers.size > 0 && selectedUsers.size === filteredUsers.length}
                ref={(input) => {
                  if (input) {
                    input.indeterminate = selectedUsers.size > 0 && selectedUsers.size < filteredUsers.length;
                  }
                }}
                onChange={(e) => toggleSelectAll(e.target.checked)}
                className="sr-only peer"
              />
              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${selectedUsers.size > 0
                ? "bg-[var(--color-turkish-blue-500)] border-[var(--color-turkish-blue-500)]"
                : "bg-[rgba(15,31,54,0.95)] border-[rgba(72,213,255,0.3)] group-hover:border-[var(--color-turkish-blue-400)]"
                }`}>
                {selectedUsers.size > 0 && selectedUsers.size === filteredUsers.length && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {selectedUsers.size > 0 && selectedUsers.size < filteredUsers.length && (
                  <div className="w-2.5 h-0.5 bg-white rounded-full" />
                )}
              </div>
            </div>
            <span className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
              {selectedUsers.size === 0 ? "Tümünü Seç" : `${selectedUsers.size} / ${filteredUsers.length}`}
            </span>
          </label>

          {/* Bulk Delete Button - Animated Entry */}
          {selectedUsers.size > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9, x: -10 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: -10 }}
              onClick={handleBulkDelete}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-sm font-medium rounded-xl shadow-lg shadow-red-500/20 transition-all duration-200 hover:shadow-red-500/30"
            >
              <Trash2 className="w-4 h-4" />
              <span>{selectedUsers.size} Kullanıcıyı Sil</span>
            </motion.button>
          )}
        </div>
      </div>


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
              isSelected={selectedUsers.has(user.id)}
              isOnline={presenceMap[Number(user.id)]?.online ?? false}
              onSelect={handleSelectUser}
              onDelete={handleDelete}
              onRoleChange={handleRoleChange}
              onEdit={handleEdit}
            />
          ))}
        </div>
      )}
    </div>
  );
}
