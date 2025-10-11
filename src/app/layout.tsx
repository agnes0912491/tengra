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
