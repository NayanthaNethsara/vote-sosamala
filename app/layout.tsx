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
