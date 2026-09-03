import type { Metadata, Viewport } from "next";
import { Inter, Manrope } from "next/font/google";
import { Suspense, type ReactNode } from "react";

import { getBaseUrl } from "@/lib/config/base-url";
import { Footer } from "@/components/navigation/footer";
import { GlobalHeader } from "@/components/navigation/global-header";
import { MobileBottomNav } from "@/components/navigation/mobile-bottom-nav";
import { RouteAwareFooter } from "@/components/navigation/route-aware-footer";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(getBaseUrl()),
  title: "GuzoMarket",
  description: "Buy. Sell. Connect.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${manrope.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-surface focus:px-4 focus:py-2 focus:text-brand-primary focus:shadow-lg"
        >
          Skip to content
        </a>
        <GlobalHeader />
        <main id="main-content" className="flex-1 scroll-mt-20">
          {children}
        </main>
        <Suspense fallback={<Footer />}>
          <RouteAwareFooter />
        </Suspense>
        <MobileBottomNav />
      </body>
    </html>
  );
}
