import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE } from "@/lib/auth";
import { resolveLocale, routing } from "@/i18n/routing";

type AuthMeResponse = { user?: { role?: string | null } | null };
const API_BASE = process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:5000";
const BACKEND_AUTH_ME = `${API_BASE}/auth/me`;

const PUBLIC_PATH_PREFIXES = ["/admin/login", "/forum"];

const stripLocaleFromPath = (pathname: string) => {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return "/";
  const [possibleLocale, ...rest] = segments;
  if (resolveLocale(possibleLocale)) return rest.length === 0 ? "/" : `/${rest.join("/")}`;
  return pathname;
};

const isPublicPath = (pathname: string) => {
  const normalized = stripLocaleFromPath(pathname);
  if (normalized === "/") return true;
  if (normalized === "/blogs" || normalized.startsWith("/blogs/")) return true;
  return PUBLIC_PATH_PREFIXES.some((p) =>
    p.endsWith("/") ? normalized.startsWith(p) : normalized === p || normalized.startsWith(`${p}/`)
  );
};

const isAssetPath = (p: string) =>
  p.startsWith("/_next") || p.startsWith("/favicon") || p.startsWith("/images") ||
  p.startsWith("/public") || p === "/robots.txt" || p === "/sitemap.xml";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProd = process.env.NODE_ENV === "production";

  // Development'ta basitleştirilmiş akış
  if (!isProd) {
    // Sadece admin route'larını kontrol et
    if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
      const sessionToken = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
      if (!sessionToken) {
        const loginUrl = new URL("/admin/login", request.url);
        loginUrl.searchParams.set("next", pathname);
        return NextResponse.redirect(loginUrl);
      }
    }
    return NextResponse.next();
  }

  // Production için tam güvenlik
  let response: NextResponse;

  // Locale redirect
  if (pathname === "/") {
    const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
    const header = request.headers.get("accept-language") ?? "";
    const supported = routing.locales as unknown as string[];
    const preferred = header.split(",").map((p) => p.trim().split(";")[0])
      .map((code) => code.toLowerCase().replace("_", "-") as string);
    let match: string | undefined = resolveLocale(cookieLocale) ?? undefined;
    if (!match) {
      for (const lang of preferred) {
        const normalized = resolveLocale(lang) ?? undefined;
        const exact = supported.find((l) => l.toLowerCase() === lang);
        match = exact ?? normalized;
        if (match) break;
      }
    }
    const target = (match as string | undefined) ?? routing.defaultLocale;
    const url = new URL(`/${target}`, request.url);
    response = NextResponse.redirect(url);
  } else if (isAssetPath(pathname) || isPublicPath(pathname)) {
    response = NextResponse.next();
  } else {
    // Admin auth
    const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");
    const isAdminPublic = pathname === "/admin/login";
    
    if (!isAdminRoute) {
      response = NextResponse.next();
    } else if (isAdminPublic) {
      const sessionToken = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
      if (!sessionToken) {
        response = NextResponse.next();
      } else {
        try {
          const res = await fetch(BACKEND_AUTH_ME, {
            method: "GET",
            headers: { Authorization: `Bearer ${sessionToken}`, Accept: "application/json" },
            cache: "no-store",
            signal: AbortSignal.timeout(3000),
          });
          if (!res.ok) {
            response = NextResponse.next();
          } else {
            const data = (await res.json().catch(() => ({}))) as AuthMeResponse;
            const role = data.user?.role ?? undefined;
            if (role === "admin" || role === "ADMIN") {
              const dashboardUrl = new URL("/admin/dashboard", request.url);
              response = NextResponse.redirect(dashboardUrl);
            } else {
              response = NextResponse.next();
            }
          }
        } catch {
          response = NextResponse.next();
        }
      }
    } else {
      const sessionToken = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
      if (!sessionToken) {
        const loginUrl = new URL("/admin/login", request.url);
        loginUrl.searchParams.set("next", pathname);
        response = NextResponse.redirect(loginUrl);
      } else {
        try {
          const res = await fetch(BACKEND_AUTH_ME, {
            method: "GET",
            headers: { Authorization: `Bearer ${sessionToken}`, Accept: "application/json" },
            cache: "no-store",
            signal: AbortSignal.timeout(3000),
          });
          if (!res.ok) {
            const loginUrl = new URL("/admin/login", request.url);
            loginUrl.searchParams.set("next", pathname);
            response = NextResponse.redirect(loginUrl);
          } else {
            const data = (await res.json().catch(() => ({}))) as AuthMeResponse;
            if (!data.user || (data.user.role !== "admin" && data.user.role !== "ADMIN")) {
              const loginUrl = new URL("/admin/login", request.url);
              loginUrl.searchParams.set("next", pathname);
              response = NextResponse.redirect(loginUrl);
            } else {
              response = NextResponse.next();
            }
          }
        } catch {
          const loginUrl = new URL("/admin/login", request.url);
          loginUrl.searchParams.set("next", pathname);
          response = NextResponse.redirect(loginUrl);
        }
      }
    }
  }

  // Production CSP headers
  if (isProd) {
    const nonce = `${crypto.randomUUID()}${Math.random().toString(36).slice(2)}`;
    
    const scriptSrc = [
      "'self'",
      `'nonce-${nonce}'`,
      "'strict-dynamic'",
      "'unsafe-inline'",
      "https://static.cloudflareinsights.com",
      "https://fundingchoicesmessages.google.com",
      "https://www.googletagmanager.com",
      "https://www.gstatic.com",
      "https://pagead2.googlesyndication.com",
    ].join(" ");

    const connectSrc = [
      "'self'",
      API_BASE,
      "https://cloudflareinsights.com",
      "https://fundingchoicesmessages.google.com",
      "https://www.google-analytics.com",
      "https://googleads.g.doubleclick.net",
      "https://pagead2.googlesyndication.com",
    ].join(" ");

    response.headers.set(
      "Content-Security-Policy",
      [
        "default-src 'self'",
        `script-src ${scriptSrc}`,
        `connect-src ${connectSrc}`,
        "img-src 'self' data: https:",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com data:",
        "frame-src 'self' https://fundingchoicesmessages.google.com https://googleads.g.doubleclick.net",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'",
        "upgrade-insecure-requests",
      ].join("; ")
    );

    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  }

  return response;
}

export const config = {
  matcher: [
    {
      source: "/((?!_next/static|_next/image|favicon.ico).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};