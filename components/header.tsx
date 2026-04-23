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
import { LogOut, User, Menu, Crown, Star } from "lucide-react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useDashboard } from "@/contexts/dashboard-context"
import { useLanguage } from "@/contexts/language-context"
import { t } from "@/lib/category-translations"

interface HeaderProps {
  onMenuClick?: () => void
  showMobileMenu?: boolean
}

export function Header({ onMenuClick, showMobileMenu }: HeaderProps) {
  const router = useRouter();
  const supabase = createClient();
  const { counts, userProfile } = useDashboard();
  const { locale } = useLanguage();

  const getUserDisplayName = () => {
    if (!userProfile) return t('header.partner', locale);

    if (userProfile.first_name && userProfile.last_name) {
      return `${userProfile.first_name} ${userProfile.last_name}`;
    } else if (userProfile.first_name) {
      return userProfile.first_name;
    } else if (userProfile.last_name) {
      return userProfile.last_name;
    } else {
      // Fallback to email or generic name
      return userProfile.email.split('@')[0] || t('header.partner', locale);
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
         <div className="flex items-center space-x-2 min-w-0 flex-1">
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
           
          {/* Title - only show welcome message on desktop */}
          <h1 className="text-lg font-semibold text-brand-primary truncate">
            <span className="hidden sm:inline">{t('dashboard.welcome', locale)}, {getUserDisplayName()} !</span>
          </h1>
         </div>

                 {/* Right side - subscription plan and user menu */}
         <div className="flex items-center space-x-2 lg:space-x-4 flex-shrink-0">
          {/* Subscription Plan */}
          <Link href="/dashboard/boosts">
            <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border transition-colors cursor-pointer min-h-[44px] ${
              counts.subscriptionPlan === 'pro'
                ? 'bg-orange-50 border-orange-200 hover:bg-orange-100 hover:border-orange-300'
                : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
            }`}>
              {counts.subscriptionPlan === 'pro' ? (
                <Crown className="h-4 w-4 text-brand-accent" />
              ) : (
                <Star className="h-4 w-4 text-gray-500" />
              )}
              <span className={`text-sm font-medium hidden sm:inline ${
                counts.subscriptionPlan === 'pro' ? 'text-brand-accent' : 'text-gray-700'
              }`}>
                {counts.isLoading ? '...' : counts.subscriptionPlan === 'pro' ? t('boosts.pro', locale) : t('boosts.free', locale)}
              </span>
            </div>
          </Link>

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
                <span>{t('header.profile', locale)}</span>
              </DropdownMenuItem>
 
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>{t('header.logout', locale)}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
