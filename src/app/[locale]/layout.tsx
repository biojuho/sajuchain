import type { Metadata } from "next";
import { Inter, Noto_Serif_KR } from "next/font/google";
import Script from "next/script";
import "../globals.css";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const notoSerifKr = Noto_Serif_KR({
  variable: "--font-noto-serif-kr",
  weight: ["400", "700", "900"],
  preload: true,
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sajuchain.com';

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#000000",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  manifest: "/manifest.json",
  title: "SajuChain - On-Chain Destiny & AI Fortune Telling",
  description: "Discover your destiny with SajuChain. AI-powered Saju analysis meets Blockchain permanence. Mint your fortune as an NFT.",
  openGraph: {
    title: "SajuChain - On-Chain Destiny & AI Fortune Telling",
    description: "Discover your destiny with SajuChain. AI-powered Saju analysis meets Blockchain permanence.",
    url: siteUrl,
    siteName: "SajuChain",
    images: [
      {
        url: "/api/og", // Dynamic OG Image
        width: 1200,
        height: 630,
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SajuChain - On-Chain Destiny",
    description: "Discover your destiny with SajuChain.",
    images: ["/api/og"],
  },
};

import { ClientWalletProvider } from "@/components/providers/WalletProvider";
import { NotificationProvider } from "@/components/providers/NotificationProvider";
import ErrorBoundary from "@/components/ErrorBoundary";
import GoogleAnalytics from "@/components/providers/GoogleAnalytics";
import BottomTabBar from "@/components/mobile/BottomTabBar";
import dynamic from 'next/dynamic';

const ParticlesBackground = dynamic(() => import('@/components/ui/ParticlesBackground'), { ssr: false });
const VoiceAgent = dynamic(() => import('@/components/voice/VoiceAgent').then(mod => mod.VoiceAgent), { ssr: false });

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as "ko" | "en" | "ja" | "zh")) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body
        className={`${inter.variable} ${notoSerifKr.variable} antialiased font-sans`}
      >
        <NextIntlClientProvider messages={messages} locale={locale}>
            <Script
            src="https://mcp.figma.com/mcp/html-to-design/capture.js"
            strategy="afterInteractive"
            />
            <GoogleAnalytics />
            <ErrorBoundary>
            <ClientWalletProvider>
                <NotificationProvider>
                    <ParticlesBackground />
                    {children}
                    <BottomTabBar />
                </NotificationProvider>
            </ClientWalletProvider>
            </ErrorBoundary>
            <VoiceAgent />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
