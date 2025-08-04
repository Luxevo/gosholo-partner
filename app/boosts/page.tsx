"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
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
  AlertCircle,
  ArrowRight
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface UserContent {
  id: string
  title: string
  type: 'offer' | 'event'
  commerce_name: string
  has_boost: boolean
  boost_type?: 'en_vedette' | 'visibilite'
}

interface UserStats {
  boostCredits: number
  totalContent: number
  boostedContent: number
}

export default function BoostsPage() {
  const supabase = createClient()
  const [userContent, setUserContent] = useState<UserContent[]>([])
  const [stats, setStats] = useState<UserStats | null>(null)
  const [subscription, setSubscription] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isApplyingBoost, setIsApplyingBoost] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) {
          console.error('Authentication error:', userError)
          return
        }

        // Get user subscription
        const { data: subscriptionData } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1)
          .single()
        
        setSubscription(subscriptionData || { plan_type: 'free' })

        // Get boost credits
        const { data: boostCreditsData } = await supabase
          .from('boost_credits')
          .select('credits_available')
          .eq('user_id', user.id)
          .single()

        // Get user's commerces
        const { data: commercesData } = await supabase
          .from('commerces')
          .select('id, name')
          .eq('user_id', user.id)

        const commerceIds = commercesData?.map(c => c.id) || []
        const commerceMap = Object.fromEntries((commercesData || []).map(c => [c.id, c.name]))

        let allContent: UserContent[] = []
        let boostedCount = 0

        if (commerceIds.length > 0) {
          // Get offers
          const { data: offersData } = await supabase
            .from('offers')
            .select('id, title, commerce_id, boost_type')
            .in('commerce_id', commerceIds)

          // Get events
          const { data: eventsData } = await supabase
            .from('events')
            .select('id, title, commerce_id, boost_type')
            .in('commerce_id', commerceIds)

          // Process offers
          if (offersData) {
            offersData.forEach(offer => {
              const hasBoost = !!offer.boost_type
              if (hasBoost) boostedCount++
              allContent.push({
                id: offer.id,
                title: offer.title,
                type: 'offer',
                commerce_name: commerceMap[offer.commerce_id] || 'Commerce inconnu',
                has_boost: hasBoost,
                boost_type: offer.boost_type
              })
            })
          }

          // Process events
          if (eventsData) {
            eventsData.forEach(event => {
              const hasBoost = !!event.boost_type
              if (hasBoost) boostedCount++
              allContent.push({
                id: event.id,
                title: event.title,
                type: 'event',
                commerce_name: commerceMap[event.commerce_id] || 'Commerce inconnu',
                has_boost: hasBoost,
                boost_type: event.boost_type
              })
            })
          }
        }

        setUserContent(allContent)
        setStats({
          boostCredits: boostCreditsData?.credits_available || 0,
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

  const applyBoost = async (contentId: string, contentType: 'offer' | 'event', boostType: 'en_vedette' | 'visibilite') => {
    if (!stats || stats.boostCredits <= 0) return

    setIsApplyingBoost(contentId)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Update content with boost
      const { error: updateError } = await supabase
        .from(contentType === 'offer' ? 'offers' : 'events')
        .update({ boost_type: boostType })
        .eq('id', contentId)

      if (updateError) {
        console.error('Error applying boost:', updateError)
        return
      }

      // Decrement boost credits
      const { error: creditError } = await supabase
        .from('boost_credits')
        .update({ credits_available: stats.boostCredits - 1 })
        .eq('user_id', user.id)

      if (creditError) {
        console.error('Error updating credits:', creditError)
        return
      }

      // Update local state
      setUserContent(prev => prev.map(content => 
        content.id === contentId 
          ? { ...content, has_boost: true, boost_type: boostType }
          : content
      ))
      setStats(prev => prev ? {
        ...prev,
        boostCredits: prev.boostCredits - 1,
        boostedContent: prev.boostedContent + 1
      } : null)

    } catch (error) {
      console.error('Error applying boost:', error)
    } finally {
      setIsApplyingBoost(null)
    }
  }

  const removeBoost = async (contentId: string, contentType: 'offer' | 'event') => {
    setIsApplyingBoost(contentId)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Remove boost from content
      const { error: updateError } = await supabase
        .from(contentType === 'offer' ? 'offers' : 'events')
        .update({ boost_type: null })
        .eq('id', contentId)

      if (updateError) {
        console.error('Error removing boost:', updateError)
        return
      }

      // Update local state
      setUserContent(prev => prev.map(content => 
        content.id === contentId 
          ? { ...content, has_boost: false, boost_type: undefined }
          : content
      ))
      setStats(prev => prev ? {
        ...prev,
        boostedContent: prev.boostedContent - 1
      } : null)

    } catch (error) {
      console.error('Error removing boost:', error)
    } finally {
      setIsApplyingBoost(null)
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
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
      </DashboardLayout>
    )
  }

  return (
    <div>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2">Boosts & Visibilité</h1>
          <p className="text-primary/70">Améliorez la visibilité de vos offres et événements</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Crédits Boost</CardTitle>
              <Zap className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.boostCredits || 0}</div>
              <p className="text-xs text-muted-foreground">
                {subscription?.plan_type === 'free' 
                  ? 'Passez au plan Pro pour obtenir des crédits'
                  : 'Crédits disponibles ce mois'
                }
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contenu Boosté</CardTitle>
              <Sparkles className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.boostedContent || 0}</div>
              <p className="text-xs text-muted-foreground">
                sur {stats?.totalContent || 0} total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Plan Actuel</CardTitle>
              {subscription?.plan_type === 'pro' ? (
                <Crown className="h-4 w-4 text-yellow-500" />
              ) : (
                <Star className="h-4 w-4 text-gray-400" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {subscription?.plan_type === 'pro' ? 'Pro' : 'Gratuit'}
              </div>
              <p className="text-xs text-muted-foreground">
                {subscription?.plan_type === 'pro' 
                  ? '1 crédit boost par mois'
                  : 'Aucun crédit boost'
                }
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Boost Types Explanation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-yellow-500" />
                <span>En Vedette</span>
              </CardTitle>
              <CardDescription>
                Mettez votre contenu en avant avec un badge spécial
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Badge "En Vedette" visible
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Apparition prioritaire dans les recherches
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Mise en avant sur la carte
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                <span>Visibilité Premium</span>
              </CardTitle>
              <CardDescription>
                Augmentez la portée de votre contenu
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Position privilégiée sur la carte
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Notification aux utilisateurs proches
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Statistiques de visibilité avancées
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Content List */}
        <Card>
          <CardHeader>
            <CardTitle>Votre Contenu</CardTitle>
            <CardDescription>
              Appliquez des boosts à vos offres et événements
            </CardDescription>
          </CardHeader>
          <CardContent>
            {userContent.length === 0 ? (
              <div className="text-center py-8">
                <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun contenu</h3>
                <p className="text-gray-600 mb-4">Créez des offres ou événements pour utiliser les boosts</p>
                <Button variant="outline">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Aller aux commerces
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {userContent.map((content) => (
                  <div key={content.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      {content.type === 'offer' ? (
                        <Tag className="h-5 w-5 text-blue-500" />
                      ) : (
                        <Calendar className="h-5 w-5 text-green-500" />
                      )}
                      <div>
                        <h4 className="font-medium">{content.title}</h4>
                        <p className="text-sm text-gray-600">{content.commerce_name}</p>
                        {content.has_boost && (
                          <Badge variant="secondary" className="mt-1">
                            {content.boost_type === 'en_vedette' ? (
                              <><Sparkles className="h-3 w-3 mr-1" />En Vedette</>
                            ) : (
                              <><TrendingUp className="h-3 w-3 mr-1" />Visibilité</>
                            )}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {content.has_boost ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeBoost(content.id, content.type)}
                          disabled={isApplyingBoost === content.id}
                        >
                          Retirer le boost
                        </Button>
                      ) : stats && stats.boostCredits > 0 ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => applyBoost(content.id, content.type, 'en_vedette')}
                            disabled={isApplyingBoost === content.id}
                          >
                            <Sparkles className="h-4 w-4 mr-1" />
                            En Vedette
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => applyBoost(content.id, content.type, 'visibilite')}
                            disabled={isApplyingBoost === content.id}
                          >
                            <TrendingUp className="h-4 w-4 mr-1" />
                            Visibilité
                          </Button>
                        </>
                      ) : (
                        <Button variant="outline" size="sm" disabled>
                          Aucun crédit
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upgrade Alert for Free Users */}
        {subscription?.plan_type === 'free' && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>Vous êtes sur le plan gratuit. Passez au plan Pro pour obtenir 1 crédit boost par mois.</span>
              <Button size="sm" className="bg-yellow-500 hover:bg-yellow-600">
                <Crown className="h-4 w-4 mr-2" />
                Passer au Pro
              </Button>
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  )
}
