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

export const metadata: Metadata = {
  title: "Sosamala Voting App",
  description:
    "Sosamala Voting is a secure, modern, and self-hostable online voting platform built for small-scale beauty contests and public competitions.",
  metadataBase: new URL("https://vote-sosamala.vercel.app"),
  robots: {
    index: true,
    follow: true,
    nocache: false,
  },
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  openGraph: {
    title: "Sosamala Voting App",
    description:
      "Sosamala Voting is a secure, modern, and self-hostable online voting platform built for small-scale beauty contests and public competitions.",
    url: "https://vote-sosamala.vercel.app",
    siteName: "Sosamala Voting",
    images: [
      {
        url: "https://vote-sosamala.vercel.app/ss1.png",
        width: 1200,
        height: 630,
        alt: "Sosamala Voting App",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  // Twitter card
  twitter: {
    card: "summary_large_image",
    title: "Sosamala Voting App",
    description:
      "Sosamala Voting is a secure, modern, and self-hostable online voting platform built for small-scale beauty contests and public competitions.",
    images: ["https://vote-sosamala.vercel.app/ss1.png"],
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
    <html lang="en" className={cn("font-mono", jetbrainsMono.variable)}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-[#24080f] text-amber-50 antialiased`}
      >
        <LoginModalProvider>
          <div className="relative isolate min-h-dvh overflow-x-clip bg-[linear-gradient(160deg,#24080f_0%,#40101a_45%,#27080f_100%)]">
            <AuruduBackdrop />
            <HomeNavbar />
            <main className="relative z-10 pt-22">{children}</main>
            <Footer />
            <Toaster />
          </div>
        </LoginModalProvider>
      </body>
    </html>
  );
}
