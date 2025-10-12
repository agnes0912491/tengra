import "./globals.css";
import Icon from "../../public/tengra_without_text.png";
import { Metadata } from "next";
import Footer from "@/components/layout/footer";
import AnimatedWrapper from "@/components/ui/animated-wrapper";
import AuthProvider from "@/components/providers/auth-provider";
import { ToastContainer } from "react-toastify";

import { Orbitron, Inter } from "next/font/google";
import "@fontsource/noto-sans-old-turkic";
import ParticlesBackground from "@/components/ui/particles-background";

const orbitron = Orbitron({ subsets: ["latin"], variable: "--font-orbitron" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "TENGRA | Forging the Divine and the Technological",
  description:
    "TENGRA — a studio uniting divine inspiration with cutting-edge technology. Games, software, and innovation.",
  keywords: [
    "Tengra",
    "Tengri",
    "Game Studio",
    "Software Development",
    "Futuristic Design",
    "End-to-End Encryption",
  ],
  openGraph: {
    title: "TENGRA",
    description: "Forging the Divine and the Technological",
    url: "https://tengra.studio",
    siteName: "TENGRA",
    images: [
      {
        url: Icon.src,
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@tengra",
    title: "TENGRA",
    description: "Forging the Divine and the Technological",
    images: [Icon.src],
  },
  colorScheme: "dark light",
  icons: {
    icon: Icon.src,
    shortcut: Icon.src,
    apple: Icon.src,
  },
};
 

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${orbitron.variable} ${inter.variable}`}>
      <body
        className={`font-sans bg-[color:var(--background)] text-[color:var(--foreground)] w-full min-h-screen`}
      >
        <AuthProvider>
          <ParticlesBackground />
          <main className="relative flex min-h-screen flex-col pb-32 pt-10">
            <AnimatedWrapper>{children}</AnimatedWrapper>
          </main>
          <Footer />
          <ToastContainer position="bottom-right" theme="dark" />
        </AuthProvider>
      </body>
    </html>
  );
}
