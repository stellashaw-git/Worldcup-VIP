import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { HomeProvider } from "@/components/home/home-provider";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BLACKBOOK | World Cup 2026 Access",
  description:
    "Exclusive suites, lounges, hospitality, and private events for the 2026 FIFA World Cup.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} flex min-h-screen flex-col antialiased`}
      >
        <SiteHeader />
        <main className="flex-1">
          <HomeProvider>{children}</HomeProvider>
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
