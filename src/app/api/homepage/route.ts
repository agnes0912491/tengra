import { NextRequest, NextResponse } from "next/server";

const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function resolveBackendUrl() {
  try {
    const url = new URL(BACKEND_API_URL);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }
    return url;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  console.info("[homepage]", { method: request.method, path: request.nextUrl.pathname });
  if (request.nextUrl.searchParams.size > 0) {
    return NextResponse.json({ error: "Query parameters are not supported." }, { status: 400 });
  }

  const backendUrl = resolveBackendUrl();
  if (!backendUrl) {
    return NextResponse.json({ error: "Backend URL is invalid." }, { status: 500 });
  }

  try {
    const res = await fetch(`${backendUrl.href.replace(/\/$/, "")}/api/homepage`);
    const text = await res.text();
    return new NextResponse(text, { status: res.status, headers: { 'Content-Type': res.headers.get('content-type') || 'application/json' } });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
