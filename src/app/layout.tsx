import "./globals.css";
import Icon from "../../public/tengra_without_text.png";
import { Metadata, Viewport } from "next";
import Footer from "@/components/layout/footer";
import AnimatedWrapper from "@/components/ui/animated-wrapper";
import AuthProvider from "@/components/providers/auth-provider";
import ParticlesBackground from "@/components/ui/particles-background";
import { ToastContainer } from "react-toastify";
import { Inter, Orbitron } from "next/font/google";
import "@fontsource/noto-sans-old-turkic";
import { NextIntlClientProvider } from "next-intl";
import { createTranslator } from "next-intl";
import { notFound } from "next/navigation";

import { getMessages } from "@/i18n/get-messages";
import { routing, type Locale } from "@/i18n/routing";

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
  icons: {
    icon: Icon.src,
    shortcut: Icon.src,
    apple: Icon.src,
  },
};

export const viewport: Viewport = {
  colorScheme: "dark light",
};

export default async function RootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: Locale };
}) {
  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages(locale);
  return (
    <html lang={locale} className={`${orbitron.variable} ${inter.variable}`}>
      <body className="font-sans bg-[color:var(--background)] text-[color:var(--foreground)] w-full min-h-screen">
        <NextIntlClientProvider locale={locale} messages={messages} timeZone="UTC">
          <AuthProvider>
            <ParticlesBackground />
            <main className="relative flex min-h-screen flex-col pb-32 pt-10">
              <AnimatedWrapper>{children}</AnimatedWrapper>
            </main>
            <Footer />
            <ToastContainer position="bottom-right" theme="dark" />
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
