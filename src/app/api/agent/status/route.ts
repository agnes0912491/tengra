import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const online = process.env.NEXT_PUBLIC_AGENT_ONLINE === "1" || process.env.AGENT_ONLINE === "1";
  const name = process.env.NEXT_PUBLIC_AGENT_NAME || process.env.AGENT_NAME || "AI Agent";
  return NextResponse.json({ online, name });
}
