import type { Metadata } from "next"
import { Inter, Hind_Siliguri } from "next/font/google"
import "./globals.css"
import Navbar from "@/components/Navbar"
import UrgencyBar from "@/components/UrgencyBar"
import ActivityToastWrapper from "@/components/ActivityToastWrapper"
import FloatingChat from "@/components/FloatingChat"
import MobileBottomNav from "@/components/MobileBottomNav"
import Link from "next/link"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
})

const hindSiliguri = Hind_Siliguri({
  variable: "--font-hind-siliguri",
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600", "700"],
})

export const metadata: Metadata = {
  title: "বিয়েকরি — বাংলাদেশের সেরা ম্যাট্রিমনি প্ল্যাটফর্ম",
  description: "বিয়েকরি — গোপনীয়তা, সম্মতি এবং AI-চালিত ম্যাচিং দিয়ে বাংলাদেশের সবচেয়ে বিশ্বস্ত বিবাহ প্ল্যাটফর্ম।",
  keywords: "বিয়ে, বিয়েকরি, matrimony bangladesh, bd matrimony, biye, NRB matrimony, bangladeshi bride groom",
  openGraph: {
    title: "বিয়েকরি — বাংলাদেশের সেরা ম্যাট্রিমনি প্ল্যাটফর্ম",
    description: "গোপনীয়তা-প্রথম, AI-চালিত বিবাহ প্ল্যাটফর্ম। ফোন নম্বর শেয়ার হয় না সম্মতি ছাড়া।",
    siteName: "Biyekori",
    locale: "bn_BD",
    type: "website",
    url: "https://biyekori.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "বিয়েকরি — Bangladesh Matrimony",
    description: "Privacy-first, AI-powered matrimony for Bangladeshis worldwide.",
  },
  verification: { google: "h7-K_hB2d_k5XJ23xooLMRuc5GiRaZ1mvmtlwyYB2D8" },
  manifest: "/manifest.json",
  themeColor: "#7B1D2E",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Biyekori",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="theme-color" content="#7B1D2E" />
      </head>
      <body className={`${inter.variable} ${hindSiliguri.variable}`} style={{ overflowX: "hidden", maxWidth: "100vw" }}>
        <Navbar />
        <div style={{ position: 'fixed', top: '60px', left: 0, right: 0, zIndex: 49 }}><UrgencyBar /></div>
        {children}
        <MobileBottomNav />
        <ActivityToastWrapper />
        <FloatingChat />
      </body>
    </html>
  )
}
