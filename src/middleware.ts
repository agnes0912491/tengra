import { NextRequest, NextResponse } from "next/server";

import { ADMIN_SESSION_COOKIE } from "@/lib/auth";

const BACKEND_BLOGS = `${process.env.BACKEND_API_URL}/blogs`;

const PUBLIC_PATH_PREFIXES = [
  "/admin/login",
  "/forum",
  "/api/admin/login",
  "/api/admin/logout",
];

// Allow-listed public paths that do not require admin auth.
// We intentionally treat root ('/') and '/blogs' as public, but avoid adding
// '/' to PUBLIC_PATH_PREFIXES because that would match every path.
const isPublicPath = (pathname: string) => {
  if (pathname === "/") return true; // homepage is public
  if (pathname === "/blogs" || pathname.startsWith("/blogs/")) return true; // blogs list and posts are public

  return PUBLIC_PATH_PREFIXES.some((path) =>
    path.endsWith("/") ? pathname.startsWith(path) : pathname === path || pathname.startsWith(`${path}/`)
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

  if (isAssetPath(pathname) || isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Only enforce admin authentication for admin pages and admin API routes.
  // Do NOT redirect users who visit arbitrary/non-existent frontend pages.
  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");
  const isAdminApi = pathname === "/api/admin" || pathname.startsWith("/api/admin/");

  // allowlist for admin-related public endpoints (e.g. login/logout)
  const isAdminPublic = pathname === "/admin/login" || pathname === "/api/admin/login" || pathname === "/api/admin/logout";

  if (!isAdminRoute && !isAdminApi) {
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
      headers: { Authorization: `Bearer ${sessionToken}`, Accept: "application/json" },
      cache: "no-store",
    });

    if (!res.ok) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  } catch (_err) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/((?!_next/static|_next/image|favicon.ico).*)",
};

