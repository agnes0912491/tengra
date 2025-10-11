import { NextRequest, NextResponse } from "next/server";

import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/auth";

const PUBLIC_PATH_PREFIXES = [
  "/admin/login",
  "/forum",
  "/api/admin/login",
  "/api/admin/logout",
];

const isPublicPath = (pathname: string) =>
  PUBLIC_PATH_PREFIXES.some((path) =>
    path.endsWith("/") ? pathname.startsWith(path) : pathname === path || pathname.startsWith(`${path}/`)
  );

const isAssetPath = (pathname: string) =>
  pathname.startsWith("/_next") ||
  pathname.startsWith("/favicon") ||
  pathname.startsWith("/images") ||
  pathname.startsWith("/public") ||
  pathname === "/robots.txt" ||
  pathname === "/sitemap.xml";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isAssetPath(pathname) || isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const sessionToken = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;

  if (!verifyAdminSessionToken(sessionToken)) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/((?!_next/static|_next/image|favicon.ico).*)",
};

