"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Home, Tag, Calendar, Zap, CreditCard, User, HelpCircle, X, Store } from "lucide-react"

const navigation = [
  { name: "Tableau de bord", href: "/", icon: Home, badge: null },
  { name: "Commerces", href: "/commerces", icon: Store, badge: null },
  { name: "Offres", href: "/offres", icon: Tag, badge: 4 },
  { name: "Événements", href: "/evenements", icon: Calendar, badge: 3 },
  { name: "Boosts & visibilité", href: "/boosts", icon: Zap, badge: 15 },
  { name: "Paiements", href: "/paiements", icon: CreditCard, badge: null },
  { name: "Profil & compte", href: "/profil", icon: User, badge: null },
  { name: "Support", href: "/support", icon: HelpCircle, badge: 1 },
]

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col bg-white border-r border-brand-primary/20">
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-6 border-b border-brand-primary/20">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center">
            <span className="text-sm font-bold text-white">G</span>
          </div>
          <span className="text-lg font-semibold text-brand-primary">Gosholo Partner</span>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden">
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
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
              {item.badge && (
                <Badge
                  variant="secondary"
                  className={cn(
                    "text-xs",
                    isActive ? "bg-white/20 text-white" : "bg-brand-primary/10 text-brand-primary",
                  )}
                >
                  {item.badge}
                </Badge>
              )}
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
          <SidebarContent onClose={onClose} />
        </SheetContent>
      </Sheet>
    </>
  )
}
