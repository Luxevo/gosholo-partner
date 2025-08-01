"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
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
  TrendingUp
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface UserSubscription {
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

export default function ProfilPage() {
  const supabase = createClient()
  const [subscription, setSubscription] = useState<UserSubscription | null>(null)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
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
        
        setSubscription(subscriptionData || { plan_type: 'free', status: 'active', starts_at: new Date().toISOString(), ends_at: null })

        // Get boost credits
        const { data: boostCreditsData } = await supabase
          .from('boost_credits')
          .select('credits_available')
          .eq('user_id', user.id)
          .single()

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
          boostCredits: boostCreditsData?.credits_available || 0
        })

      } catch (error) {
        console.error('Error loading user data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUserData()
  }, [])

  const planLimits = {
    free: { content: 1, boosts: 0 },
    pro: { content: 5, boosts: 1 }
  }

  const currentLimit = planLimits[subscription?.plan_type || 'free']
  const usagePercentage = stats ? (stats.totalContent / currentLimit.content) * 100 : 0

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-48 bg-gray-200 rounded"></div>
              <div className="h-48 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2">Mon Profil & Abonnement</h1>
          <p className="text-primary/70">Gérez votre compte et votre abonnement Gosholo Partner</p>
        </div>

        {/* Current Plan Card */}
        <Card className="border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {subscription?.plan_type === 'pro' ? (
                  <Crown className="h-8 w-8 text-yellow-500" />
                ) : (
                  <Star className="h-8 w-8 text-gray-400" />
                )}
                <div>
                  <CardTitle className="text-xl">
                    Plan {subscription?.plan_type === 'pro' ? 'Pro' : 'Gratuit'}
                  </CardTitle>
                  <CardDescription>
                    {subscription?.plan_type === 'pro' 
                      ? 'Accès complet avec boosts' 
                      : 'Accès de base limité'
                    }
                  </CardDescription>
                </div>
              </div>
              <Badge 
                variant={subscription?.plan_type === 'pro' ? "default" : "secondary"}
                className={subscription?.plan_type === 'pro' ? "bg-yellow-500" : ""}
              >
                {subscription?.plan_type === 'pro' ? 'PRO' : 'GRATUIT'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Usage Stats */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Contenu utilisé</span>
                <span className="text-sm text-primary/70">
                  {stats?.totalContent || 0} / {currentLimit.content}
                </span>
              </div>
              <Progress value={Math.min(usagePercentage, 100)} className="h-2" />
              
              {usagePercentage >= 100 && (
                <Alert>
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    Limite atteinte! {subscription?.plan_type === 'free' 
                      ? 'Passez au plan Pro pour créer plus de contenu.' 
                      : 'Supprimez du contenu ou contactez le support.'}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Content Breakdown */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Tag className="h-5 w-5 text-blue-500 mr-2" />
                  <span className="font-semibold text-lg">{stats?.offers || 0}</span>
                </div>
                <p className="text-xs text-primary/70">Offres</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Calendar className="h-5 w-5 text-green-500 mr-2" />
                  <span className="font-semibold text-lg">{stats?.events || 0}</span>
                </div>
                <p className="text-xs text-primary/70">Événements</p>
              </div>
            </div>

            {/* Boost Credits */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-orange-500" />
                  <span className="font-medium">Crédits Boost</span>
                </div>
                <Badge variant="outline">
                  {stats?.boostCredits || 0} disponible{(stats?.boostCredits || 0) > 1 ? 's' : ''}
                </Badge>
              </div>
              {subscription?.plan_type === 'free' && (
                <p className="text-xs text-primary/70 mt-1">
                  Passez au plan Pro pour obtenir 1 crédit boost par mois
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Plan Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Free Plan */}
          <Card className={`relative ${subscription?.plan_type === 'free' ? 'ring-2 ring-primary' : ''}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Star className="h-6 w-6 text-gray-400" />
                  <span>Plan Gratuit</span>
                </CardTitle>
                {subscription?.plan_type === 'free' && (
                  <Badge>Actuel</Badge>
                )}
              </div>
              <CardDescription>Pour commencer</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-bold">Gratuit</div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  1 contenu total (offre OU événement)
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Profil commerce de base
                </li>
                <li className="flex items-center">
                  <XCircle className="h-4 w-4 text-red-500 mr-2" />
                  Pas de crédits boost
                </li>
                <li className="flex items-center">
                  <XCircle className="h-4 w-4 text-red-500 mr-2" />
                  Pas de visibilité premium
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className={`relative ${subscription?.plan_type === 'pro' ? 'ring-2 ring-yellow-500' : ''}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Crown className="h-6 w-6 text-yellow-500" />
                  <span>Plan Pro</span>
                </CardTitle>
                {subscription?.plan_type === 'pro' ? (
                  <Badge className="bg-yellow-500">Actuel</Badge>
                ) : (
                  <Badge variant="outline">Recommandé</Badge>
                )}
              </div>
              <CardDescription>Pour les professionnels</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                              <div className="text-3xl font-bold">$19<span className="text-lg font-normal">/mois</span></div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  5 contenus total (offres + événements)
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  1 crédit boost par mois
                </li>
                <li className="flex items-center">
                  <Sparkles className="h-4 w-4 text-yellow-500 mr-2" />
                  Badge "En Vedette"
                </li>
                <li className="flex items-center">
                  <TrendingUp className="h-4 w-4 text-blue-500 mr-2" />
                  Visibilité premium sur carte
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Support prioritaire
                </li>
              </ul>
              {subscription?.plan_type !== 'pro' && (
                <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-white">
                  <Crown className="h-4 w-4 mr-2" />
                  Passer au Pro
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Account Info */}
        <Card>
          <CardHeader>
            <CardTitle>Informations du compte</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-primary/70">Email</label>
                <p className="font-medium">{user?.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-primary/70">Nom</label>
                <p className="font-medium">
                  {profile?.first_name} {profile?.last_name}
                </p>
              </div>
              {profile?.phone && (
                <div>
                  <label className="text-sm font-medium text-primary/70">Téléphone</label>
                  <p className="font-medium">{profile.phone}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-primary/70">Membre depuis</label>
                <p className="font-medium">
                  {subscription?.starts_at 
                    ? new Date(subscription.starts_at).toLocaleDateString('fr-FR')
                    : 'N/A'
                  }
                </p>
              </div>
            </div>
            <div className="flex space-x-3 pt-4">
              <Button variant="outline">
                Modifier le profil
              </Button>
              <Button variant="outline">
                Gérer l'abonnement
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}