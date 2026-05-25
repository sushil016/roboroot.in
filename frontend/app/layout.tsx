import type { Metadata } from "next";
import { Syne, JetBrains_Mono } from "next/font/google";
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

export const metadata: Metadata = {
  title: "RoboRoot - Robotics Components & DIY Projects Marketplace",
  description: "Your one-stop destination for robotics components and DIY projects. Browse projects, shop components, and build amazing things.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${syne.variable} ${jetbrainsMono.variable} font-sans antialiased`} suppressHydrationWarning>
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
