import { Blog } from "@/types/blog";
import { NextApiRequest } from "next";
import { NextResponse } from "next/server";

const BACKEND_BLOGS = `${process.env.BACKEND_API_URL}/blogs`;

interface BlogResponse {
    blog: Blog;
}

export async function GET(request: NextApiRequest) {
    const { id } = request.query;
    const response = await fetch(`${BACKEND_BLOGS}/${id}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (response.status === 404) {
        return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    if (!response.ok) {
        return NextResponse.json({ error: "Failed to fetch blog" }, { status: 500 });
    }

    const data = (await response.json().catch(() => ({}))) as BlogResponse;
    return NextResponse.json(data.blog || null);
}