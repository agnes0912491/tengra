import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Web Development Services | Tengra Studio",
    description: "Professional web development services from Tengra Studio. We build fast, scalable, and beautiful web applications using Next.js, React, and modern technologies.",
    keywords: ["web development istanbul", "web geliştirme", "next.js geliştirme", "react web uygulaması", "kurumsal web sitesi"],
    openGraph: {
        title: "Web Development | Tengra Studio",
        description: "Build your next web application with a team that delivers excellence.",
        url: "https://tengra.studio/services/web-development",
    },
};

export default function WebDevLayout({ children }: { children: React.ReactNode }) {
    return children;
}
