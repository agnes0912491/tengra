import { NextResponse } from "next/server";

import { ADMIN_SESSION_COOKIE } from "@/lib/auth";

// Backend auth endpoint
const BACKEND_AUTH_LOGIN = `${process.env.BACKEND_API_URL}/auth/login`;

interface LoginRequest {
  email?: string;
  password?: string;
}

interface LoginResponse {
  token?: string;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as LoginRequest;
  const email = body.email ?? "";
  const password = body.password ?? "";

  // Forward credentials to backend auth service
  const backendRes = await fetch(BACKEND_AUTH_LOGIN, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ username: email, password }),
    cache: "no-store",
  }).catch(() => null);

  if (!backendRes || !backendRes.ok) {
    return NextResponse.json(
      { success: false, message: "E-posta veya şifre hatalı." },
      { status: 401 }
    );
  }

  const payload = (await backendRes.json().catch(() => ({} as LoginResponse))) as LoginResponse;
  const token = payload.token;

  if (!token) {
    return NextResponse.json(
      { success: false, message: "Giriş başarısız oldu." },
      { status: 500 }
    );
  }

  const response = NextResponse.json({ success: true });

  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });

  return response;
}

