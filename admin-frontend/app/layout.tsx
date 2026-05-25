import type { Metadata } from "next";
import "./globals.css";
import { AdminProvider } from "@/core/context/AdminContext";
import { AdminAppShell } from "@/components/layout/AdminAppShell";

export const metadata: Metadata = {
  title: "RoboRoot Admin",
  description: "Catalog, project, and Robomaniac store admin workspace.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AdminProvider>
          <AdminAppShell>{children}</AdminAppShell>
        </AdminProvider>
      </body>
    </html>
  );
}
