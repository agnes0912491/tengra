import { NextRequest, NextResponse } from "next/server";

import { ADMIN_SESSION_COOKIE } from "@/lib/auth";
import { isLocale } from "@/i18n/routing";
import { routing } from "@/i18n/routing";

type AuthMeResponse = {
  user?: {
    role?: string | null;
  } | null;
};

const API_BASE =
  process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:5000";
const BACKEND_AUTH_ME = `${API_BASE}/auth/me`;

const PUBLIC_PATH_PREFIXES = ["/admin/login", "/forum"];
// Allow-listed public paths that do not require admin auth.
// We intentionally treat root ('/') and '/blogs' as public, but avoid adding
// '/' to PUBLIC_PATH_PREFIXES because that would match every path.
const stripLocaleFromPath = (pathname: string) => {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return "/";

  const [possibleLocale, ...rest] = segments;
  if (isLocale(possibleLocale)) {
    return rest.length === 0 ? "/" : `/${rest.join("/")}`;
  }

  return pathname;
};

const isPublicPath = (pathname: string) => {
  const normalizedPath = stripLocaleFromPath(pathname);

  if (normalizedPath === "/") return true; // homepage is public
  if (normalizedPath === "/blogs" || normalizedPath.startsWith("/blogs/"))
    return true; // blogs list and posts are public

  return PUBLIC_PATH_PREFIXES.some((path) =>
    path.endsWith("/")
      ? normalizedPath.startsWith(path)
      : normalizedPath === path || normalizedPath.startsWith(`${path}/`)
  );
};

const isAssetPath = (pathname: string) =>
  pathname.startsWith("/_next") ||
  pathname.startsWith("/favicon") ||
  pathname.startsWith("/images") ||
  pathname.startsWith("/public") ||
  pathname === "/robots.txt" ||
  pathname === "/sitemap.xml";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Create response object to add security headers
  let response: NextResponse;

  // Auto-redirect root '/' to best locale using cookie or Accept-Language
  if (pathname === "/") {
    const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
    const header = request.headers.get("accept-language") ?? "";
    const supported = routing.locales as unknown as string[];
    const preferred = header
      .split(",")
      .map((part) => part.trim().split(";")[0])
      .map((code) => code.toLowerCase().replace("_", "-") as string);

    let match: string | undefined =
      cookieLocale && isLocale(cookieLocale) ? cookieLocale : undefined;

    if (!match) {
      for (const lang of preferred) {
        const base = lang.split("-")[0];
        const exact = supported.find((l) => l.toLowerCase() === lang);
        const baseMatch = supported.find((l) => l.toLowerCase() === base);
        match = exact ?? baseMatch;
        if (match) break;
      }
    }

    const target = (match as string | undefined) ?? routing.defaultLocale;
    if (target !== routing.defaultLocale) {
      const url = new URL(`/${target}`, request.url);
      response = NextResponse.redirect(url);
    } else {
      response = NextResponse.next();
    }
  } else if (isAssetPath(pathname) || isPublicPath(pathname)) {
    response = NextResponse.next();
  } else {
    // Only enforce admin authentication for admin pages and admin API routes.
    const isAdminRoute =
      pathname === "/admin" || pathname.startsWith("/admin/");
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
            headers: {
              Authorization: `Bearer ${sessionToken}`,
              Accept: "application/json",
            },
            cache: "no-store",
          });

          if (!res.ok) {
            response = NextResponse.next();
          } else {
            const data = (await res
              .json()
              .catch(() => ({}))) as AuthMeResponse;
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
      // Admin area - require valid session and admin role
      const sessionToken = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
      if (!sessionToken) {
        const loginUrl = new URL("/admin/login", request.url);
        loginUrl.searchParams.set("next", pathname);
        response = NextResponse.redirect(loginUrl);
      } else {
        try {
          const res = await fetch(BACKEND_AUTH_ME, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${sessionToken}`,
              Accept: "application/json",
            },
            cache: "no-store",
          });

          if (!res.ok) {
            const loginUrl = new URL("/admin/login", request.url);
            loginUrl.searchParams.set("next", pathname);
            response = NextResponse.redirect(loginUrl);
          } else {
            const data = (await res.json().catch(() => ({}))) as AuthMeResponse;
            if (
              !data.user ||
              (data.user.role !== "admin" && data.user.role !== "ADMIN")
            ) {
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

  // Add security headers to all responses
  const connectSrc = [
    "'self'",
    API_BASE,
    "ws://localhost:6000",
    "http://localhost:6000",
    "https://fundingchoicesmessages.google.com",
    "https://pagead2.googlesyndication.com",
    "https://googleads.g.doubleclick.net",
  ].join(" ");
  const scriptSrc = [
    "'self'",
    "'unsafe-inline'",
    "https://fundingchoicesmessages.google.com",
    "https://www.gstatic.com",
    "https://pagead2.googlesyndication.com",
  ].join(" ");
  const frameSrc = [
    "'self'",
    "https://fundingchoicesmessages.google.com",
    "https://www.google.com",
    "https://googleads.g.doubleclick.net",
  ].join(" ");
  const imgSrc = [
    "'self'",
    "data:",
    "https:",
    "https://pagead2.googlesyndication.com",
    "https://googleads.g.doubleclick.net",
  ].join(" ");
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      // Allow inline styles for now; consider removing by using hashed styles only
      "style-src 'self' 'unsafe-inline'",
      `img-src ${imgSrc}`,
      "font-src 'self'",
      `connect-src ${connectSrc}`,
      `script-src ${scriptSrc}`,
      `frame-src ${frameSrc}`,
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; ")
  );

  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "geolocation=(), microphone=(), camera=(), payment=(), usb=()"
  );

  // Set secure cookie attributes
  if (response.cookies.get(ADMIN_SESSION_COOKIE)) {
    response.cookies.set(
      ADMIN_SESSION_COOKIE,
      response.cookies.get(ADMIN_SESSION_COOKIE)!.value,
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      }
    );
  }

  return response;
}

export const config = {
  matcher: "/((?!_next/static|_next/image|favicon.ico).*)",
};
