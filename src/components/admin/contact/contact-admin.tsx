"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "@tengra/language";
import { Mail, Trash2, User, Phone, MapPin, Clock, Bell, Inbox } from "lucide-react";

import { getContactSubmissions, deleteContactSubmission, type ContactSubmission, getContactSubscriptions, deleteContactSubscription } from "@/lib/db";
import { useAdminToken } from "@/hooks/use-admin-token";
import { AdminCard, AdminCardHeader, AdminBadge } from "@/components/admin/ui";

const formatDate = (value?: string, locale?: string) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(locale ?? "tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

export default function ContactAdmin() {
  const { language: locale } = useTranslation();
  const { t } = useTranslation("AdminContent");

  const [items, setItems] = useState<ContactSubmission[]>([]);
  const [subscriptions, setSubscriptions] = useState<Array<{ id: string | number; email: string; createdAt?: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAdminToken();

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!token) {
        setError(t("authorizationMissing"));
        setItems([]);
        return;
      }
      const list = await getContactSubmissions(token);
      setItems(list);
      const subs = await getContactSubscriptions(token);
      setSubscriptions(subs);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clearAll = () => {
    if (!token) {
      setError(t("authorizationMissing"));
      return;
    }
    Promise.all(items.map((it) => deleteContactSubmission(it.id as string, token)))
      .then(() => Promise.all(subscriptions.map((s) => deleteContactSubscription(s.id, token))))
      .finally(load);
  };

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <AdminCard variant="elevated" padding="md">
          <div className="flex items-center gap-2 text-[rgba(255,255,255,0.5)] text-xs">
            <Inbox className="h-4 w-4" />
            <span>{t("contactMessages")}</span>
          </div>
          <p className="text-2xl font-bold text-white mt-1">{items.length}</p>
        </AdminCard>
        <AdminCard variant="elevated" padding="md">
          <div className="flex items-center gap-2 text-[rgba(130,226,255,0.8)] text-xs">
            <Bell className="h-4 w-4" />
            <span>{t("contactSubscribers")}</span>
          </div>
          <p className="text-2xl font-bold text-white mt-1">{subscriptions.length}</p>
        </AdminCard>
      </div>

      {/* Contact Submissions */}
      <AdminCard variant="default" padding="md">
        <AdminCardHeader
          title={t("contactTitle")}
          description={t("contactDescription")}
          action={
            <button
              onClick={clearAll}
              disabled={!items.length}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 text-xs hover:bg-red-500/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {t("contactClear")}
            </button>
          }
        />

        {loading && (
          <div className="text-center py-8 text-[rgba(255,255,255,0.5)]">
            {t("loading")}
          </div>
        )}
        {error && <p className="text-sm text-red-400">{error}</p>}

        {items.length === 0 && !loading ? (
          <div className="mt-4 rounded-xl border border-dashed border-[rgba(72,213,255,0.15)] bg-[rgba(8,18,26,0.5)] p-8 text-center">
            <Inbox className="h-10 w-10 mx-auto text-[rgba(255,255,255,0.2)] mb-3" />
            <p className="text-sm text-[rgba(255,255,255,0.5)]">{t("contactEmpty")}</p>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-[rgba(72,213,255,0.1)] bg-[rgba(8,18,26,0.5)] p-4 hover:border-[rgba(72,213,255,0.2)] transition-all"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[rgba(72,213,255,0.2)] to-[rgba(72,213,255,0.05)] flex items-center justify-center text-[rgba(130,226,255,0.8)]">
                        <User className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{item.name}</p>
                        <div className="flex items-center gap-3 text-xs text-[rgba(255,255,255,0.5)]">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {item.email}
                          </span>
                          {item.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {item.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <AdminBadge variant="info" size="sm">{item.subject}</AdminBadge>
                  </div>
                  <div className="text-right text-xs text-[rgba(255,255,255,0.4)]">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(item.createdAt, locale)}
                    </div>
                    {(item.city || item.country) && (
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" />
                        {[item.city, item.country].filter(Boolean).join(", ")}
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-[rgba(255,255,255,0.05)]">
                  <p className="text-xs uppercase tracking-wider text-[rgba(255,255,255,0.4)] mb-1">{t("contactMessageLabel")}</p>
                  <p className="text-sm text-[rgba(255,255,255,0.8)] whitespace-pre-wrap">{item.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminCard>

      {/* Subscriptions */}
      <AdminCard variant="default" padding="md">
        <AdminCardHeader
          title={t("subscriptionsTitle")}
          description={t("subscriptionsDesc")}
        />
        {subscriptions.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-[rgba(72,213,255,0.15)] bg-[rgba(8,18,26,0.5)] p-6 text-center">
            <Bell className="h-8 w-8 mx-auto text-[rgba(255,255,255,0.2)] mb-2" />
            <p className="text-sm text-[rgba(255,255,255,0.5)]">{t("subscriptionsEmpty")}</p>
          </div>
        ) : (
          <div className="mt-4 overflow-hidden rounded-xl border border-[rgba(72,213,255,0.1)]">
            <table className="w-full text-sm">
              <thead className="border-b border-[rgba(255,255,255,0.06)] bg-[rgba(0,0,0,0.2)]">
                <tr>
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.15em] font-medium text-[rgba(255,255,255,0.45)]">
                    {t("emailLabel")}
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.15em] font-medium text-[rgba(255,255,255,0.45)]">
                    {t("dateLabel")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(255,255,255,0.04)]">
                {subscriptions.map((s) => (
                  <tr key={s.id} className="hover:bg-[rgba(72,213,255,0.04)] transition-colors">
                    <td className="px-4 py-3 text-white">{s.email}</td>
                    <td className="px-4 py-3 text-[rgba(255,255,255,0.5)]">
                      {formatDate(s.createdAt, locale)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>
    </div>
  );
}
