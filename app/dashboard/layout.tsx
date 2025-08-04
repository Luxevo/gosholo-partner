import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Toaster } from "@/components/ui/toaster"
import { DashboardProvider } from "@/contexts/dashboard-context"
import { DashboardLayout } from "@/components/dashboard-layout"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Gosholo Partner - Tableau de bord commerçants",
  description: "Gérez vos commerces, offres, événements et boosts de visibilité avec Gosholo Partner",
  manifest: "/manifest.json",
  themeColor: "#0d9488",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={inter.className}>
          <DashboardProvider>
            <DashboardLayout>
              {children}
            </DashboardLayout>
          </DashboardProvider>
          <Toaster />
      </body>
    </html>
  )
}
