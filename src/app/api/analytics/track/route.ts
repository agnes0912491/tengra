import { NextRequest, NextResponse } from "next/server";

const ANALYTICS_API_URL =
  process.env.NEXT_PUBLIC_BACKEND_API_URL
    ? `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/analytics`
    : "http://127.0.0.1:5000/analytics";

/**
 * Server-side analytics proxy that forwards visitor IP to backend
 * for GeoIP lookup. This is necessary because client-side code
 * cannot access the visitor's real IP address.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { path, ua, country } = body as {
      path?: string;
      ua?: string;
      country?: string;
    };

    // Get visitor IP from headers (Cloudflare, X-Forwarded-For, or direct)
    const cfConnectingIp = request.headers.get("cf-connecting-ip");
    const xForwardedFor = request.headers.get("x-forwarded-for");
    const xRealIp = request.headers.get("x-real-ip");
    
    // Use first IP if X-Forwarded-For contains multiple
    const ip = cfConnectingIp || 
               (xForwardedFor ? xForwardedFor.split(",")[0].trim() : null) ||
               xRealIp ||
               "";

    // Get country from Cloudflare header if available
    const cfCountry = request.headers.get("cf-ipcountry");
    const resolvedCountry = cfCountry || country || "";

    // Skip malicious paths
    const lowered = (path || "").toLowerCase();
    if (lowered.includes("/cgi-bin") || lowered.includes("stok=")) {
      return NextResponse.json({ success: true, skipped: true });
    }

    const payload = {
      path: path || "/",
      ua: ua || "",
      ip,
      country: resolvedCountry,
    };

    // Forward to backend with IP
    const [pageRes, visitsRes] = await Promise.all([
      fetch(`${ANALYTICS_API_URL}/page/increment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
      fetch(`${ANALYTICS_API_URL}/visits/increment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      }),
    ]);

    return NextResponse.json({
      success: pageRes.ok && visitsRes.ok,
      ip: ip ? `${ip.substring(0, 3)}...` : null, // Partial IP for debugging
    });
  } catch (error) {
    console.error("[analytics/track] Error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
