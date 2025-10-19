import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE } from "@/lib/auth";
import { resolveLocale, routing } from "@/i18n/routing";

type AuthMeResponse = { user?: { role?: string | null } | null };
const API_BASE = process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:5000";
const BACKEND_AUTH_ME = `${API_BASE}/auth/me`;

// ---- helpers (değişmedi) ----
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
  // Nonce: her istekte benzersiz
  // Not: Base64 zorunlu değil; benzersiz ve tahmin edilemez olması yeterli. :contentReference[oaicite:4]{index=4}
  const nonce = `${crypto.randomUUID()}${Math.random().toString(36).slice(2)}`;
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  const next = () =>
    NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  let response: NextResponse;

  // ---- locale redirect (değişmedi) ----
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
    response = next();
  } else {
    // ---- admin auth (değişmedi) ----
    const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");
    const isAdminPublic = pathname === "/admin/login";
    if (!isAdminRoute) {
      response = next();
    } else if (isAdminPublic) {
      const sessionToken = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
      if (!sessionToken) {
        response = next();
      } else {
        try {
          const res = await fetch(BACKEND_AUTH_ME, {
            method: "GET",
            headers: { Authorization: `Bearer ${sessionToken}`, Accept: "application/json" },
            cache: "no-store",
          });
          if (!res.ok) {
            response = next();
          } else {
            const data = (await res.json().catch(() => ({}))) as AuthMeResponse;
            const role = data.user?.role ?? undefined;
            if (role === "admin" || role === "ADMIN") {
              const dashboardUrl = new URL("/admin/dashboard", request.url);
              response = NextResponse.redirect(dashboardUrl);
            } else {
              response = next();
            }
          }
        } catch {
          response = next();
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
              response = next();
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

  // ---- CSP (nonce + strict-dynamic) ----
  const isProd = process.env.NODE_ENV === "production";

  const connectSrc = [
    "'self'",
    API_BASE,
    "https://cloudflareinsights.com",                               // Cloudflare Web Analytics beacon hedefi :contentReference[oaicite:5]{index=5}
    "https://fundingchoicesmessages.google.com",                    // GFC API :contentReference[oaicite:6]{index=6}
    "https://www.google-analytics.com",
    "https://googleads.g.doubleclick.net",
    "https://pagead2.googlesyndication.com",
    !isProd && "ws://localhost:6000",
    !isProd && "http://localhost:6000",
  ].filter(Boolean).join(" ");

  const scriptSrc = [
    "'self'",
    `'nonce-${nonce}'`,                                            // nonce + inline scriptler için
    "'unsafe-inline'",                                            // Cloudflare Rocket Loader tarafından enjekte edilen inline scriptlere izin ver
    "https://static.cloudflareinsights.com",                       // Cloudflare beacon :contentReference[oaicite:9]{index=9}
    "https://fundingchoicesmessages.google.com",                   // GFC script :contentReference[oaicite:10]{index=10}
    "https://www.googletagmanager.com",
    "https://www.gstatic.com",
    "https://pagead2.googlesyndication.com",
    !isProd && "'unsafe-eval'",                                    // yalnız dev için (React Fast Refresh)
  ].filter(Boolean).join(" ");

  const frameSrc = [
    "'self'",
    "https://fundingchoicesmessages.google.com",                   // GFC iframe :contentReference[oaicite:11]{index=11}
    "https://googleads.g.doubleclick.net",
  ].join(" ");

  const imgSrc = [
    "'self'",
    "data:",
    "https:",
    "https://pagead2.googlesyndication.com",
    "https://googleads.g.doubleclick.net",
  ].join(" ");

  const styleSrc = [
    "'self'",
    "'unsafe-inline'",                                             // gerekiyorsa; nonce’a geçebilirsiniz :contentReference[oaicite:12]{index=12}
    "https://fonts.googleapis.com",
  ].join(" ");

  const fontSrc = ["'self'", "https://fonts.gstatic.com", "data:"].join(" ");

  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      `script-src ${scriptSrc}`,
      `connect-src ${connectSrc}`,
      `img-src ${imgSrc}`,
      `style-src ${styleSrc}`,
      `font-src ${fontSrc}`,
      `frame-src ${frameSrc}`,
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests",
    ].join("; ")
  );

  // nonce’ı layout’a geçirmek için
  response.headers.set("x-nonce", nonce);                          // Next, nonce’ı otomatik uygular + <Script nonce> ile kullanılır :contentReference[oaicite:13]{index=13}

  // Diğer güvenlik başlıkları (mevcutlar korunarak)
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "geolocation=(), microphone=(), camera=(), payment=(), usb=()");

  // Cookie güvenliği (mevcut)
  if (response.cookies.get(ADMIN_SESSION_COOKIE)) {
    response.cookies.set(
      ADMIN_SESSION_COOKIE,
      response.cookies.get(ADMIN_SESSION_COOKIE)!.value,
      {
        httpOnly: true,
        secure: isProd,
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      }
    );
  }

  return response;
}

export const config = {
  // Next resmi öneri: prefetch isteklerini hariç tutma :contentReference[oaicite:14]{index=14}
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
