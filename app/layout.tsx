import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { LoginDialogProvider } from "@/context/LoginDialogContext";

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
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
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
  // Twitter card
  twitter: {
    card: "summary_large_image",
    title: "Sosamala Voting App",
    description:
      "Sosamala Voting is a secure, modern, and self-hostable online voting platform built for small-scale beauty contests and public competitions.",
    images: ["https://vote-sosamala.vercel.app/ss1.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-br from-gray-950 via-gray-900 to-black`}
      >
        <main>
          <LoginDialogProvider>{children}</LoginDialogProvider>
        </main>
        <Toaster />
      </body>
    </html>
  );
}
