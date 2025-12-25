import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Cloud Infrastructure & DevOps | Tengra Studio",
    description: "Secure, scalable cloud infrastructure and DevOps services. AWS, Google Cloud, CI/CD pipelines, and auto-scaling solutions from Istanbul.",
    keywords: ["cloud infrastructure istanbul", "devops hizmeti", "aws kurulum", "kubernetes", "ci/cd pipeline", "sunucu yönetimi"],
    openGraph: {
        title: "Cloud & DevOps | Tengra Studio",
        description: "Build resilient infrastructure that scales with your business.",
        url: "https://tengra.studio/services/cloud-infrastructure",
    },
};

export default function CloudLayout({ children }: { children: React.ReactNode }) {
    return children;
}
