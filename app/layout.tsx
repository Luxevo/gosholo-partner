import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { DashboardProvider } from "@/contexts/dashboard-context"
import { LanguageProvider } from "@/contexts/language-context"
import { DashboardLayout } from "@/components/dashboard-layout"
import { AuthErrorHandler } from "@/components/auth-error-handler"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "gosholo  - dashboard",
  description: "Gérez vos commerces, offres, événements et boosts de visibilité avec gosholo",
  manifest: "/manifest.json",
  generator: 'v0.dev'
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0d9488"
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          <LanguageProvider>
            <DashboardProvider>
              <AuthErrorHandler />
              {children}
              <Toaster />
            </DashboardProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
