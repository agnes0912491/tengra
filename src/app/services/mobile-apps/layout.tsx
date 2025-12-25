import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Mobile App Development | Tengra Studio",
    description: "Native and cross-platform mobile app development services. We build iOS and Android apps using Flutter and React Native with exceptional UX.",
    keywords: ["mobile app development istanbul", "mobil uygulama geliştirme", "flutter uygulama", "ios android geliştirme", "uygulama yapımı"],
    openGraph: {
        title: "Mobile App Development | Tengra Studio",
        description: "Transform your idea into a stunning mobile application.",
        url: "https://tengra.studio/services/mobile-apps",
    },
};

export default function MobileAppsLayout({ children }: { children: React.ReactNode }) {
    return children;
}
