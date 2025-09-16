import type React from "react"
import type { Metadata } from "next"
import { DashboardProvider } from "@/contexts/dashboard-context"
import { DashboardLayout } from "@/components/dashboard-layout"

export const metadata: Metadata = {
  title: "gosholo - dahsboard",
  description: "Gérez vos commerces, offres, événements et boosts de visibilité avec Gosholo Partner",
  manifest: "/manifest.json",
  themeColor: "#0d9488",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
    generator: 'v0.dev'
}

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardProvider>
      <DashboardLayout>
        {children}
      </DashboardLayout>
    </DashboardProvider>
  )
}
