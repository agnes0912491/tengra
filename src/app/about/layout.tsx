import { Metadata } from "next";

export const metadata: Metadata = {
    title: "About Us | Tengra Studio",
    description: "Learn about Tengra Studio - a creative tech studio based in Istanbul, Turkey. We build immersive digital experiences with cutting-edge technology and divine precision.",
    keywords: ["about tengra", "tengra studio hakkında", "İstanbul yazılım şirketi", "türk teknoloji firması"],
    openGraph: {
        title: "About Tengra Studio",
        description: "Discover the story behind Tengra Studio - where myth meets technology.",
        url: "https://tengra.studio/about",
    },
};

export default function AboutLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
