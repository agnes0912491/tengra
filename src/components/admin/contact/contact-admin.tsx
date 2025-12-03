"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { getContactSubmissions, deleteContactSubmission, type ContactSubmission, getContactSubscriptions, deleteContactSubscription } from "@/lib/db";
import Cookies from "js-cookie";
import { ADMIN_SESSION_COOKIE_CANDIDATES } from "@/lib/auth";

export default function ContactAdmin() {
  const t = useTranslations("AdminContent");
  const tc = useTranslations("Contact");
  const [items, setItems] = useState<ContactSubmission[]>([]);
  const [subscriptions, setSubscriptions] = useState<Array<{ id: string | number; email: string; createdAt?: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getToken = () => {
    return ADMIN_SESSION_COOKIE_CANDIDATES.map((n) => Cookies.get(n)).find(Boolean) || null;
  };

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      if (!token) {
        setError("Yetkilendirme bulunamadı.");
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
    const token = getToken();
    if (!token) {
      setError("Yetkilendirme bulunamadı.");
      return;
    }
    Promise.all(items.map((it) => deleteContactSubmission(it.id as string, token)))
      .then(() => Promise.all(subscriptions.map((s) => deleteContactSubscription(s.id, token))))
      .finally(load);
  };

  return (
    <div className="rounded-3xl border border-[rgba(110,211,225,0.14)] bg-[rgba(6,18,26,0.78)]/80 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.35)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">{t("contactTitle")}</h3>
          <p className="text-sm text-[rgba(255,255,255,0.7)]">{t("contactDescription")}</p>
        </div>
        <Button variant="outline" onClick={clearAll} disabled={!items.length} className="border-[rgba(110,211,225,0.28)]">
          {t("contactClear")}
        </Button>
      </div>

      {loading && <p className="mt-4 text-sm text-[rgba(255,255,255,0.75)]">{t("loading")}</p>}
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}

      {items.length === 0 && !loading ? (
        <div className="mt-4 rounded-xl border border-dashed border-[rgba(110,211,225,0.2)] bg-[rgba(8,28,38,0.5)] p-8 text-center text-sm text-[rgba(255,255,255,0.75)]">
          {t("contactEmpty")}
        </div>
      ) : (
        <div className="mt-4 overflow-hidden rounded-2xl border border-[rgba(110,211,225,0.18)]">
          <table className="min-w-full divide-y divide-[rgba(110,211,225,0.12)] bg-[rgba(6,18,26,0.8)]">
            <thead className="bg-[rgba(8,24,32,0.9)] text-[rgba(255,255,255,0.75)]">
              <tr>
                <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.18em]">{tc("name")}</th>
                <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.18em]">{tc("email")}</th>
                <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.18em]">{tc("subject")}</th>
                <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.18em]">{tc("phone")}</th>
                <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.18em]">{t("location")}</th>
                <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.18em]">{t("submittedAt")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(110,211,225,0.08)] text-sm text-[rgba(255,255,255,0.82)]">
              {items.map((item) => (
                <tr key={item.id} className="align-top">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-white">{item.name}</p>
                  </td>
                  <td className="px-4 py-3 text-[rgba(255,255,255,0.75)]">{item.email}</td>
                  <td className="px-4 py-3">{item.subject}</td>
                  <td className="px-4 py-3 text-[rgba(255,255,255,0.8)]">{item.phone || "—"}</td>
                  <td className="px-4 py-3 text-[rgba(255,255,255,0.75)]">
                    {[item.city, item.country].filter(Boolean).join(", ") || item.ipAddress || "—"}
                  </td>
                  <td className="px-4 py-3 text-[12px] text-[rgba(255,255,255,0.65)]">
                    {new Date(item.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {items.map((item) => (
            <div key={`${item.id}-msg`} className="border-t border-[rgba(110,211,225,0.08)] bg-[rgba(6,16,22,0.9)] px-4 py-3 text-sm text-[rgba(255,255,255,0.85)]">
              <p className="text-[11px] uppercase tracking-[0.16em] text-[rgba(255,255,255,0.6)]">{tc("message")}</p>
              <p className="mt-1 whitespace-pre-wrap">{item.message}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-10 rounded-3xl border border-[rgba(110,211,225,0.18)] bg-[rgba(6,18,26,0.78)]/80 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.35)]">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h4 className="text-lg font-semibold text-white">{t("subscriptionsTitle")}</h4>
            <p className="text-sm text-[rgba(255,255,255,0.7)]">{t("subscriptionsDesc")}</p>
          </div>
        </div>
        {subscriptions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[rgba(110,211,225,0.2)] bg-[rgba(8,28,38,0.5)] p-6 text-center text-sm text-[rgba(255,255,255,0.75)]">
            {t("subscriptionsEmpty")}
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-[rgba(110,211,225,0.16)]">
            <table className="min-w-full divide-y divide-[rgba(110,211,225,0.12)] bg-[rgba(6,18,26,0.8)]">
              <thead className="bg-[rgba(8,24,32,0.9)] text-[rgba(255,255,255,0.75)]">
                <tr>
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.18em]">{tc("email")}</th>
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.18em]">{t("submittedAt")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(110,211,225,0.08)] text-sm text-[rgba(255,255,255,0.82)]">
                {subscriptions.map((s) => (
                  <tr key={s.id}>
                    <td className="px-4 py-3">{s.email}</td>
                    <td className="px-4 py-3 text-[12px] text-[rgba(255,255,255,0.65)]">
                      {s.createdAt ? new Date(s.createdAt).toLocaleString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
