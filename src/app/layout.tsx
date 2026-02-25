import type { Metadata } from "next";
import { Inter, Noto_Serif_KR } from "next/font/google";
import "./globals.css";
// import { ClientWalletProvider } from "@/components/providers/WalletProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const notoSerifKr = Noto_Serif_KR({
  variable: "--font-noto-serif-kr",
  weight: ["400", "700", "900"],
  subsets: ["latin"],
  display: "swap",
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0A0E27",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://sajuchain.com"),
  title: "SajuChain - On-Chain Destiny & AI Fortune Telling",
  description: "Discover your destiny with SajuChain. AI-powered Saju analysis meets Blockchain permanence. Mint your fortune as an NFT.",
  openGraph: {
    title: "SajuChain - On-Chain Destiny & AI Fortune Telling",
    description: "Discover your destiny with SajuChain. AI-powered Saju analysis meets Blockchain permanence.",
    url: "https://sajuchain.com",
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
import { VoiceAgent } from "@/components/voice/VoiceAgent";
import ErrorBoundary from "@/components/ErrorBoundary";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${inter.variable} ${notoSerifKr.variable} antialiased font-sans`}
      >
        <ErrorBoundary>
          <ClientWalletProvider>
            {children}
          </ClientWalletProvider>
        </ErrorBoundary>
        <VoiceAgent />
      </body>
    </html>
  );
}
