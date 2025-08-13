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
import { Bell, Settings, LogOut, User, Menu, Zap, Crown, Star } from "lucide-react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useState, useEffect } from "react"
import Link from "next/link"

interface HeaderProps {
  onMenuClick?: () => void
  showMobileMenu?: boolean
}

interface UserData {
  boostCredits: number
  subscriptionPlan: 'free' | 'pro'
}

export function Header({ onMenuClick, showMobileMenu }: HeaderProps) {
  const router = useRouter();
  const supabase = createClient();
  const [userData, setUserData] = useState<UserData>({ boostCredits: 0, subscriptionPlan: 'free' });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) {
          console.error('Authentication error:', userError)
          return
        }

        // Get user subscription
        const { data: subscriptionData } = await supabase
          .from('subscriptions')
          .select('plan_type')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        // Get boost credits
        const { data: boostCreditsData } = await supabase
          .from('user_boost_credits')
          .select('available_en_vedette, available_visibilite')
          .eq('user_id', user.id)
          .maybeSingle()

        const totalCredits = (boostCreditsData?.available_en_vedette || 0) + (boostCreditsData?.available_visibilite || 0)

        setUserData({
          boostCredits: totalCredits,
          subscriptionPlan: subscriptionData?.plan_type || 'free'
        })
      } catch (error) {
        console.error('Error fetching user data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [supabase])

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
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Button */}
          {showMobileMenu && onMenuClick && (
            <Button variant="ghost" size="icon" onClick={onMenuClick} className="lg:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <h1 className="text-lg font-semibold text-brand-primary">Tableau de bord entreprise</h1>
        </div>

        <div className="flex items-center space-x-4">
          {/* Boost Credits */}
          <Link href="/dashboard/boosts">
            <div className="flex items-center space-x-2 bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-200 hover:bg-orange-100 hover:border-orange-300 transition-colors cursor-pointer">
              <Zap className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-700">
                {isLoading ? '...' : userData.boostCredits}
              </span>
              <span className="text-xs text-orange-600">boost{userData.boostCredits !== 1 ? 's' : ''}</span>
            </div>
          </Link>

          {/* Subscription Plan */}
          <Link href="/dashboard/boosts">
            <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-100 hover:border-blue-300 transition-colors cursor-pointer">
              {userData.subscriptionPlan === 'pro' ? (
                <Crown className="h-4 w-4 text-yellow-600" />
              ) : (
                <Star className="h-4 w-4 text-gray-500" />
              )}
              <span className="text-sm font-medium text-blue-700">
                {isLoading ? '...' : userData.subscriptionPlan === 'pro' ? 'Pro' : 'Gratuit'}
              </span>
            </div>
          </Link>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder-user.jpg" alt="User" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">Utilisateur</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    user@example.com
                  </p>
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
