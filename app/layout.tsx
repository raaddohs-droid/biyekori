import type { Metadata } from "next"
import { Geist, Geist_Mono, Hind_Siliguri } from "next/font/google"
import "./globals.css"
import Navbar from "@/components/Navbar"
import UrgencyBar from "@/components/UrgencyBar"
import ActivityToastWrapper from "@/components/ActivityToastWrapper"
import FloatingChat from "@/components/FloatingChat"

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] })
const hindSiliguri = Hind_Siliguri({ variable: "--font-hind-siliguri", subsets: ["bengali", "latin"], weight: ["400", "600", "700"] })
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Biyekori - Bangladesh AI Matrimony",
  description: "Bangladesh first AI-powered matrimony platform.",
  verification: { google: "h7-K_hB2d_k5XJ23xooLMRuc5GiRaZ1mvmtlwyYB2D8" },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Navbar />
        <div style={{ position: 'fixed', top: '60px', left: 0, right: 0, zIndex: 49 }}><UrgencyBar /></div>
        {children}
        <ActivityToastWrapper />
        <FloatingChat />
      </body>
    </html>
  )
}

