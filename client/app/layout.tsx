import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Teko } from "next/font/google";
import "./globals.css";

const teko = Teko({
  variable: "--font-teko",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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
        teko.variable,
        jetbrainsMono.variable,
      )}
    >
      <body className="min-h-full flex flex-col pt-0 font-sans [--font-sans:var(--font-teko)] [--font-heading:var(--font-teko)] [--font-mono:var(--font-teko)]">
        <AuthProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
