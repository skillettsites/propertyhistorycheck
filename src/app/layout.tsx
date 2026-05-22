import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.homebuyercheck.co.uk";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "HomeBuyerCheck, Check any UK property in 30 seconds",
    template: "%s | HomeBuyerCheck",
  },
  description:
    "Check any UK property's history in 30 seconds. Free instant postcode-level report. £4.99 Premium adds ownership, ground risk, Companies House owner check, BSR Higher-Risk Building register, Property Chamber tribunal history and AI buyer's verdict. £6.99 Premium+ adds AI Solicitor / Surveyor / Mortgage briefs and a Negotiation Report that typically saves £3,000-£15,000.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "HomeBuyerCheck, Check any UK property in 30 seconds",
    description: "Free instant UK property report. £4.99 Premium + £6.99 Premium+ with AI briefs + Negotiation Report (typically saves £3,000-£15,000).",
    url: SITE_URL,
    siteName: "HomeBuyerCheck",
    type: "website",
    locale: "en_GB",
    images: [{ url: `${SITE_URL}/api/og`, width: 1200, height: 630, alt: "HomeBuyerCheck, UK property due-diligence" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "HomeBuyerCheck",
    description: "Check any UK property in 30 seconds.",
    images: [`${SITE_URL}/api/og`],
  },
  robots: { index: true, follow: true },
};

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-GB" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <meta name="msvalidate.01" content="8467B89365C947F24710AB7D84B06F92" />
      </head>
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        {children}
        <Analytics />
        {GA_ID ? (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
            <Script id="ga-init" strategy="afterInteractive">{`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}');
            `}</Script>
          </>
        ) : null}
      </body>
    </html>
  );
}
