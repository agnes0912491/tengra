"use client";

import { useEffect, useState } from "react";
import type { ActiveAgent } from "@/lib/db";
import { getActiveAgents } from "@/lib/db";
import { useAdminToken } from "@/hooks/use-admin-token";

type Props = {
  title?: string;
};

const formatDuration = (start?: string, end?: string) => {
  const startTs = start ? Date.parse(start) : NaN;
  const endTs = end ? Date.parse(end) : Date.now();
  if (Number.isNaN(startTs) || Number.isNaN(endTs) || endTs < startTs) return "—";
  const total = Math.floor((endTs - startTs) / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const parts = [h ? `${h}sa` : null, m ? `${m}dk` : null, `${s}sn`].filter(Boolean);
  return parts.join(" ");
};

export default function ActiveAgents({ title = "Aktif Agentlar" }: Props) {
  const [agents, setAgents] = useState<ActiveAgent[]>([]);
  const [loading, setLoading] = useState(true);

  const { token } = useAdminToken();

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!token) {
        setAgents([]);
        setLoading(false);
        return;
      }
      try {
        const list = await getActiveAgents(token);
        if (mounted) setAgents(list);
      } catch {
        if (mounted) setAgents([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    const id = setInterval(load, 10000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [token]);

  return (
    <div className="relative rounded-3xl p-[1px] bg-gradient-to-br from-[rgba(110,211,225,0.25)]/30 via-transparent to-transparent">
      <div className="rounded-[calc(1.5rem-1px)] border border-[rgba(110,211,225,0.18)] bg-[rgba(6,20,27,0.65)]/80 p-6 shadow-[0_25px_70px_rgba(0,0,0,0.45)] backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-[color:var(--color-turkish-blue-200)]">{title}</h3>
          <span className="text-xs text-[rgba(255,255,255,0.7)]">Canlı</span>
        </div>

        {loading ? (
          <div className="mt-4 rounded-xl border border-dashed border-[rgba(110,211,225,0.2)] bg-[rgba(8,24,32,0.5)] p-6 text-sm text-[rgba(255,255,255,0.75)]">
            Yükleniyor...
          </div>
        ) : agents.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-[rgba(110,211,225,0.2)] bg-[rgba(8,24,32,0.5)] p-6 text-sm text-[rgba(255,255,255,0.75)]">
            Şu anda aktif agent bulunmuyor.
          </div>
        ) : (
          <div className="mt-4 overflow-hidden rounded-2xl border border-[rgba(110,211,225,0.18)] bg-[rgba(8,24,32,0.6)]">
            <table className="min-w-full divide-y divide-[rgba(110,211,225,0.12)] text-sm text-[rgba(255,255,255,0.82)]">
              <thead className="bg-[rgba(8,24,32,0.9)] text-[rgba(255,255,255,0.75)]">
                <tr>
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.18em]">Agent</th>
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.18em]">Aktif Süre</th>
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.18em]">Son Görülme</th>
                  <th className="px-4 py-3 text-right text-[11px] uppercase tracking-[0.18em]">Accepted</th>
                  <th className="px-4 py-3 text-right text-[11px] uppercase tracking-[0.18em]">Declined</th>
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.18em]">Sayfalar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(110,211,225,0.08)]">
                {agents.map((agent) => (
                  <tr key={agent.id} className="align-top">
                    <td className="px-4 py-3 font-semibold text-white">{agent.agent || "Bilinmiyor"}</td>
                    <td className="px-4 py-3 text-[rgba(255,255,255,0.8)]">
                      {formatDuration(agent.startedAt, agent.lastSeenAt)}
                    </td>
                    <td className="px-4 py-3 text-[rgba(255,255,255,0.8)]">
                      {agent.lastSeenAt ? new Date(agent.lastSeenAt).toLocaleString() : "—"}
                    </td>
                    <td className="px-4 py-3 text-right text-[rgba(255,255,255,0.9)]">{agent.accepted ?? 0}</td>
                    <td className="px-4 py-3 text-right text-[rgba(255,255,255,0.7)]">{agent.declined ?? 0}</td>
                    <td className="px-4 py-3 text-[rgba(255,255,255,0.8)]">
                      {agent.pages?.length ? (
                        <ul className="space-y-1 text-xs">
                          {agent.pages.map((p, idx) => (
                            <li key={`${agent.id}-${idx}`} className="truncate">{p}</li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-[rgba(255,255,255,0.6)]">Henüz kayıt yok</span>
                      )}
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
