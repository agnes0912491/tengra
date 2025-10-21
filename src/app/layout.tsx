// Sunucu bileşeni, "use client" yok!
import "./globals.css";
import Icon from "../../public/tengra_without_text.png";
import { Metadata, Viewport } from "next";
import { cookies, headers } from "next/headers";
import ParticlesClientWrapper from "@/components/ui/particles-client-wrapper";
import GlobalToastContainer from "@/components/ui/global-toast-container";
import { Inter, Orbitron } from "next/font/google";
import "@fontsource/noto-sans-old-turkic";

import Script from "next/script";
import ConsentBanner from "@/components/consent/ConsentBanner";
import ClientUserProvider from "./ClientUserProvider";
import IntlProviderClient from "@/components/providers/intl-provider-client";
import { getMessages } from "@/i18n/get-messages";
import { resolvePreferredLocale } from "@/i18n/resolve-preferred-locale";

export const dynamic = "force-dynamic";

const orbitron = Orbitron({ subsets: ["latin"], variable: "--font-orbitron" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

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
  other: {
    "google-adsense-account": "ca-pub-1840126959284939",
  },
};

export const viewport: Viewport = {
  colorScheme: "dark light",
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

  return (
    <html lang={locale} className={`${orbitron.variable} ${inter.variable}`}>
      <body className="font-sans bg-[color:var(--background)] text-[color:var(--foreground)] w-full min-h-screen">
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
        {/* {isProd && (
          <Script
            src="https://static.cloudflareinsights.com/beacon.min.js"
            strategy="afterInteractive"
            data-cf-beacon='{"token": "YOUR_TOKEN_HERE"}'
          />
        )} */}

        <ClientUserProvider>
          <ParticlesClientWrapper /> 
          <IntlProviderClient locale={locale} messages={messages}>
            <ConsentBanner />
            {children}
          </IntlProviderClient>
          <GlobalToastContainer />
        </ClientUserProvider>
      </body>
    </html>
  );
}