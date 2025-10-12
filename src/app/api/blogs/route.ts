import { Blog } from "@/types/blog";
import { NextResponse } from "next/server";

const BACKEND_BLOGS = `${process.env.BACKEND_API_URL}/blogs`;

interface BlogsResponse {
    blogs: Array<Blog>;
}

export async function GET() {
    const response = await fetch(BACKEND_BLOGS, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        return NextResponse.json({ error: "Failed to fetch blogs" }, { status: 500 });
    }

    const data = (await response.json().catch(() => ({}))) as BlogsResponse;
    return NextResponse.json(data.blogs || []);
}