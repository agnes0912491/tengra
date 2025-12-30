import { NextResponse } from "next/server";

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

async function getAdminTokenFromCookie(cookieHeader: string | null): Promise<string | undefined> {
  for (const cname of ADMIN_COOKIE_NAMES) {
    const token = parseCookie(cookieHeader, cname);
    if (!token) continue;
    try {
      const res = await fetch(`${BACKEND_API_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });
      if (!res.ok) continue;
      const json = await res.json();
      if (json?.user?.role === "admin") return token;
    } catch {
      // ignore and try next cookie name
    }
  }
  return undefined;
}

export async function POST(req: Request) {
  console.info("[admin:categories]", { method: "POST", path: new URL(req.url).pathname });
  const cookieHeader = req.headers.get("cookie");
  const token = await getAdminTokenFromCookie(cookieHeader);
  if (!token) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return NextResponse.json({ error: "Content-Type must be application/json" }, { status: 415 });
    }
    const body = await req.json();
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    if (!name) return NextResponse.json({ error: "missing_name" }, { status: 400 });

    const backendRes = await fetch(`${BACKEND_API_URL}/blogs/categories`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name }),
    });

    const text = await backendRes.text();
    return new NextResponse(text, {
      status: backendRes.status,
      headers: { "Content-Type": backendRes.headers.get("content-type") || "application/json" },
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
