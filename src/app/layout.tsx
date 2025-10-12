import "./globals.css";
import Icon from "../../public/tengra_without_text.png";
import Footer from "@/components/layout/footer";
import AnimatedWrapper from "@/components/ui/animated-wrapper";
import AuthProvider from "@/components/providers/auth-provider";
import ParticlesBackground from "@/components/ui/particles-background";
import { ToastContainer } from "react-toastify";
import { Inter, Orbitron } from "next/font/google";
import "@fontsource/noto-sans-old-turkic";
import { NextIntlClientProvider } from "next-intl";
import { createTranslator } from "next-intl";
import { Metadata } from "next";
import { notFound } from "next/navigation";

import { getMessages } from "@/i18n/get-messages";
import { routing, type Locale } from "@/i18n/routing";

const orbitron = Orbitron({ subsets: ["latin"], variable: "--font-orbitron" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://tengra.studio";

type LayoutProps = {
  children: React.ReactNode;
  params: { locale?: string };
};

type MetadataProps = {
  params: { locale?: string };
};

function resolveLocale(rawLocale: string | undefined): Locale {
  const locale = rawLocale ?? routing.defaultLocale;
  return routing.locales.includes(locale as Locale)
    ? (locale as Locale)
    : routing.defaultLocale;
}

export async function generateMetadata({ params }: MetadataProps): Promise<Metadata> {
  const locale = resolveLocale(params.locale);
  const { messages } = getMessages(locale);

  if (!messages) {
    notFound();
  }

  const t = createTranslator({ locale, messages, namespace: "Metadata" });

  const languages = routing.locales.reduce<Record<string, string>>((acc, loc) => {
    acc[loc] = loc === routing.defaultLocale ? "/" : `/${loc}`;
    return acc;
  }, {});

  const path = locale === routing.defaultLocale ? "/" : `/${locale}`;

  return {
    metadataBase: new URL(baseUrl),
    title: t("title"),
    description: t("description"),
    keywords: t("keywords"),
    icons: {
      icon: Icon.src,
    },
    alternates: {
      canonical: path,
      languages,
    },
    openGraph: {
      title: t("ogTitle"),
      description: t("description"),
      url: path,
      siteName: t("siteName"),
      locale: t("ogLocale"),
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t("ogTitle"),
      description: t("description"),
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function RootLayout({ children, params }: LayoutProps) {
  const locale = resolveLocale(params.locale);
  const { messages } = getMessages(locale);

  if (!messages) {
    notFound();
  }

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
