"use client"

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
import {  Settings, LogOut, User, Menu, Zap, Crown, Star } from "lucide-react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useDashboard } from "@/contexts/dashboard-context"

interface HeaderProps {
  onMenuClick?: () => void
  showMobileMenu?: boolean
}

export function Header({ onMenuClick, showMobileMenu }: HeaderProps) {
  const router = useRouter();
  const supabase = createClient();
  const { counts, userProfile } = useDashboard();

  const getUserDisplayName = () => {
    if (!userProfile) return "Partenaire";

    if (userProfile.first_name && userProfile.last_name) {
      return `${userProfile.first_name} ${userProfile.last_name}`;
    } else if (userProfile.first_name) {
      return userProfile.first_name;
    } else if (userProfile.last_name) {
      return userProfile.last_name;
    } else {
      // Fallback to email or generic name
      return userProfile.email.split('@')[0] || "Partenaire";
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error.message);
        return;
      }
      
      // Redirect to login page after successful logout
      router.push("/login");
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <header className="bg-white border-b border-brand-primary/20 px-4 lg:px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Menu button and title */}
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          {/* Mobile Menu Button */}
          {showMobileMenu && onMenuClick && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onMenuClick} 
              className="lg:hidden flex-shrink-0 h-10 w-10"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          
          {/* Title - responsive and truncates on mobile */}
          <h1 className="text-lg font-semibold text-brand-primary truncate">
            <span className="hidden sm:inline">Bienvenue, {getUserDisplayName()} !</span>
            <span className="sm:hidden">Bienvenue, {getUserDisplayName()} !</span>
          </h1>
        </div>

        {/* Right side - Boost credits and user menu */}
        <div className="flex items-center space-x-2 lg:space-x-4 flex-shrink-0">
          {/* Mobile: Compact boost display */}
          <div className="sm:hidden flex items-center space-x-1">
            <Link href="/dashboard/boosts">
              <div className="flex items-center space-x-1 px-2 py-1.5 rounded-lg border transition-colors cursor-pointer min-h-[44px]" 
                   style={{ backgroundColor: 'rgba(178, 253, 157, 0.2)', borderColor: 'rgba(178, 253, 157, 0.5)' }} 
                   onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(178, 253, 157, 0.3)'; e.currentTarget.style.borderColor = 'rgba(178, 253, 157, 0.7)' }} 
                   onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(178, 253, 157, 0.2)'; e.currentTarget.style.borderColor = 'rgba(178, 253, 157, 0.5)' }}>
                <Crown className="h-4 w-4 text-green-700" />
                <span className="text-sm font-medium text-green-700">
                  {counts.isLoading ? '...' : counts.boostCreditsVedette}
                </span>
              </div>
            </Link>
            
            <Link href="/dashboard/boosts">
              <div className="flex items-center space-x-1 px-2 py-1.5 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 hover:border-blue-300 transition-colors cursor-pointer min-h-[44px]">
                <Zap className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-600">
                  {counts.isLoading ? '...' : counts.boostCreditsVisibilite}
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop: Full boost credits display */}
          <div className="hidden sm:flex items-center space-x-2">
            {/* Boost Credits - Vedette */}
            <Link href="/dashboard/boosts">
              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg border transition-colors cursor-pointer min-h-[44px]" 
                   style={{ backgroundColor: 'rgba(178, 253, 157, 0.2)', borderColor: 'rgba(178, 253, 157, 0.5)' }} 
                   onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(178, 253, 157, 0.3)'; e.currentTarget.style.borderColor = 'rgba(178, 253, 157, 0.7)' }} 
                   onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(178, 253, 157, 0.2)'; e.currentTarget.style.borderColor = 'rgba(178, 253, 157, 0.5)' }}>
                <Crown className="h-4 w-4 text-green-700" />
                <div className="flex items-center space-x-1 text-sm">
                  <span className="text-green-700/80">Vedette:</span>
                  <span className="font-medium text-green-700">
                    {counts.isLoading ? '...' : counts.boostCreditsVedette}
                  </span>
                </div>
              </div>
            </Link>

            {/* Boost Credits - Visibilité */}
            <Link href="/dashboard/boosts">
              <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-100 hover:border-blue-300 transition-colors cursor-pointer min-h-[44px]">
                <Zap className="h-4 w-4 text-blue-600" />
                <div className="flex items-center space-x-1 text-sm">
                  <span className="text-blue-600/80">Visibilité:</span>
                  <span className="font-medium text-blue-600">
                    {counts.isLoading ? '...' : counts.boostCreditsVisibilite}
                  </span>
                </div>
              </div>
            </Link>

            {/* Subscription Plan */}
            <Link href="/dashboard/boosts">
              <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-100 hover:border-blue-300 transition-colors cursor-pointer min-h-[44px]">
                {counts.subscriptionPlan === 'pro' ? (
                  <Crown className="h-4 w-4 text-yellow-600" />
                ) : (
                  <Star className="h-4 w-4 text-gray-500" />
                )}
                                 <span className="text-sm font-medium text-blue-700">
                   {counts.isLoading ? '...' : counts.subscriptionPlan === 'pro' ? 'Plus' : 'Gratuit'}
                 </span>
              </div>
            </Link>
          </div>

          {/* User Menu - improved touch target */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full flex-shrink-0">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder-user.jpg" alt="User" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{getUserDisplayName()}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {userProfile?.email || "user@example.com"}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/dashboard/profil')}>
                <User className="mr-2 h-4 w-4" />
                <span>Profil</span>
              </DropdownMenuItem>
 
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
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
