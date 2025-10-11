import { NextResponse } from "next/server";

import {
  ADMIN_SESSION_COOKIE,
  createAdminSessionToken,
  verifyAdminCredentials,
} from "@/lib/auth";

interface LoginRequest {
  email?: string;
  password?: string;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as LoginRequest;
  const email = body.email ?? "";
  const password = body.password ?? "";

  if (!verifyAdminCredentials(email, password)) {
    return NextResponse.json(
      { success: false, message: "E-posta veya şifre hatalı." },
      { status: 401 }
    );
  }

  const token = createAdminSessionToken();

  const response = NextResponse.json({ success: true, token });

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

