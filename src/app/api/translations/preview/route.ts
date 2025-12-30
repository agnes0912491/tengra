import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";

const TRANSLATIONS_DIR = path.join(process.cwd(), "src", "i18n", "messages");

const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const ADMIN_COOKIE_NAMES = ["admin_session", "authToken", "auth_token"];

function parseCookie(header: string | null, name: string): string | undefined {
  if (!header) return undefined;
  const parts = header.split(";").map((p) => p.trim());
  for (const part of parts) {
    const [k, ...vals] = part.split("=");
    if (k === name) return decodeURIComponent(vals.join("="));
  }
  return undefined;
}

async function isAdminFromCookie(cookieHeader: string | null) {
  for (const cname of ADMIN_COOKIE_NAMES) {
    const token = parseCookie(cookieHeader, cname);
    if (!token) continue;
    try {
      const res = await fetch(`${BACKEND_API_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) continue;
      const json = await res.json();
      if (json?.user?.role === "admin") return true;
    } catch {
      // ignore and try next
    }
  }
  return false;
}

export async function GET(req: Request) {
  try {
    console.info("[translations:preview]", { method: "GET", path: new URL(req.url).pathname });
    // Admin-only: verify admin cookie
    const cookieHeader = req.headers.get("cookie");
    const authorized = await isAdminFromCookie(cookieHeader);
    if (!authorized) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const locale = url.searchParams.get("locale");
    if (!locale || !/^[a-z]{2}(-[A-Z]{2})?$/.test(locale)) {
      return NextResponse.json({ error: "missing locale" }, { status: 400 });
    }

    const filePath = path.join(TRANSLATIONS_DIR, `${locale}.json`);
    try {
      await fs.access(filePath);
    } catch {
      return NextResponse.json({ error: "missing translation file" }, { status: 404 });
    }
    const content = await fs.readFile(filePath, "utf8");

    return NextResponse.json({ content });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
