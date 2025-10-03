"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { useLanguage } from "@/contexts/language-context"
import { t } from "@/lib/category-translations"
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Zap,
  Sparkles,
  Eye,
  Star,
  TrendingUp,
  Crown,
  Calendar,
  Tag,
  CheckCircle,
  ArrowRight,
  CreditCard
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { applyBoost, removeBoost, formatBoostRemainingTime, isBoostExpired } from "@/lib/boost-utils"
import { useBoostExpiry } from "@/hooks/use-boost-expiry"
import BoostPurchaseForm from "@/components/boost-purchase-form"
import { getStripe } from "@/lib/stripe"
import { useDashboard } from "@/contexts/dashboard-context"

interface UserContent {
  id: string
  title: string
  type: 'offer' | 'event' | 'commerce'
  commerce_name: string
  boosted: boolean
  boost_type?: 'en_vedette' | 'visibilite'
  boosted_at?: string | null
  remaining_time?: string
}

interface UserStats {
  availableEnVedette: number
  availableVisibilite: number
  totalContent: number
  boostedContent: number
}

interface BoostCredits {
  available_en_vedette: number
  available_visibilite: number
}

export default function BoostsPage() {
  const supabase = createClient()
  const { refreshCounts } = useDashboard()
  const { locale } = useLanguage()
  const [userContent, setUserContent] = useState<UserContent[]>([])
  const [stats, setStats] = useState<UserStats | null>(null)
  const [boostCredits, setBoostCredits] = useState<BoostCredits | null>(null)
  const [subscription, setSubscription] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isApplyingBoost, setIsApplyingBoost] = useState<string | null>(null)
  const [isPurchasing, setIsPurchasing] = useState<string | null>(null)
  const [showPurchaseForm, setShowPurchaseForm] = useState<'en_vedette' | 'visibilite' | null>(null)
  
  // Auto-expire old boosts every 30 minutes
  useBoostExpiry(30)

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) {
          console.error('Authentication error:', userError)
          return
        }

        // Get user profile and subscription status
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('is_subscribed')
          .eq('id', user.id)
          .single()

        if (profileError) {
          console.error('Error fetching profile:', profileError)
        }

        // Also check subscriptions table for more detailed info
        const { data: subscriptionData, error: subError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()
        
        if (subError) {
          console.error('Error fetching subscriptions:', subError)
        }
        
        // Use both sources to determine subscription status
        const isSubscribed = profileData?.is_subscribed || subscriptionData?.status === 'active'
        const planType = subscriptionData?.plan_type || (profileData?.is_subscribed ? 'pro' : 'free')
        
        console.log('🔍 Subscription Debug:', {
          profileSubscribed: profileData?.is_subscribed,
          subscriptionActive: subscriptionData?.status === 'active',
          finalIsSubscribed: isSubscribed,
          planType
        })
        
        setSubscription({ 
          is_subscribed: isSubscribed, 
          subscription_data: subscriptionData,
          plan_type: planType
        })

        // Get boost credits
        const { data: boostCreditsData } = await supabase
          .from('user_boost_credits')
          .select('available_en_vedette, available_visibilite')
          .eq('user_id', user.id)
          .single()
        
        setBoostCredits(boostCreditsData || { available_en_vedette: 0, available_visibilite: 0 })

        // Get user's commerces
        const { data: commercesData } = await supabase
          .from('commerces')
          .select('id, name, boost_type, boosted, boosted_at')
          .eq('user_id', user.id)

        const commerceIds = commercesData?.map(c => c.id) || []
        const commerceMap = Object.fromEntries((commercesData || []).map(c => [c.id, c.name]))

        let allContent: UserContent[] = []
        let boostedCount = 0

        if (commerceIds.length > 0) {
          // Get offers with new boost fields
          const { data: offersData } = await supabase
            .from('offers')
            .select('id, title, commerce_id, boost_type, boosted, boosted_at')
            .in('commerce_id', commerceIds)

          // Get events with new boost fields
          const { data: eventsData } = await supabase
            .from('events')
            .select('id, title, commerce_id, boost_type, boosted, boosted_at')
            .in('commerce_id', commerceIds)

          // Process offers
          if (offersData) {
            offersData.forEach(offer => {
              const isBoosted = offer.boosted && !isBoostExpired(offer.boosted_at)
              if (isBoosted) boostedCount++
              allContent.push({
                id: offer.id,
                title: offer.title,
                type: 'offer',
                commerce_name: commerceMap[offer.commerce_id] || t('boostsPage.unknownBusiness', locale),
                boosted: isBoosted,
                boost_type: isBoosted ? offer.boost_type : undefined,
                boosted_at: offer.boosted_at,
                remaining_time: isBoosted ? formatBoostRemainingTime(offer.boosted_at, locale) : undefined
              })
            })
          }

          // Process events
          if (eventsData) {
            eventsData.forEach(event => {
              const isBoosted = event.boosted && !isBoostExpired(event.boosted_at)
              if (isBoosted) boostedCount++
              allContent.push({
                id: event.id,
                title: event.title,
                type: 'event',
                commerce_name: commerceMap[event.commerce_id] || t('boostsPage.unknownBusiness', locale),
                boosted: isBoosted,
                boost_type: isBoosted ? event.boost_type : undefined,
                boosted_at: event.boosted_at,
                remaining_time: isBoosted ? formatBoostRemainingTime(event.boosted_at, locale) : undefined
              })
            })
          }
        }

        // Process commerces
        if (commercesData) {
          commercesData.forEach(commerce => {
            const isBoosted = commerce.boosted && !isBoostExpired(commerce.boosted_at)
            if (isBoosted) boostedCount++
            allContent.push({
              id: commerce.id,
              title: commerce.name,
              type: 'commerce',
              commerce_name: commerce.name,
              boosted: isBoosted,
              boost_type: isBoosted ? commerce.boost_type : undefined,
              boosted_at: commerce.boosted_at,
              remaining_time: isBoosted ? formatBoostRemainingTime(commerce.boosted_at, locale) : undefined
            })
          })
        }

        setUserContent(allContent)
        setStats({
          availableEnVedette: boostCreditsData?.available_en_vedette || 0,
          availableVisibilite: boostCreditsData?.available_visibilite || 0,
          totalContent: allContent.length,
          boostedContent: boostedCount
        })

      } catch (error) {
        console.error('Error loading boost data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const handleApplyBoost = async (contentId: string, contentType: 'offer' | 'event' | 'commerce', boostType: 'en_vedette' | 'visibilite') => {
    const availableCredits = boostType === 'en_vedette' 
      ? boostCredits?.available_en_vedette || 0
      : boostCredits?.available_visibilite || 0
    
    if (availableCredits <= 0) return

    setIsApplyingBoost(contentId)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const result = await applyBoost(contentId, contentType, boostType, user.id)
      
      if (result.success) {
        // Update local state
        setUserContent(prev => prev.map(content => 
          content.id === contentId 
            ? { 
                ...content, 
                boosted: true, 
                boost_type: boostType, 
                boosted_at: new Date().toISOString(),
                remaining_time: formatBoostRemainingTime(new Date().toISOString(), locale)
              }
            : content
        ))
        
        setBoostCredits(prev => prev ? {
          ...prev,
          [boostType === 'en_vedette' ? 'available_en_vedette' : 'available_visibilite']: 
            (boostType === 'en_vedette' ? prev.available_en_vedette : prev.available_visibilite) - 1
        } : null)
        
        setStats(prev => prev ? {
          ...prev,
          boostedContent: prev.boostedContent + 1
        } : null)
        
        // Refresh header counts to update boost credits display
        refreshCounts()
      } else {
        alert(result.error || t('boostsPage.boostApplyError', locale))
      }

    } catch (error) {
      console.error('Error applying boost:', error)
    } finally {
      setIsApplyingBoost(null)
    }
  }

  const handleRemoveBoost = async (contentId: string, contentType: 'offer' | 'event' | 'commerce') => {
    setIsApplyingBoost(contentId)

    try {
      const result = await removeBoost(contentId, contentType)
      
      if (result.success) {
        // Update local state
        setUserContent(prev => prev.map(content => 
          content.id === contentId 
            ? { 
                ...content, 
                boosted: false, 
                boost_type: undefined, 
                boosted_at: null,
                remaining_time: undefined 
              }
            : content
        ))
        setStats(prev => prev ? {
          ...prev,
          boostedContent: prev.boostedContent - 1
        } : null)
      } else {
        alert(result.error || t('boostsPage.boostRemoveError', locale))
      }

    } catch (error) {
      console.error('Error removing boost:', error)
    } finally {
      setIsApplyingBoost(null)
    }
  }

  // Purchase boost à la carte - open Stripe form
  const purchaseBoost = (boostType: 'en_vedette' | 'visibilite') => {
    setShowPurchaseForm(boostType)
  }
  
  // Handle successful purchase
  const handlePurchaseSuccess = () => {
    // Refresh dashboard context to update header credits
    refreshCounts()
    // Also refresh local page data
    window.location.reload()
  }
  
  // Handle subscription purchase
  const purchaseSubscription = async () => {
    try {
      const response = await fetch('/api/stripe/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      const { url } = await response.json()

      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Error creating subscription:', error)
      alert(t('boostsPage.subscriptionError', locale))
    }
  }

  if (isLoading) {
    return (
    
        <div className="p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
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
          <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-2">{t('boostsPage.title', locale)}</h1>
          <p className="text-primary/70 text-sm sm:text-base">{t('boostsPage.subtitle', locale)}</p>
        </div>

        {/* Section 1: Ton Abonnement */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Crown className="h-5 w-5" />
              <span>{t('boostsPage.yourSubscription', locale)}</span>
            </CardTitle>
            <CardDescription>{t('boostsPage.upgradeWithPlus', locale)}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Gosholo Base */}
              <div className={`p-4 sm:p-6 border-2 rounded-lg ${!subscription?.is_subscribed ? 'border-brand-primary bg-brand-primary/5' : 'border-gray-200'}`}>
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center space-x-2">
                    <h3 className="text-lg sm:text-xl font-bold">{t('boostsPage.gosholoBase', locale)}</h3>
                    {!subscription?.is_subscribed && <Badge className="bg-brand-primary">{t('boostsPage.current', locale)}</Badge>}
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-brand-primary">0$</div>
                  <p className="text-sm text-gray-600">{t('boostsPage.freePlan', locale)}</p>
                  <ul className="text-sm space-y-2 text-left">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-brand-primary mr-2 flex-shrink-0" />
                      {t('boostsPage.maxOneContent', locale)}
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-brand-primary mr-2 flex-shrink-0" />
                      {t('boostsPage.realtimeStats', locale)}
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-brand-primary mr-2 flex-shrink-0" />
                      {t('boostsPage.businessOnMap', locale)}
                    </li>
                  </ul>
                </div>
              </div>

              {/* Gosholo PLUS */}
              <div className={`p-4 sm:p-6 border-2 rounded-lg ${subscription?.is_subscribed ? 'border-brand-accent bg-brand-accent/5' : 'border-gray-200'}`}>
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center space-x-2">
                    <Crown className="h-5 w-5 text-brand-accent" />
                    <h3 className="text-lg sm:text-xl font-bold text-brand-accent">{t('boostsPage.gosholoPLUS', locale)}</h3>
                    {subscription?.is_subscribed && <Badge className="bg-brand-accent">{t('boostsPage.current', locale)}</Badge>}
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-brand-accent">8${t('boostsPage.perMonth', locale)}</div>
                  <p className="text-sm text-gray-600">{t('boostsPage.upgradeSpeed', locale)}</p>
                  <ul className="text-sm space-y-2 text-left">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-brand-accent mr-2 flex-shrink-0" />
                      {t('boostsPage.upTo5Content', locale)}
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-brand-accent mr-2 flex-shrink-0" />
                      {t('boostsPage.everythingInBase', locale)}
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-brand-accent mr-2 flex-shrink-0" />
                      {t('boostsPage.monthlyVedette', locale)}
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-brand-accent mr-2 flex-shrink-0" />
                      {t('boostsPage.monthlyVisibility', locale)}
                    </li>
                    <p className="text-sm text-gray-600">{t('boostsPage.boostRenewal', locale)}</p>
                  </ul>
                  {!subscription?.is_subscribed && (
                    <Button 
                      onClick={purchaseSubscription}
                      className="w-full bg-brand-accent hover:bg-brand-accent/90 h-12 sm:h-10"
                    >
{t('boostsPage.upgradeToPLUS', locale)}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Boost Credits Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="p-2 sm:p-3 bg-brand-light/20 rounded-full flex-shrink-0">
                  <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-brand-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-600">{t('boosts.vedette', locale)} {t('boosts.credits', locale)}</p>
                  <p className="text-xl sm:text-2xl font-bold">{boostCredits?.available_en_vedette || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="p-2 sm:p-3 bg-brand-secondary/20 rounded-full flex-shrink-0">
                  <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-brand-secondary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-600">{t('boosts.visibility', locale)} {t('boosts.credits', locale)}</p>
                  <p className="text-xl sm:text-2xl font-bold">{boostCredits?.available_visibilite || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="sm:col-span-2 lg:col-span-1">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="p-2 sm:p-3 bg-brand-light/20 rounded-full flex-shrink-0">
                  <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-brand-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-600">{t('boostsPage.boostedContent', locale)}</p>
                  <p className="text-xl sm:text-2xl font-bold">{stats?.boostedContent || 0}/{stats?.totalContent || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Section 2: Boosts à la Carte */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5" />
              <span>{t('boostsPage.boostsALaCarte', locale)}</span>
            </CardTitle>
            <CardDescription>
            {t('boostsPage.gainVisibilityAttractClients', locale)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Vedette */}
              <div className="p-4 sm:p-6 border border-brand-primary/30 rounded-lg space-y-4 bg-brand-light/20">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-brand-light/20 rounded-full flex-shrink-0">
                      <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-brand-primary" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold">{t('boosts.vedette', locale)}</h3>
                      <Badge className="bg-brand-primary text-white">{t('boostsPage.duration72h', locale)}</Badge>
                    </div>
                  </div>
                  <div className="text-center sm:text-right">
                    <div className="text-xl sm:text-2xl font-bold text-brand-primary">5$</div>
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">{t('boostsPage.attractAllEyes', locale)}</p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-brand-primary mr-2 mt-0.5 flex-shrink-0" />
                      {t('boostsPage.vedetteBadge', locale)}
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-brand-primary mr-2 mt-0.5 flex-shrink-0" />
                      {t('boostsPage.priorityPlacement', locale)}
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-brand-primary mr-2 mt-0.5 flex-shrink-0" />
                      {t('boostsPage.topSearchResults', locale)}
                    </li>
                  </ul>
                  <Button 
                    onClick={() => purchaseBoost('en_vedette')}
                    className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white h-12 sm:h-10"
                  >
                    {t('boostsPage.buy5dollars', locale)}
                  </Button>
                </div>
              </div>
              
              {/* Visibilité */}
              <div className="p-4 sm:p-6 border rounded-lg space-y-4" 
                   style={{ backgroundColor: 'rgb(222,243,248)', borderColor: 'rgb(105,200,221)' }}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-full flex-shrink-0" style={{ backgroundColor: 'rgb(200,235,245)' }}>
                      <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6" style={{ color: 'rgb(70,130,180)' }} />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold" style={{ color: 'rgb(70,130,180)' }}>{t('boosts.visibility', locale)}</h3>
                      <Badge variant="secondary">{t('boostsPage.duration72h', locale)}</Badge>
                    </div>
                  </div>
                  <div className="text-center sm:text-right">
                    <div className="text-xl sm:text-2xl font-bold" style={{ color: 'rgb(70,130,180)' }}>5$</div>
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">{t('boostsPage.shineOnMap', locale)}</p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" style={{ color: 'rgb(70,130,180)' }} />
                      {t('boostsPage.priorityOnMap', locale)}
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" style={{ color: 'rgb(70,130,180)' }} />
                      {t('boostsPage.attractNearbyMembers', locale)}
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" style={{ color: 'rgb(70,130,180)' }} />
                      {t('boostsPage.highlightWhereCounts', locale)}
                    </li>
                  </ul>
                  <Button 
                    onClick={() => purchaseBoost('visibilite')}
                    className="w-full bg-brand-secondary hover:bg-brand-secondary/80 h-12 sm:h-10"
                  >
                    {t('boostsPage.buy5dollars', locale)}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-brand-primary" />
              <span>{t('boostsPage.yourActiveContent', locale)}</span>
            </CardTitle>
            <CardDescription>
              <div className="space-y-1">
                <p>{t('boostsPage.contentReadyToBoost', locale)}</p>
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent>
            {userContent.length === 0 ? (
              <div className="text-center py-8">
                <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">{t('boostsPage.noContent', locale)}</h3>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Offers Section */}
                {userContent.filter(c => c.type === 'offer').length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-brand-primary pb-2 border-b border-gray-200">
                      {locale === 'fr' ? 'Mes Offres' : 'My Offers'}
                    </h3>
                    {userContent.filter(c => c.type === 'offer').map((content) => (
                      <div key={content.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border rounded-lg gap-4 sm:gap-0">
                        <div className="flex items-start sm:items-center space-x-4 flex-1 min-w-0">
                          <Tag className="h-5 w-5 text-blue-500 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <div className="mb-1">
                              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                {t('boostsPage.offer', locale)}
                              </span>
                              <h4 className="font-medium text-sm sm:text-base mt-1">{content.title}</h4>
                            </div>
                            <p className="text-sm text-gray-600">{content.commerce_name}</p>
                            {content.boosted && (
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-2 mt-1">
                                <Badge variant="secondary" className="w-fit">
                                  <><Sparkles className="h-3 w-3 mr-1" />{t('boosts.vedette', locale)} {content.remaining_time}</>
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                          {content.boosted ? (
                            <div className="flex flex-col sm:flex-row gap-2 w-full">
                              <div className="flex items-center justify-center h-10 px-3 text-sm bg-brand-light/20 border border-brand-primary/30 rounded-md flex-1">
                                <Sparkles className="h-3 w-3 mr-1 text-brand-primary" />
                                <span className="text-brand-primary font-medium">{locale === 'fr' ? 'Boost Vedette actif' : 'Featured Boost Active'}</span>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRemoveBoost(content.id, content.type)}
                                disabled={isApplyingBoost === content.id}
                                className="h-10 text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                {locale === 'fr' ? 'Retirer boost Vedette' : 'Remove Featured Boost'}
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleApplyBoost(content.id, content.type, 'en_vedette')}
                              disabled={isApplyingBoost === content.id || (boostCredits?.available_en_vedette || 0) <= 0}
                              className="h-10 w-full bg-brand-light/20 border-brand-primary/30 text-brand-primary hover:bg-brand-light/30 hover:border-brand-primary/50"
                            >
                              <Sparkles className="h-4 w-4 mr-1 text-brand-primary" />
                              {locale === 'fr' ? `Booster Vedette (${boostCredits?.available_en_vedette || 0} crédits)` : `Boost Featured (${boostCredits?.available_en_vedette || 0} credits)`}
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Events Section */}
                {userContent.filter(c => c.type === 'event').length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-brand-primary pb-2 border-b border-gray-200">
                      {locale === 'fr' ? 'Mes Événements' : 'My Events'}
                    </h3>
                    {userContent.filter(c => c.type === 'event').map((content) => (
                      <div key={content.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border rounded-lg gap-4 sm:gap-0">
                        <div className="flex items-start sm:items-center space-x-4 flex-1 min-w-0">
                          <Calendar className="h-5 w-5 text-green-500 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <div className="mb-1">
                              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                {t('boostsPage.event', locale)}
                              </span>
                              <h4 className="font-medium text-sm sm:text-base mt-1">{content.title}</h4>
                            </div>
                            <p className="text-sm text-gray-600">{content.commerce_name}</p>
                            {content.boosted && (
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-2 mt-1">
                                <Badge variant="secondary" className="w-fit">
                                  <><Sparkles className="h-3 w-3 mr-1" />{t('boosts.vedette', locale)} {content.remaining_time}</>
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                          {content.boosted ? (
                            <div className="flex flex-col sm:flex-row gap-2 w-full">
                              <div className="flex items-center justify-center h-10 px-3 text-sm bg-brand-light/20 border border-brand-primary/30 rounded-md flex-1">
                                <Sparkles className="h-3 w-3 mr-1 text-brand-primary" />
                                <span className="text-brand-primary font-medium">{locale === 'fr' ? 'Boost Vedette actif' : 'Featured Boost Active'}</span>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRemoveBoost(content.id, content.type)}
                                disabled={isApplyingBoost === content.id}
                                className="h-10 text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                {locale === 'fr' ? 'Retirer boost Vedette' : 'Remove Featured Boost'}
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleApplyBoost(content.id, content.type, 'en_vedette')}
                              disabled={isApplyingBoost === content.id || (boostCredits?.available_en_vedette || 0) <= 0}
                              className="h-10 w-full bg-brand-light/20 border-brand-primary/30 text-brand-primary hover:bg-brand-light/30 hover:border-brand-primary/50"
                            >
                              <Sparkles className="h-4 w-4 mr-1 text-brand-primary" />
                              {locale === 'fr' ? `Booster Vedette (${boostCredits?.available_en_vedette || 0} crédits)` : `Boost Featured (${boostCredits?.available_en_vedette || 0} credits)`}
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Commerces Section */}
                {userContent.filter(c => c.type === 'commerce').length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-brand-primary pb-2 border-b border-gray-200">
                      {locale === 'fr' ? 'Mes Commerces' : 'My Businesses'}
                    </h3>
                    {userContent.filter(c => c.type === 'commerce').map((content) => (
                      <div key={content.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border rounded-lg gap-4 sm:gap-0">
                        <div className="flex items-start sm:items-center space-x-4 flex-1 min-w-0">
                          <TrendingUp className="h-5 w-5 text-purple-500 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <div className="mb-1">
                              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                {t('boostsPage.business', locale)}
                              </span>
                              <h4 className="font-medium text-sm sm:text-base mt-1">{content.title}</h4>
                            </div>
                            {content.boosted && (
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-2 mt-1">
                                <Badge variant="secondary" className="w-fit">
                                  <><TrendingUp className="h-3 w-3 mr-1" />{t('boosts.visibility', locale)} {content.remaining_time}</>
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                          {content.boosted ? (
                            // Commerce boosted - show status and remove button
                            <div className="flex flex-col sm:flex-row gap-2 w-full">
                              <div className="flex items-center justify-center h-10 px-3 text-sm rounded-md border flex-1" 
                                   style={{ backgroundColor: 'rgb(222,243,248)', borderColor: 'rgb(105,200,221)' }}>
                                <TrendingUp className="h-3 w-3 mr-1" style={{ color: 'rgb(70,130,180)' }} />
                                <span className="font-medium" style={{ color: 'rgb(70,130,180)' }}>{locale === 'fr' ? 'Boost Visibilité actif' : 'Visibility Boost Active'}</span>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRemoveBoost(content.id, content.type)}
                                disabled={isApplyingBoost === content.id}
                                className="h-10 text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                {locale === 'fr' ? 'Retirer Boost Visibilité' : 'Remove Visibility Boost'}
                              </Button>
                            </div>
                          ) : (
                            // Commerce not boosted - visibility boost only
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleApplyBoost(content.id, content.type, 'visibilite')}
                              disabled={isApplyingBoost === content.id || (boostCredits?.available_visibilite || 0) <= 0}
                              className="h-10 w-full border-0"
                              style={{ 
                                backgroundColor: 'rgb(222,243,248)', 
                                borderColor: 'rgb(105,200,221)',
                                color: 'rgb(70,130,180)'
                              }}
                            >
                              <TrendingUp className="h-4 w-4 mr-1" style={{ color: 'rgb(70,130,180)' }} />
                              {locale === 'fr' ? `Booster Visibilité (${boostCredits?.available_visibilite || 0} crédits)` : `Boost Visibility (${boostCredits?.available_visibilite || 0} credits)`}
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Stripe Purchase Modal */}
        {showPurchaseForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="max-w-md w-full">
              <BoostPurchaseForm
                boostType={showPurchaseForm}
                onSuccess={handlePurchaseSuccess}
                onCancel={() => setShowPurchaseForm(null)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
