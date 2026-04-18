import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, JetBrains_Mono } from "next/font/google";
import "./globals.css";

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
  // Standard meta tags
  metadataBase: new URL("https://vote-sosamala.vercel.app"),
  robots: {
    index: true,
    follow: true,
    nocache: false,
  },
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  // Open Graph
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

import { AuthProvider } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        "dark",
        geistSans.variable,
        geistMono.variable,
        jetbrainsMono.variable,
      )}
    >
      <body className="min-h-full flex flex-col pt-0">
        <AuthProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
