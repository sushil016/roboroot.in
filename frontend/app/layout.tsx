import type { Metadata } from "next";
import { Syne, JetBrains_Mono, Inter } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/providers/AppProvider";
import { Toaster } from "@/components/ui/sonner";
import { LayoutWrapper } from "@/components/layout/LayoutWrapper";
import { CookieConsent } from "@/components/ui/cookie-consent";
import { SiteNotifications } from "@/components/ui/site-notifications";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

// Primary UI/body typeface. globals.css already maps --font-sans to Inter but the
// font was never actually loaded — wiring it here upgrades the whole app (and the
// chat, which relies on font-sans) to real Inter for a cleaner, premium feel.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const SITE_URL = "https://roboroot.in";
const SITE_NAME = "RoboRoot";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "RoboRoot – Robotics, Electronics & DIY Components India",
    template: "%s | RoboRoot",
  },
  description:
    "India's premier marketplace for robotics components, electronics, course kits, PCB fabrication, and custom drone builds. Shop sensors, dev boards, motors, and more.",
  keywords: [
    "robotics components India",
    "electronics components online",
    "Arduino sensors",
    "Raspberry Pi",
    "DIY electronics",
    "PCB design India",
    "drone components",
    "STEM kits",
    "course kits",
    "maker store India",
  ],
  authors: [{ name: "RoboRoot", url: SITE_URL }],
  creator: "RoboRoot",
  publisher: "RoboRoot",
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "RoboRoot – Robotics, Electronics & DIY Components India",
    description:
      "India's premier marketplace for robotics components, electronics, course kits, PCB fabrication, and custom drone builds.",
    images: [
      {
        url: "/roboroot-logo.png",
        width: 1200,
        height: 630,
        alt: "RoboRoot – Robotics & Electronics Marketplace India",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "RoboRoot – Robotics, Electronics & DIY Components India",
    description:
      "India's premier marketplace for robotics components, electronics, course kits, PCB fabrication, and custom drone builds.",
    images: ["/roboroot-logo.png"],
    site: "@roboroot_in",
    creator: "@roboroot_in",
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
  verification: {
    // Add your Google Search Console verification code here once you have it
    // google: "YOUR_GOOGLE_VERIFICATION_CODE",
  },
  category: "ecommerce",
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "RoboRoot",
  url: SITE_URL,
  logo: `${SITE_URL}/roboroot-logo.png`,
  description:
    "India's premier marketplace for robotics components, electronics components, PCB fabrication, and custom drone builds.",
  address: {
    "@type": "PostalAddress",
    addressCountry: "IN",
  },
  sameAs: [],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "RoboRoot",
  url: SITE_URL,
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/components?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body className={`${syne.variable} ${jetbrainsMono.variable} ${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        <AppProvider>
          <LayoutWrapper>{children}</LayoutWrapper>
          <Toaster />
          <SiteNotifications />
          <CookieConsent />
        </AppProvider>
      </body>
    </html>
  );
}
