import type { Metadata } from "next";
import type { Viewport } from "next";
import { Geist, Geist_Mono, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

import { AuruduBackdrop } from "@/components/background/aurudu-backdrop";
import { HomeNavbar } from "@/components/home-navbar";
import { Footer } from "@/components/footer";
import { LoginModalProvider } from "@/hooks/use-login-modal";
import { Toaster } from "@/components/ui/sonner";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { siteConfig } from "@/config/site-config";

const siteUrl = siteConfig.url;

export const metadata: Metadata = {
  title: `${siteConfig.name} 2026`,
  description:
    "Wasantha Muwadora 2026 Voting Platform. Support your favorite Aurudu Kumara and Kumariya contestants.",
  metadataBase: new URL(siteUrl),
  robots: {
    index: true,
    follow: true,
    nocache: false,
  },
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  openGraph: {
    title: `${siteConfig.name} 2026`,
    description:
      "Wasantha Muwadora 2026 Voting Platform. Support your favorite Aurudu Kumaraya and Kumari contestants.",
    url: siteUrl,
    siteName: siteConfig.name,
    images: [
      {
        url: "/og.jpg",
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} 2026`,
    description:
      "Wasantha Muwadora 2026 Voting Platform. Support your favorite Aurudu Kumaraya and Kumari contestants.",
    images: ["/og.jpg"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("font-mono", jetbrainsMono.variable)}
      data-scroll-behavior="smooth"
    >
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-[#24080f] text-amber-50 antialiased`}
      >
        <LoginModalProvider>
          <div className="relative isolate flex min-h-dvh flex-col overflow-x-clip bg-[linear-gradient(160deg,#24080f_0%,#40101a_45%,#27080f_100%)]">
            <AuruduBackdrop />
            <HomeNavbar />
            <main className="relative z-10 flex-1 pt-22">{children}</main>
            <Footer />
            <Toaster />
          </div>
        </LoginModalProvider>
      </body>
    </html>
  );
}
