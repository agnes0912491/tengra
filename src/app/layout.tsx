import "./globals.css";
import { type Metadata } from "next";
import { Inter, Orbitron, Noto_Sans_Old_Turkic } from "next/font/google";
import { LanguageProvider } from "@tengra/language";
import { loadTranslations } from "@tengra/language/server";
import translationConfig from "@/tl.config";
import Script from "next/script";
import ParticlesClientWrapper from "@/components/ui/particles-client-wrapper";
import GlobalToastContainer from "@/components/ui/global-toast-container";
import ClientUserProvider from "./ClientUserProvider";
import ConsentBanner from "@/components/consent/ConsentBanner";
import AnalyticsTracker from "@/components/analytics/AnalyticsTracker";
import AdblockDetector from "@/components/analytics/AdblockDetector";
import AdblockNotice from "@/components/analytics/AdblockNotice";
import Footer from "@/components/layout/footer";
import PWAProvider from "@/components/pwa/pwa-provider";
import { getOrganizationSchema, getWebSiteSchema, BASE_URL } from "@/lib/seo";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const orbitron = Orbitron({ subsets: ["latin"], variable: "--font-orbitron" });
const notoOldTurkic = Noto_Sans_Old_Turkic({
  weight: "400",
  subsets: ["old-turkic"],
  variable: "--font-noto-old-turkic",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Tengra Studio — Shaping myth, code, and divine precision",
    template: "%s | Tengra Studio",
  },
  description:
    "Immersive digital craftsmanship fusing the sacred with technology. We build high-performance web and mobile applications with next-generation design.",
  keywords: [
    "Tengra Studio",
    "creative tech studio",
    "digital innovation",
    "immersive experiences",
    "design collective",
    "web development",
    "mobile app development",
    "next.js",
    "react",
    "flutter"
  ],
  authors: [{ name: "Tengra Studio", url: BASE_URL }],
  creator: "Tengra Studio",
  publisher: "Tengra Studio",
  metadataBase: new URL(BASE_URL),
  alternates: {
    canonical: BASE_URL,
    languages: {
      en: `${BASE_URL}/en`,
      tr: `${BASE_URL}/tr`,
    },
  },
  openGraph: {
    title: "Tengra Studio — Shaping myth and code",
    description:
      "Immersive digital craftsmanship fusing the sacred with technology. We build high-performance web and mobile applications.",
    url: BASE_URL,
    siteName: "Tengra Studio",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://cdn.tengra.studio/uploads/tengra_without_text.png",
        width: 1200,
        height: 630,
        alt: "Tengra Studio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tengra Studio",
    description:
      "Immersive digital craftsmanship fusing the sacred with technology.",
    images: ["https://cdn.tengra.studio/uploads/tengra_without_text.png"],
    creator: "@tengrastudio",
    site: "@tengrastudio",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "https://cdn.tengra.studio/uploads/tengra_without_text.png", sizes: "32x32" },
      { url: "https://cdn.tengra.studio/uploads/tengra_without_text.png", sizes: "16x16" }
    ],
    apple: [
      { url: "https://cdn.tengra.studio/uploads/tengra_without_text.png", sizes: "180x180" }
    ],
  },
  manifest: "/manifest.json",
  category: "technology",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Simple locale detection from cookies (fallback to 'en')
  const { cookies: getCookies } = await import('next/headers');
  const cookieStore = await getCookies();
  const localeCookie = cookieStore.get('NEXT_LOCALE')?.value;
  const locale = (localeCookie === 'tr' ? 'tr' : 'en') as 'en' | 'tr';

  // Load translations from JSON on server using config
  const messages = loadTranslations(translationConfig, locale);
  const isProd = process.env.NODE_ENV === "production";

  // Get Structured Data
  const organizationSchema = getOrganizationSchema();
  const webSiteSchema = getWebSiteSchema();

  return (
    <html suppressHydrationWarning lang={locale} className={`${orbitron.variable} ${inter.variable} ${notoOldTurkic.variable}`}>
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

        <LanguageProvider initialLanguage={locale} initialDictionary={messages}>
          <ClientUserProvider>
            <ParticlesClientWrapper />
            <ConsentBanner />
            <AdblockDetector />
            <AdblockNotice />
            <AnalyticsTracker />
            <PWAProvider />
            <div className="flex min-h-screen flex-col">
              {children}
              <Footer />
            </div>
            <GlobalToastContainer />
          </ClientUserProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
