import "./globals.css";
import Icon from "../../public/tengra_without_text.png";
import { Metadata, Viewport } from "next";
import AuthProvider from "@/components/providers/auth-provider";
import ParticlesClientWrapper from "@/components/ui/particles-client-wrapper";
import { Inter, Orbitron } from "next/font/google";
import "@fontsource/noto-sans-old-turkic";
import { notFound } from "next/navigation";

import { routing, type Locale } from "@/i18n/routing";
import Head from "next/head";
import Script from "next/script";
import ConsentBanner from "@/components/consent/ConsentBanner";

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
};

export const viewport: Viewport = {
  colorScheme: "dark light",
};

type MaybePromise<T> = T | Promise<T>;

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  // Next may provide params as a Promise or a plain object
  params?: MaybePromise<{ locale?: Locale }>;
}) {
  // params can be a Promise or a plain object; resolve safely without using `any`
  let resolvedParams: { locale?: Locale } | undefined;
  if (params) {
    if (typeof (params as Promise<{ locale?: Locale }>).then === "function") {
      try {
        resolvedParams = (await params) as { locale?: Locale };
      } catch {
        resolvedParams = undefined;
      }
    } else {
      resolvedParams = params as { locale?: Locale };
    }
  }

  let locale = resolvedParams?.locale as Locale | undefined;

  // Only call `notFound()` when an explicit but invalid locale was provided.
  // Do not force-default here; nested layouts/pages will set providers.
  if (locale !== undefined && !routing.locales.includes(locale)) {
    notFound();
  }

  return (
    <html lang={locale} className={`${orbitron.variable} ${inter.variable}`}>
      <Head>
        <meta name="google-adsense-account" content="ca-pub-1840126959284939" />
      </Head>
      <body className="font-sans bg-[color:var(--background)] text-[color:var(--foreground)] w-full min-h-screen">
        {/* Consent Mode default (denied) before any tags load */}
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

        {/* If Google Funding Choices CMP is configured, load its script and skip custom banner */}
        {process.env.NEXT_PUBLIC_GFC_ID ? (
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
        <AuthProvider>
          <ParticlesClientWrapper />
          <ConsentBanner />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
