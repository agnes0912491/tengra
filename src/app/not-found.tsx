import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/page-metadata";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildPageMetadata({
    title: "404 | Tengra Studio",
    description: "The page you are looking for could not be found.",
    path: "/404",
});

export default function NotFound() {
    return (
        <div>
            <h1>404 - Not Found</h1>
        </div>
    );
}
