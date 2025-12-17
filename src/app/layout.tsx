// Sunucu bileşeni, "use client" yok!
import "./globals.css";

import { Metadata, Viewport } from "next";
import { cookies, headers } from "next/headers";
import ParticlesClientWrapper from "@/components/ui/particles-client-wrapper";
import GlobalToastContainer from "@/components/ui/global-toast-container";
import { Inter, Orbitron } from "next/font/google";
import localFont from "next/font/local";

import Script from "next/script";
import ConsentBanner from "@/components/consent/ConsentBanner";
import ClientUserProvider from "./ClientUserProvider";
import IntlProviderClient from "@/components/providers/intl-provider-client";
import { getMessages } from "@/i18n/get-messages";
import { resolvePreferredLocale } from "@/i18n/resolve-preferred-locale";
import AnalyticsTracker from "@/components/analytics/AnalyticsTracker";
import AdblockDetector from "@/components/analytics/AdblockDetector";
import AdblockNotice from "@/components/analytics/AdblockNotice";
import Footer from "@/components/layout/footer";
import PWAProvider from "@/components/pwa/pwa-provider";

const Icon = "uploads/tengra_without_text.png";

const orbitron = Orbitron({ subsets: ["latin"], variable: "--font-orbitron" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const notoOldTurkic = localFont({
  src: "../fonts/noto-sans-old-turkic-400-normal.woff2",
  weight: "400",
  style: "normal",
  variable: "--font-old-turkic",
  display: "swap",
  preload: true,
  fallback: ["Noto Sans", "Segoe UI Symbol", "Arial Unicode MS", "sans-serif"],
});

const metadataBaseUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.NEXT_PUBLIC_METADATA_BASE ??
  "http://localhost:3000";
const siteUrl = metadataBaseUrl.replace(/\/$/, "");
const logoUrl = `https://cdn.tengra.studio/${Icon}`;

// export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return {
    metadataBase: new URL(metadataBaseUrl),
    title: "Tengra Studio",
    description:
      "Tengra Studio builds artefact-like games, AI-driven worlds, and experimental systems. Myth + Code + Play.",
    keywords: [
      "Tengra",
      "Tengra Studio",
      "game studio",
      "indie game dev",
      "GeoFrontier",
      "stylized worlds",
    ],
    openGraph: {
      title: "Tengra Studio",
      description:
        "Artefact-like games, worlds and systems forged from myth and code.",
      url: siteUrl,
      siteName: "Tengra Studio",
      images: [
        {
          url: "https://cdn.tengra.studio/uploads/tengra_without_text.png",
          width: 1200,
          height: 630,
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      images: ["https://cdn.tengra.studio/uploads/tengra_without_text.png"],
    },
    alternates: {
      canonical: siteUrl,
    },
    icons: {
      icon: logoUrl,
      shortcut: logoUrl,
      apple: logoUrl,
    },
    manifest: "/manifest.json",
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: "Tengra",
    },
    other: {
      "google-adsense-account": "ca-pub-1840126959284939",
    },
  };
}

export const viewport: Viewport = {
  colorScheme: "dark light",
  themeColor: "#06141B",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const headersList = await headers();
  const { locale: preferredLocale } = resolvePreferredLocale({
    cookieLocale: cookieStore.get("NEXT_LOCALE")?.value,
    acceptLanguage: headersList.get("accept-language"),
  });
  const { locale, messages } = getMessages(preferredLocale);

  // Nonce'u runtime'da almaya çalışma, sadece Script'lerde kullan
  const isProd = process.env.NODE_ENV === "production";

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Tengra",
    url: siteUrl,
    logo: logoUrl,
    sameAs: [
      "https://x.com/tengra",
      "https://github.com/TengraStudio",
      "https://www.linkedin.com/company/tengra",
    ],
  };

  const webSiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Tengra",
    url: siteUrl,
  };

  return (
    <html suppressHydrationWarning
      lang={locale}
      className={`${orbitron.variable} ${inter.variable} ${notoOldTurkic.variable}`}
    >
      <head />
      <body className="font-sans bg-[color:var(--background)] text-[color:var(--foreground)] w-full min-h-screen">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify([organizationSchema, webSiteSchema]) }}
        />
        {/* Consent Mode default */}
        <Script id="consent-mode-default" strategy="beforeInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){ dataLayer.push(arguments); }
            gtag('consent', 'default', {
              ad_storage: 'denied',
              ad_personalization: 'denied',
              ad_user_data: 'denied',
              analytics_storage: 'denied'
            });
          `}
        </Script>

        {/* Google Funding Choices (opsiyonel) */}
        {process.env.NEXT_PUBLIC_GFC_ID && isProd ? (
          <>
            <Script
              id="gfc-loader"
              async
              src={`https://fundingchoicesmessages.google.com/i/${process.env.NEXT_PUBLIC_GFC_ID}?ers=1`}
              strategy="afterInteractive"
            />
            <Script id="gfc-present" strategy="afterInteractive">
              {`(function() { 
                function signalGooglefcPresent() {
                  if (!window.frames['googlefcPresent']) {
                    if (document.body) {
                      const iframe = document.createElement('iframe');
                      iframe.style.width = '0';
                      iframe.style.height = '0';
                      iframe.style.display = 'none';
                      iframe.name = 'googlefcPresent';
                      document.body.appendChild(iframe);
                    } else {
                      setTimeout(signalGooglefcPresent, 0);
                    }
                  }
                }
                signalGooglefcPresent();
              })();`}
            </Script>
          </>
        ) : null}

        {/* Cloudflare Insights (opsiyonel) */}
        {isProd && (
          <Script
            src="https://static.cloudflareinsights.com/beacon.min.js"
            strategy="afterInteractive"
            data-cf-beacon='{"token": "KfJh_-de2bWWjAP7HKTmShXmoWBIb4ODqtral_fv"}'
          />
        )}

        <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />

        <ClientUserProvider>
          <ParticlesClientWrapper />
          <IntlProviderClient locale={locale} messages={messages}>
            <ConsentBanner />
            {/* Per-page analytics tracker */}
            <AdblockDetector />
            <AdblockNotice />
            <AnalyticsTracker />
            <PWAProvider />
            <div className="flex min-h-screen flex-col">
              {children}
              {/* @ts-expect-error React 19 type mismatch */}
              <Footer />
            </div>
          </IntlProviderClient>
          <GlobalToastContainer />
        </ClientUserProvider>
      </body>
    </html>
  );
}
