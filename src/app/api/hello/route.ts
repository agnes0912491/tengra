import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  console.info("[hello]", { method: request.method, path: request.nextUrl.pathname });
  const searchParams = request.nextUrl.searchParams;
  const allowedKeys = new Set(["name"]);
  for (const key of searchParams.keys()) {
    if (!allowedKeys.has(key)) {
      return NextResponse.json({ error: "Unsupported query parameter." }, { status: 400 });
    }
  }

  const nameParam = searchParams.get("name");
  if (nameParam !== null) {
    const name = nameParam.trim();
    const isValidName = /^[a-zA-Z0-9 _.'-]{1,40}$/.test(name);
    if (!isValidName) {
      return NextResponse.json({ error: "Invalid name parameter." }, { status: 400 });
    }
    return NextResponse.json({ message: `Hello ${name} from Frontend API` }, {
      headers: {
        "Cache-Control": "public, max-age=60"
      }
    });
  }

  return NextResponse.json({ message: "Hello from Frontend API" }, {
    headers: {
      "Cache-Control": "public, max-age=60"
    }
  });
}
