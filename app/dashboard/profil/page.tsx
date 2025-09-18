"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { useLanguage } from "@/contexts/language-context"
import { t, getCategoryLabel } from "@/lib/category-translations"
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { 
  Crown, 
  Zap, 
  Star, 
  Eye, 
  Calendar, 
  Tag, 
  ArrowRight, 
  CheckCircle, 
  XCircle,
  Sparkles,
  TrendingUp,
  User,
  Lock,
  CreditCard,
  Settings,
  LogOut,
  Building2,
  Trash2,
  Edit,
  Plus,
  MapPin,
  Phone,
  Globe
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import ProfileEditFlow from "@/components/profile-edit-flow"
import PasswordChangeFlow from "@/components/password-change-flow"
import SubscriptionManagementFlow from "@/components/subscription-management-flow"
import CommerceManagementFlow from "@/components/commerce-management-flow"
import CommerceCreationFlow from "@/components/commerce-creation-flow"
import { Tables } from "@/types/supabase"

interface UserSubscription {
  id: string
  user_id: string
  plan_type: 'free' | 'pro'
  status: string
  starts_at: string
  ends_at: string | null
}

interface UserStats {
  totalContent: number
  offers: number
  events: number
  boostCredits: number
}

interface Profile {
  id: string
  email: string | null
  first_name: string | null
  last_name: string | null
  phone: string | null
  avatar_url: string | null
  created_at: string | null
  updated_at: string | null
}

type Commerce = Tables<'commerces'>

export default function ProfilPage() {
  const supabase = createClient()
  const { toast } = useToast()
  const { locale } = useLanguage()
  const [subscription, setSubscription] = useState<UserSubscription | null>(null)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [commerces, setCommerces] = useState<Commerce[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Modal states
  const [isProfileEditOpen, setIsProfileEditOpen] = useState(false)
  const [isPasswordChangeOpen, setIsPasswordChangeOpen] = useState(false)
  const [isSubscriptionManagementOpen, setIsSubscriptionManagementOpen] = useState(false)
  const [isDeleteCommerceOpen, setIsDeleteCommerceOpen] = useState(false)
  const [commerceToDelete, setCommerceToDelete] = useState<Commerce | null>(null)
  const [isManageCommerceOpen, setIsManageCommerceOpen] = useState(false)
  const [commerceToEdit, setCommerceToEdit] = useState<Commerce | null>(null)
  const [isCreateCommerceOpen, setIsCreateCommerceOpen] = useState(false)
  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState("")
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)

  const loadUserData = async () => {
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        console.error('Authentication error:', userError)
        return
      }
      setUser(user)

      // Get user profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      setProfile(profileData)

      // Get user subscription
      const { data: subscriptionData } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      
      setSubscription(subscriptionData || { 
        id: 'default',
        user_id: user.id,
        plan_type: 'free', 
        status: 'active', 
        starts_at: new Date().toISOString(), 
        ends_at: null 
      })

      // Get user's commerces
      const { data: commercesData } = await supabase
        .from('commerces')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      setCommerces(commercesData || [])

      // Get boost credits
      const { data: boostCreditsData } = await supabase
        .from('user_boost_credits')
        .select('available_en_vedette, available_visibilite')
        .eq('user_id', user.id)
        .maybeSingle()

      // Get content counts
      const { data: offersData } = await supabase
        .from('offers')
        .select('id')
        .eq('user_id', user.id)

      const { data: eventsData } = await supabase
        .from('events')
        .select('id')
        .eq('user_id', user.id)

      const offersCount = offersData?.length || 0
      const eventsCount = eventsData?.length || 0

      setStats({
        totalContent: offersCount + eventsCount,
        offers: offersCount,
        events: eventsCount,
        boostCredits: (boostCreditsData?.available_en_vedette || 0) + (boostCreditsData?.available_visibilite || 0)
      })

    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadUserData()
  }, [])

  const planLimits = {
    free: { content: 2, boosts: 0 },
    pro: { content: 10, boosts: 1 }
  }

  const currentLimit = planLimits[subscription?.plan_type || 'free']
  const usagePercentage = stats ? (stats.totalContent / currentLimit.content) * 100 : 0
  
  // Debug logging
  console.log('Debug - Plan:', subscription?.plan_type, 'Stats:', stats, 'CurrentLimit:', currentLimit, 'UsagePercentage:', usagePercentage)

  const handleProfileUpdated = () => {
    setIsProfileEditOpen(false)
    loadUserData()
  }

  const handlePasswordChanged = () => {
    setIsPasswordChangeOpen(false)
    toast({
      title: t('messages.success', locale),
      description: t('messages.passwordUpdated', locale),
    })
  }

  const handleSubscriptionUpdated = () => {
    setIsSubscriptionManagementOpen(false)
    loadUserData()
  }

  const handleDeleteCommerce = async () => {
    if (!commerceToDelete) return

    try {
      // Delete all offers for this commerce
      const { error: offersError } = await supabase
        .from('offers')
        .delete()
        .eq('commerce_id', commerceToDelete.id)

      if (offersError) {
        console.error('Error deleting offers:', offersError)
      }

      // Delete all events for this commerce
      const { error: eventsError } = await supabase
        .from('events')
        .delete()
        .eq('commerce_id', commerceToDelete.id)

      if (eventsError) {
        console.error('Error deleting events:', eventsError)
      }

      // Delete the commerce
      const { error: commerceError } = await supabase
        .from('commerces')
        .delete()
        .eq('id', commerceToDelete.id)

      if (commerceError) {
        console.error('Error deleting commerce:', commerceError)
        toast({
          title: t('messages.error', locale),
          description: t('messages.commerceDeleteError', locale),
          variant: "destructive"
        })
        return
      }

      toast({
        title: t('messages.success', locale),
        description: `Commerce "${commerceToDelete.name}" ${t('profile.commerceDeletedSuccess', locale)}`,
      })

      // Refresh data
      loadUserData()
      setIsDeleteCommerceOpen(false)
      setCommerceToDelete(null)

    } catch (error) {
      console.error('Error deleting commerce:', error)
      toast({
        title: t('messages.error', locale),
        description: t('profile.deleteCommerceError', locale),
        variant: "destructive"
      })
    }
  }

  const confirmDeleteCommerce = (commerce: Commerce) => {
    setCommerceToDelete(commerce)
    setIsDeleteCommerceOpen(true)
  }

  const handleEditCommerce = (commerce: Commerce) => {
    setCommerceToEdit(commerce)
    setIsManageCommerceOpen(true)
  }

  const handleCommerceUpdated = () => {
    setIsManageCommerceOpen(false)
    setCommerceToEdit(null)
    loadUserData()
  }

  const handleCreateCommerce = () => {
    setIsCreateCommerceOpen(true)
  }

  const handleCommerceCreated = () => {
    setIsCreateCommerceOpen(false)
    loadUserData()
  }

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Error signing out:', error)
        toast({
          title: t('messages.error', locale),
          description: t('profile.logoutError', locale),
          variant: "destructive"
        })
        return
      }
      
      // Redirect to login page
      window.location.href = '/login'
    } catch (error) {
      console.error('Unexpected error signing out:', error)
    }
  }

  const handleDeleteAccount = async () => {
    const expectedText = t('profile.typeDelete', locale)
    if (deleteConfirmation !== expectedText) {
      toast({
        title: t('messages.error', locale),
        description: t('profile.confirmationMismatch', locale),
        variant: "destructive"
      })
      return
    }

    setIsDeletingAccount(true)
    
    try {
      const response = await fetch('/api/delete-account', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to delete account')
      }

      toast({
        title: t('messages.success', locale),
        description: t('profile.deleteAccountSuccess', locale),
      })

      // Complete cleanup - clear everything
      console.log('🧹 Performing complete cleanup after account deletion')
      
      // 1. Clear all browser storage
      localStorage.clear()
      sessionStorage.clear()
      
      // 2. Clear all cookies manually
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      });
      
      // 3. Try to sign out (will probably fail but try anyway)
      try {
        await supabase.auth.signOut({ scope: 'global' })
      } catch (signOutError) {
        console.log('Expected: signOut failed because user already deleted')
      }

      // 4. Force complete page replacement (not just redirect)
      console.log('✅ Account deleted successfully - redirecting to home')
      window.location.replace('/')

    } catch (error) {
      console.error('Error deleting account:', error)
      toast({
        title: t('messages.error', locale),
        description: t('profile.deleteAccountError', locale),
        variant: "destructive"
      })
    } finally {
      setIsDeletingAccount(false)
    }
  }

  if (isLoading) {
    return (
      <div>
        <div className="p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-48 bg-gray-200 rounded"></div>
              <div className="h-48 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-2">{t('profile.title', locale)}</h1>
          <p className="text-primary/70 text-sm sm:text-base">{t('profile.subtitle', locale)}</p>
        </div>

        {/* Current Plan and Account Info - Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Current Plan Card */}
          <Card className="border-primary/20">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                <div className="flex items-center space-x-3">
                  {subscription?.plan_type === 'pro' ? (
                    <Crown className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500" />
                  ) : (
                    <Star className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                  )}
                  <div>
                    <CardTitle className="text-lg sm:text-xl">
                      {t('profile.plan', locale)} {subscription?.plan_type === 'pro' ? t('profile.pro', locale) : t('profile.free', locale)}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {subscription?.plan_type === 'pro' 
                        ? t('profile.fullAccessWithBoosts', locale) 
                        : t('profile.basicLimitedAccess', locale)
                      }
                    </CardDescription>
                  </div>
                </div>
                <Badge 
                  variant={subscription?.plan_type === 'pro' ? "default" : "secondary"}
                  className={subscription?.plan_type === 'pro' ? "bg-orange-500 hover:bg-orange-600" : ""}
                >
                  {subscription?.plan_type === 'pro' ? t('profile.pro', locale) : t('profile.free', locale)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Usage Stats */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{t('profile.contentUsed', locale)}</span>
                  <span className="text-sm text-primary/70">
                    {stats?.totalContent || 0} / {currentLimit.content}
                  </span>
                </div>
                <div>
                  <Progress value={Math.min(usagePercentage, 100)} className="h-2" />
                </div>
                
                {usagePercentage >= 100 && (
                  <Alert>
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>
                      {t('profile.limitReached', locale)} {subscription?.plan_type === 'free' 
                        ? t('profile.upgradeToPro', locale) 
                        : t('profile.deleteContentOrSupport', locale)}
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Content Breakdown */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Tag className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 mr-2" />
                    <span className="font-semibold text-base sm:text-lg">{stats?.offers || 0}</span>
                  </div>
                  <p className="text-xs text-primary/70">{t('profile.offers', locale)}</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mr-2" />
                    <span className="font-semibold text-base sm:text-lg">{stats?.events || 0}</span>
                  </div>
                  <p className="text-xs text-primary/70">{t('profile.events', locale)}</p>
                </div>
              </div>

              {/* Boost Credits */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
                    <span className="font-medium text-sm sm:text-base">{t('profile.boostCredits', locale)}</span>
                  </div>
                  <Badge variant="outline">
                    {stats?.boostCredits || 0} {(stats?.boostCredits || 0) > 1 ? t('profile.availablePlural', locale) : t('profile.available', locale)}
                  </Badge>
                </div>
                {subscription?.plan_type === 'free' && (
                  <p className="text-xs text-primary/70 mt-1">
{t('profile.upgradeToProBoosts', locale)}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Account Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">{t('profile.accountInfo', locale)}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-primary/70">{t('profile.email', locale)}</label>
                  <p className="font-medium text-sm sm:text-base">{user?.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-primary/70">{t('profile.name', locale)}</label>
                  <p className="font-medium text-sm sm:text-base">
                    {profile?.first_name} {profile?.last_name}
                  </p>
                </div>
                {profile?.phone && (
                  <div>
                    <label className="text-sm font-medium text-primary/70">{t('profile.phone', locale)}</label>
                    <p className="font-medium text-sm sm:text-base">{profile.phone}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-primary/70">{t('profile.memberSince', locale)}</label>
                  <p className="font-medium text-sm sm:text-base">
                    {subscription?.starts_at 
                      ? new Date(subscription.starts_at).toLocaleDateString(locale === 'en' ? 'en-US' : 'fr-FR')
                      : 'N/A'
                    }
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-wrap sm:flex-row gap-3 pt-4">
                <Button variant="outline" onClick={() => setIsProfileEditOpen(true)} className="h-12 sm:h-10 w-full sm:w-auto">
                  <User className="h-4 w-4 mr-2" />
                  {t('profile.editProfile', locale)}
                </Button>
                <Button variant="outline" onClick={() => setIsPasswordChangeOpen(true)} className="h-12 sm:h-10 w-full sm:w-auto">
                  <Lock className="h-4 w-4 mr-2" />
{t('profile.changePassword', locale)}
                </Button>
                <Button variant="outline" onClick={() => setIsSubscriptionManagementOpen(true)} className="h-12 sm:h-10 w-full sm:w-auto">
                  <CreditCard className="h-4 w-4 mr-2" />
                  {t('profile.manageSubscription', locale)}
                </Button>
                
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Commerces Management */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
              <div>
                <CardTitle className="text-lg sm:text-xl">{t('profile.myCommerces', locale)}</CardTitle>
                <CardDescription className="text-sm">
                  {t('profile.manageCommerces', locale)}
                </CardDescription>
              </div>
              <Button onClick={handleCreateCommerce} className="h-12 sm:h-10 w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                {t('profile.addCommerce', locale)}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {commerces.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">{t('profile.noCommerce', locale)}</h3>
                <p className="text-gray-600 mb-4">{t('profile.createFirstCommerce', locale)}</p>
                <Button onClick={handleCreateCommerce} className="h-12 sm:h-10 w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  {t('profile.createCommerce', locale)}
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {commerces.map((commerce) => (
                  <div key={commerce.id} className="border rounded-lg p-4 h-full">
                    <div className="flex flex-col h-full">
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:space-x-3 mb-2 gap-2 sm:gap-0">
                          <div className="flex items-start space-x-3 flex-1">
                            {commerce.image_url ? (
                              <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                <img
                                  src={commerce.image_url}
                                  alt={commerce.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                                <Building2 className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-base sm:text-lg">{commerce.name}</h4>
                              {commerce.category && (
                                <Badge variant="secondary" className="w-fit mt-1">{getCategoryLabel(commerce.category, locale)}</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {commerce.description && (
                          <p className="text-gray-600 mb-3 text-sm">{commerce.description}</p>
                        )}
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex items-start space-x-2">
                            <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                            <span className="truncate">{commerce.address}</span>
                          </div>
                          {commerce.phone && (
                            <div className="flex items-center space-x-2">
                              <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                              <span>{commerce.phone}</span>
                            </div>
                          )}
                          {commerce.email && (
                            <div className="flex items-center space-x-2">
                              <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
                              <span className="truncate">{commerce.email}</span>
                            </div>
                          )}
                          {commerce.website && (
                            <div className="flex items-center space-x-2">
                              <Globe className="h-4 w-4 text-gray-400 flex-shrink-0" />
                              <span className="text-blue-600 hover:underline truncate">
                                <a href={commerce.website} target="_blank" rel="noopener noreferrer">
                                  {commerce.website}
                                </a>
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-3 text-xs text-gray-500">
                          {t('profile.createdOn', locale)} {commerce.created_at 
                            ? new Date(commerce.created_at).toLocaleDateString(locale === 'en' ? 'en-US' : 'fr-FR')
                            : 'N/A'
                          }
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mt-4 pt-4 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-10 sm:h-8 w-full sm:w-auto"
                          onClick={() => handleEditCommerce(commerce)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          {t('profile.edit', locale)}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-10 sm:h-8 w-full sm:w-auto text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => confirmDeleteCommerce(commerce)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          {t('profile.delete', locale)}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">{t('profile.accountActions', locale)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 h-12 sm:h-10"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                {t('profile.signOut', locale)}
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 h-12 sm:h-10 border-red-200"
                onClick={() => setIsDeleteAccountOpen(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {t('profile.deleteAccount', locale)}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profile Edit Dialog */}
      <Dialog open={isProfileEditOpen} onOpenChange={setIsProfileEditOpen}>
        <DialogContent className="w-[95vw] max-w-none sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('profile.editProfileTitle', locale)}</DialogTitle>
            <DialogDescription>
              {t('profile.editProfileDesc', locale)}
            </DialogDescription>
          </DialogHeader>
          {profile && (
            <ProfileEditFlow 
              profile={profile}
              onCancel={() => setIsProfileEditOpen(false)}
              onProfileUpdated={handleProfileUpdated}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Password Change Dialog */}
      <Dialog open={isPasswordChangeOpen} onOpenChange={setIsPasswordChangeOpen}>
        <DialogContent className="w-[95vw] max-w-none sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('profile.changePasswordTitle', locale)}</DialogTitle>
            <DialogDescription>
              {t('profile.changePasswordDesc', locale)}
            </DialogDescription>
          </DialogHeader>
          <PasswordChangeFlow 
            onCancel={() => setIsPasswordChangeOpen(false)}
            onPasswordChanged={handlePasswordChanged}
          />
        </DialogContent>
      </Dialog>

      {/* Subscription Management Dialog */}
      <Dialog open={isSubscriptionManagementOpen} onOpenChange={setIsSubscriptionManagementOpen}>
        <DialogContent className="w-[95vw] max-w-none sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('profile.manageSubscriptionTitle', locale)}</DialogTitle>
            <DialogDescription>
              {t('profile.manageSubscriptionDesc', locale)}
            </DialogDescription>
          </DialogHeader>
          {subscription && (
            <SubscriptionManagementFlow 
              currentSubscription={subscription}
              onCancel={() => setIsSubscriptionManagementOpen(false)}
              onSubscriptionUpdated={handleSubscriptionUpdated}
            />
          )}
        </DialogContent>
      </Dialog>

    
             {/* Manage Commerce Dialog */}
       <Dialog open={isManageCommerceOpen} onOpenChange={setIsManageCommerceOpen}>
         <DialogContent className="w-[95vw] max-w-none sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
           <DialogHeader>
            <DialogTitle>{t('profile.manageCommerceTitle', locale)}</DialogTitle>
            <DialogDescription>
              {t('profile.manageCommerceDesc', locale)} {commerceToEdit?.name}.
            </DialogDescription>
           </DialogHeader>
           {commerceToEdit && (
             <CommerceManagementFlow 
               commerce={commerceToEdit}
               onCancel={handleCommerceUpdated}
               onCommerceUpdated={handleCommerceUpdated}
             />
           )}
         </DialogContent>
       </Dialog>

               {/* Create Commerce Dialog */}
        <Dialog open={isCreateCommerceOpen} onOpenChange={setIsCreateCommerceOpen}>
          <DialogContent className="w-[95vw] max-w-none sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t('profile.createCommerceTitle', locale)}</DialogTitle>
              <DialogDescription>
                {t('profile.createCommerceDesc', locale)}
              </DialogDescription>
            </DialogHeader>
            <CommerceCreationFlow 
              onCancel={handleCommerceCreated}
            />
          </DialogContent>
        </Dialog>

        {/* Delete Commerce Confirmation Dialog */}
        <Dialog open={isDeleteCommerceOpen} onOpenChange={setIsDeleteCommerceOpen}>
          <DialogContent className="w-[95vw] max-w-none sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{t('profile.deleteCommerceTitle', locale)}</DialogTitle>
              <DialogDescription>
                {t('profile.deleteCommerceDesc', locale)}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {commerceToDelete && (
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <h4 className="font-medium text-red-800 mb-2">
                    {t('profile.commerceToDelete', locale)} {commerceToDelete.name}
                  </h4>
                  <p className="text-sm text-red-700">
                    {t('profile.deleteWarning', locale)}
                  </p>
                </div>
              )}
              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:space-x-2">
                <Button 
                  variant="outline" 
                  className="w-full sm:w-auto h-12 sm:h-10"
                  onClick={() => {
                    setIsDeleteCommerceOpen(false)
                    setCommerceToDelete(null)
                  }}
                >
                  {t('profile.cancel', locale)}
                </Button>
                <Button 
                  variant="destructive" 
                  className="w-full sm:w-auto h-12 sm:h-10"
                  onClick={handleDeleteCommerce}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t('profile.deletePermanently', locale)}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Account Confirmation Dialog */}
        <Dialog open={isDeleteAccountOpen} onOpenChange={setIsDeleteAccountOpen}>
          <DialogContent className="w-[95vw] max-w-none sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="text-red-600">{t('profile.deleteAccountTitle', locale)}</DialogTitle>
              <DialogDescription>
                {t('profile.deleteAccountDesc', locale)}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <p className="font-medium text-red-800 mb-3">
                  {t('profile.deleteAccountWarning', locale)}
                </p>
                <div className="text-sm text-red-700 whitespace-pre-line">
                  {t('profile.deleteAccountDataList', locale)}
                </div>
              </div>
              
              <div className="space-y-3">
                <p className="font-medium text-gray-900">
                  {t('profile.deleteAccountConfirm', locale)}
                </p>
                <Input
                  type="text"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  placeholder={t('profile.typeDelete', locale)}
                  className="w-full"
                />
              </div>
              
              <div className="flex flex-col sm:flex-row justify-end gap-3 sm:space-x-3">
                <Button 
                  variant="outline" 
                  className="w-full sm:w-auto h-12 sm:h-10"
                  onClick={() => {
                    setIsDeleteAccountOpen(false)
                    setDeleteConfirmation("")
                  }}
                  disabled={isDeletingAccount}
                >
                  {t('profile.deleteAccountCancel', locale)}
                </Button>
                <Button 
                  variant="destructive" 
                  className="w-full sm:w-auto h-12 sm:h-10"
                  onClick={handleDeleteAccount}
                  disabled={isDeletingAccount || deleteConfirmation !== t('profile.typeDelete', locale)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {isDeletingAccount ? t('profile.deleteAccountProcessing', locale) : t('profile.deleteAccountButton', locale)}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
    </div>
  )
}