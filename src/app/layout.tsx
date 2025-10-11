import "./globals.css";
import Icon from "../../public/tengra_without_text.png";
import { Metadata } from "next";
import Footer from "@/components/layout/footer";
import AnimatedWrapper from "@/components/ui/animated-wrapper";

import { Orbitron, Inter } from "next/font/google";
import "@fontsource/noto-sans-old-turkic";
import ParticlesBackground from "@/components/ui/particles-background";

const orbitron = Orbitron({ subsets: ["latin"], variable: "--font-orbitron" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Tengra Studio",
  description: "Forging the divine and the technological",
  icons: {
    icon: Icon.src,
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
        <ParticlesBackground />
        <AnimatedWrapper>{children}</AnimatedWrapper>
        <Footer />
      </body>
    </html>
  );
}
