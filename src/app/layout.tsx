// Sunucu bileşeni, "use client" yok!
import "./globals.css";
import Icon from "../../public/tengra_without_text.png";
import { Metadata, Viewport } from "next";
import ParticlesClientWrapper from "@/components/ui/particles-client-wrapper";
import GlobalToastContainer from "@/components/ui/global-toast-container";
import { Inter, Orbitron } from "next/font/google";
import "@fontsource/noto-sans-old-turkic";
import { notFound } from "next/navigation";

import { routing, type Locale } from "@/i18n/routing";
import Script from "next/script";
import ConsentBanner from "@/components/consent/ConsentBanner";
import ClientUserProvider from "./ClientUserProvider";
import { headers } from "next/headers"; 

export const dynamic = "force-dynamic";

const orbitron = Orbitron({ subsets: ["latin"], variable: "--font-orbitron" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

// metadataBase tells Next how to resolve relative image/URL paths for social cards
// Prefer an explicit public URL in production via NEXT_PUBLIC_SITE_URL or
// NEXT_PUBLIC_METADATA_BASE. Fallback to localhost for dev.
const metadataBaseUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.NEXT_PUBLIC_METADATA_BASE ??
  "http://localhost:3000";
export const metadataBase = new URL(metadataBaseUrl);

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
    url: metadataBase.toString(),
    siteName: "TENGRA",
    images: [
      {
        url: new URL(Icon.src, metadataBase).toString(),
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
    images: [new URL(Icon.src, metadataBase).toString()],
  },
  icons: {
    icon: new URL(Icon.src, metadataBase).toString(),
    shortcut: new URL(Icon.src, metadataBase).toString(),
    apple: new URL(Icon.src, metadataBase).toString(),
  },
  // Custom meta tags (App Router compliant alternative to next/head)
  other: {
    "google-adsense-account": "ca-pub-1840126959284939",
  },
};

export const viewport: Viewport = {
  colorScheme: "dark light",
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params?: { locale?: Locale };
}) {
  // Resolve locale from params
  const locale = params?.locale as Locale | undefined;
  const headersList = await headers();
  const nonce = headersList.get("x-nonce") ?? undefined;

  // Only call `notFound()` when an explicit but invalid locale was provided.
  if (locale !== undefined && !routing.locales.includes(locale)) {
    notFound();
  }

  return (
    <html lang={locale} className={`${orbitron.variable} ${inter.variable}`}>
      <body className="font-sans bg-[color:var(--background)] text-[color:var(--foreground)] w-full min-h-screen">
        {/* Consent Mode default (denied) before any tags load */}
        <Script id="consent-mode-default" strategy="beforeInteractive" nonce={nonce}>
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

        {/* If Google Funding Choices CMP is configured, load its script and skip custom banner */}
        {process.env.NEXT_PUBLIC_GFC_ID ? (
          <>
            <Script
              id="gfc-loader"
              async
              src={`https://fundingchoicesmessages.google.com/i/${process.env.NEXT_PUBLIC_GFC_ID}?ers=1`}
              strategy="afterInteractive"
              nonce={nonce}
            />
            <Script id="gfc-present" strategy="afterInteractive" nonce={nonce}>
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
            <Script
              src="https://static.cloudflareinsights.com/beacon.min.js"
              strategy="afterInteractive"
              nonce={nonce}
            />
          </>
        ) : null}
        <ClientUserProvider>
          <ParticlesClientWrapper />
          <ConsentBanner />
          {children}
          <GlobalToastContainer />
        </ClientUserProvider>
      </body>
    </html>
  );
}
