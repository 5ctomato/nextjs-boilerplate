// app/layout.tsx
import type { Metadata } from "next"
import { Inter, Lora, Geist_Mono } from "next/font/google"
import "./globals.css"

// Using Inter as SoDoSans substitute (proprietary Starbucks font)
const inter = Inter({
  variable: "--font-sodo-sans",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
})

// Lora for Rewards serif moments (Lander Tall substitute)
const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Next.js Boilerplate",
  description: "Next.js 16 · Tailwind CSS v4 · shadcn/ui · Auth.js · Prisma · Neon",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background">
      <body
        className={`${inter.variable} ${lora.variable} ${geistMono.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  )
}
