"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bell, Zap, Settings, LogOut, User, Menu } from "lucide-react"
import { useRouter } from "next/navigation"

interface HeaderProps {
  totalBoosts: number
  onMenuClick?: () => void
  showMobileMenu?: boolean
}

export function Header({ totalBoosts, onMenuClick, showMobileMenu }: HeaderProps) {
  const router = useRouter();
  const handleLogout = () => {
    // Remove auth cookie (if any)
    document.cookie = "auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    // Redirect to login
    router.push("/auth/login");
  };
  return (
    <header className="bg-white border-b border-brand-primary/20 px-4 lg:px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Button */}
          {showMobileMenu && onMenuClick && (
            <Button variant="ghost" size="icon" onClick={onMenuClick} className="lg:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <h2 className="text-lg font-semibold text-brand-primary">Dashboard</h2>
        </div>

        <div className="flex items-center space-x-2 lg:space-x-4">
          {/* Indicateur de boosts - Hidden on small mobile */}
          <div className="hidden sm:flex items-center space-x-2">
            <Zap className="h-4 w-4 text-brand-accent" />
            <Badge
              className={`${
                totalBoosts > 5
                  ? "bg-brand-success/20 text-brand-success"
                  : totalBoosts > 2
                    ? "bg-brand-secondary/20 text-brand-secondary"
                    : "bg-brand-accent/20 text-brand-accent"
              }`}
            >
              {totalBoosts} boosts disponibles
            </Badge>
          </div>

          {/* Mobile boosts indicator */}
          <div className="sm:hidden">
            <Badge
              className={`${
                totalBoosts > 5
                  ? "bg-brand-success/20 text-brand-success"
                  : totalBoosts > 2
                    ? "bg-brand-secondary/20 text-brand-secondary"
                    : "bg-brand-accent/20 text-brand-accent"
              }`}
            >
              {totalBoosts}
            </Badge>
          </div>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-4 w-4" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
              2
            </Badge>
          </Button>

          {/* Menu utilisateur */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder-user.jpg" alt="Jean-Pierre" />
                  <AvatarFallback>JP</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">Jean-Pierre Dubois</p>
                  <p className="text-xs leading-none text-muted-foreground">jean-pierre@example.com</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profil</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Paramètres</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-accent focus:text-accent">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Se déconnecter</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
