import { NextRequest, NextResponse } from "next/server";

import { ADMIN_SESSION_COOKIE } from "@/lib/auth";
import { isLocale } from "@/i18n/routing";
import { routing } from "@/i18n/routing";

const BACKEND_BLOGS = `${process.env.BACKEND_API_URL}/blogs`;

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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

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
      return NextResponse.redirect(url);
    }
  }

  if (isAssetPath(pathname) || isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Only enforce admin authentication for admin pages and admin API routes.
  // Do NOT redirect users who visit arbitrary/non-existent frontend pages.
  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");
  // allowlist for admin-related public endpoints (e.g. login/logout)
  const isAdminPublic = pathname === "/admin/login";

  if (!isAdminRoute) {
    // Not an admin area — let Next.js handle the route (including 404s)
    return NextResponse.next();
  }

  if (isAdminPublic) {
    return NextResponse.next();
  }

  // Admin area and not a public admin endpoint -> require valid session
  const sessionToken = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (!sessionToken) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const res = await fetch(BACKEND_BLOGS, {
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
      return NextResponse.redirect(loginUrl);
    }
  } catch {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/((?!_next/static|_next/image|favicon.ico).*)",
};
