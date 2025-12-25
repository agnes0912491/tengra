import { Metadata } from "next";

export const metadata: Metadata = {
    title: "UI/UX Design Services | Tengra Studio",
    description: "Premium UI/UX design services that captivate users and drive conversions. Brand identity, visual design, and interactive prototyping.",
    keywords: ["ui ux design istanbul", "kullanıcı deneyimi tasarımı", "arayüz tasarımı", "marka kimliği", "web tasarım"],
    openGraph: {
        title: "UI/UX Design | Tengra Studio",
        description: "Design that feels as good as it looks.",
        url: "https://tengra.studio/services/design",
    },
};

export default function DesignLayout({ children }: { children: React.ReactNode }) {
    return children;
}
