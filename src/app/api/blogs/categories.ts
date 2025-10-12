import { BlogCategory } from "@/types/blog";
import { NextResponse } from "next/server";

const BLOGS_API_URL = `${process.env.BACKEND_API_URL}/blogs/categories`;

interface BlogCategoriesResponse {
    categories: Array<BlogCategory>;
}

export default async function GET() {
    const response = await fetch(BLOGS_API_URL, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        return NextResponse.json({ error: "Failed to fetch blog categories" }, { status: 500 });
    }

    const data = (await response.json().catch(() => ({}))) as BlogCategoriesResponse;
    return NextResponse.json(data.categories || []);
}