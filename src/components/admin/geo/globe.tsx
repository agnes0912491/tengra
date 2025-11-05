"use client";

import { useMemo } from "react";

type CountryPoint = { country: string; count: number };

const COORDS: Record<string, { lat: number; lng: number }> = {
  TR: { lat: 39, lng: 35 },
  US: { lat: 39, lng: -98 },
  GB: { lat: 54, lng: -2 },
  DE: { lat: 51, lng: 10 },
  FR: { lat: 47, lng: 2 },
  ES: { lat: 40, lng: -4 },
  IT: { lat: 42, lng: 12 },
  NL: { lat: 52, lng: 5 },
  RU: { lat: 61, lng: 99 },
  IN: { lat: 22, lng: 78 },
  CN: { lat: 35, lng: 103 },
  JP: { lat: 36, lng: 138 },
  KR: { lat: 36, lng: 128 },
  BR: { lat: -10, lng: -55 },
  MX: { lat: 23, lng: -102 },
  CA: { lat: 56, lng: -106 },
  AU: { lat: -25, lng: 133 },
  ZA: { lat: -30, lng: 25 },
  SE: { lat: 62, lng: 16 },
  NO: { lat: 61, lng: 9 },
  DK: { lat: 56, lng: 10 },
  PL: { lat: 52, lng: 19 },
  RO: { lat: 45, lng: 25 },
  UA: { lat: 49, lng: 32 },
  IR: { lat: 32, lng: 53 },
  SA: { lat: 24, lng: 45 },
  AE: { lat: 24, lng: 54 },
  ID: { lat: -5, lng: 120 },
  AR: { lat: -34, lng: -64 },
  CL: { lat: -30, lng: -71 },
};

const normalizeKey = (name: string) => name.trim().toUpperCase();

const toCoord = (name: string): { lat: number; lng: number } => {
  const key = normalizeKey(name);
  if (COORDS[key]) return COORDS[key];
  // Attempt common name → code mapping (minimal)
  const map: Record<string, string> = {
    "TURKEY": "TR",
    "TÜRKIYE": "TR",
    "TÜRKİYE": "TR",
    "TURKIYE": "TR",
    "USA": "US",
    "UNITED STATES": "US",
    "UNITED KINGDOM": "GB",
    "ENGLAND": "GB",
    "GERMANY": "DE",
    "FRANCE": "FR",
    "SPAIN": "ES",
    "ITALY": "IT",
    "NETHERLANDS": "NL",
    "RUSSIA": "RU",
    "INDIA": "IN",
    "CHINA": "CN",
    "JAPAN": "JP",
    "KOREA": "KR",
    "BRAZIL": "BR",
    "MEXICO": "MX",
    "CANADA": "CA",
    "AUSTRALIA": "AU",
    "SOUTH AFRICA": "ZA",
    "SWEDEN": "SE",
    "NORWAY": "NO",
    "DENMARK": "DK",
    "POLAND": "PL",
    "ROMANIA": "RO",
    "UKRAINE": "UA",
    "IRAN": "IR",
    "SAUDI ARABIA": "SA",
    "UAE": "AE",
    "INDONESIA": "ID",
    "ARGENTINA": "AR",
    "CHILE": "CL",
  };
  const alias = map[key];
  if (alias && COORDS[alias]) return COORDS[alias];
  return { lat: 0, lng: 0 };
};

// Very light orthographic projection
const project = (lat: number, lng: number, R: number, rot: number) => {
  const rad = Math.PI / 180;
  const phi = lat * rad;
  const lam = lng * rad;
  const lam0 = rot * rad;
  const cosc = Math.sin(0) * Math.sin(phi) + Math.cos(0) * Math.cos(phi) * Math.cos(lam - lam0);
  const visible = cosc >= 0; // back-side culling
  const x = R * Math.cos(phi) * Math.sin(lam - lam0);
  const y = R * Math.sin(phi);
  return { x, y, visible };
};

export default function Globe({ data }: { data: CountryPoint[] }) {
  const total = data.reduce((s, d) => s + d.count, 0) || 1;
  const max = Math.max(1, ...data.map((d) => d.count));
  const points = useMemo(() => {
    return data.map((d) => {
      const c = toCoord(d.country);
      return { ...d, ...c };
    });
  }, [data]);

  const R = 110; // radius in px
  const rotation = -20; // degrees

  return (
    <svg viewBox="0 0 260 260" className="w-full">
      <defs>
        <radialGradient id="glow" cx="50%" cy="45%">
          <stop offset="0%" stopColor="rgba(110,211,225,0.25)" />
          <stop offset="70%" stopColor="rgba(0,167,197,0.15)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>
      </defs>
      <g transform={`translate(${130},${130})`}>
        <circle r={R + 6} fill="url(#glow)" />
        <circle r={R} fill="rgba(6,20,27,0.7)" stroke="rgba(110,211,225,0.25)" />
        {/* graticule */}
        {[...Array(6)].map((_, i) => (
          <circle key={`lat-${i}`} r={R * (i + 1) / 6} fill="none" stroke="rgba(110,211,225,0.12)" />
        ))}
        {[...Array(12)].map((_, i) => (
          <line
            key={`lon-${i}`}
            x1={0}
            y1={-R}
            x2={0}
            y2={R}
            transform={`rotate(${(i * 180) / 12})`}
            stroke="rgba(110,211,225,0.12)"
          />
        ))}

        {points.map((p, idx) => {
          const { x, y, visible } = project(p.lat, p.lng, R, rotation);
          if (!visible) return null;
          const r = Math.max(2, (p.count / max) * 8);
          return (
            <g key={idx}>
              <circle cx={x} cy={y} r={r} fill="rgba(110,211,225,0.85)" opacity={0.85} />
            </g>
          );
        })}
      </g>
      {/* Legend */}
      <g transform="translate(10,10)" fontSize="10" fill="rgba(255,255,255,0.75)">
        {data.slice(0, 6).map((d, i) => (
          <g key={i} transform={`translate(0, ${i * 16})`}>
            <rect width={6} height={6} rx={2} fill="rgba(110,211,225,0.85)" />
            <text x={10} y={6} dominantBaseline="central">{`${d.country} • ${(d.count / total * 100).toFixed(1)}%`}</text>
          </g>
        ))}
      </g>
    </svg>
  );
}
