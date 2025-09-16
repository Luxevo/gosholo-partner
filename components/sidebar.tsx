"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Home, Tag, Calendar, Zap, CreditCard, User, HelpCircle, X, Store, Receipt } from "lucide-react"
import { useDashboard } from "@/contexts/dashboard-context"
import { useLanguage } from "@/contexts/language-context"
import { t } from "@/lib/category-translations"
import Image from "next/image"

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()
  const { counts: { commerces, offers, events, totalBoosts, isLoading } } = useDashboard()
  const { locale } = useLanguage()

  const navigation = [
    { name: t('navigation.dashboard', locale), href: "/dashboard", icon: Home },
    { name: t('navigation.offers', locale), href: "/dashboard/offres", icon: Tag },
    { name: t('navigation.events', locale), href: "/dashboard/evenements", icon: Calendar },
    { name: t('navigation.boosts', locale), href: "/dashboard/boosts", icon: Zap },
    { name: t('paymentHistory.title', locale), href: "/dashboard/historique-paiement", icon: Receipt },
    { name: t('navigation.profile', locale), href: "/dashboard/profil", icon: User },
    { name: t('navigation.support', locale), href: "/dashboard/support", icon: HelpCircle },
  ]

  return (
    <div className="flex h-full flex-col bg-white border-r border-brand-primary/20">
      <div>
        <Image src="/logo.png" alt="Gosholo Partner" width={300} height={140} />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-brand-primary text-white"
                  : "text-brand-primary/70 hover:text-brand-primary hover:bg-brand-primary/5",
              )}
            >
              <div className="flex items-center space-x-3">
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-brand-primary/20">
        <div className="text-xs text-brand-primary/50 text-center">© 2024 Gosholo Partner</div>
      </div>
    </div>
  )
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="left" className="p-0 w-64">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation Gosholo Partner</SheetTitle>
          </SheetHeader>
          <SidebarContent onClose={onClose} />
        </SheetContent>
      </Sheet>
    </>
  )
}
