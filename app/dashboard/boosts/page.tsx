"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
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
  ArrowRight,
  CreditCard,
  X,
  Check
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { applyBoost, removeBoost, formatBoostRemainingTime, isBoostExpired } from "@/lib/boost-utils"
import { useBoostExpiry } from "@/hooks/use-boost-expiry"
import BoostPurchaseForm from "@/components/boost-purchase-form"
import { getStripe } from "@/lib/stripe"

interface UserContent {
  id: string
  title: string
  type: 'offer' | 'event'
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
  
  // Code promo states
  const [promoCode, setPromoCode] = useState("")
  const [isValidatingCode, setIsValidatingCode] = useState(false)
  const [codeValidationResult, setCodeValidationResult] = useState<{
    isValid: boolean
    message: string
    discount?: number
  } | null>(null)
  const [showStripeForm, setShowStripeForm] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) {
          console.error('Authentication error:', userError)
          return
        }

        // Get user profile to check subscription status
        const { data: profileData } = await supabase
          .from('profiles')
          .select('is_subscribed')
          .eq('id', user.id)
          .single()
        
        setSubscription(profileData || { is_subscribed: false })

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
          .select('id, name')
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
                commerce_name: commerceMap[offer.commerce_id] || 'Commerce inconnu',
                boosted: isBoosted,
                boost_type: isBoosted ? offer.boost_type : undefined,
                boosted_at: offer.boosted_at,
                remaining_time: isBoosted ? formatBoostRemainingTime(offer.boosted_at) : undefined
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
                commerce_name: commerceMap[event.commerce_id] || 'Commerce inconnu',
                boosted: isBoosted,
                boost_type: isBoosted ? event.boost_type : undefined,
                boosted_at: event.boosted_at,
                remaining_time: isBoosted ? formatBoostRemainingTime(event.boosted_at) : undefined
              })
            })
          }
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

  const handleApplyBoost = async (contentId: string, contentType: 'offer' | 'event', boostType: 'en_vedette' | 'visibilite') => {
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
                remaining_time: '72h restantes'
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
      } else {
        alert(result.error || 'Erreur lors de l\'application du boost')
      }

    } catch (error) {
      console.error('Error applying boost:', error)
    } finally {
      setIsApplyingBoost(null)
    }
  }

  const handleRemoveBoost = async (contentId: string, contentType: 'offer' | 'event') => {
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
        alert(result.error || 'Erreur lors de la suppression du boost')
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
    // Refresh the page data to get updated boost credits
    window.location.reload()
  }
  
  // Handle subscription purchase
  const purchaseSubscription = async () => {
    try {
      const response = await fetch('/api/stripe/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          promoCode: codeValidationResult?.isValid ? promoCode : undefined 
        }),
      })
      
      const { url } = await response.json()
      
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Error creating subscription:', error)
      alert('Erreur lors de la création de l\'abonnement')
    }
  }

  // Validate promo code
  const validatePromoCode = async () => {
    if (!promoCode.trim()) return
    
    setIsValidatingCode(true)
    setCodeValidationResult(null)
    
    try {
      // Simulate API call to validate promo code
      // In real implementation, this would call your backend
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock validation logic - replace with actual API call
      const isValid = promoCode.toLowerCase() === 'jmq2025'
      
      if (isValid) {
        setCodeValidationResult({
          isValid: true,
          message: "Code promo valide ! Vous obtenez 1 mois gratuit.",
          discount: 0
        })
        setShowStripeForm(true)
      } else {
        setCodeValidationResult({
          isValid: false,
          message: "Code promo invalide. Veuillez vérifier et réessayer."
        })
      }
    } catch (error) {
      setCodeValidationResult({
        isValid: false,
        message: "Erreur lors de la validation. Veuillez réessayer."
      })
    } finally {
      setIsValidatingCode(false)
    }
  }

  // Handle Stripe payment for subscription
  const handleStripePayment = async () => {
    await purchaseSubscription()
  }

  // Clear promo code validation
  const clearPromoCode = () => {
    setPromoCode("")
    setCodeValidationResult(null)
    setShowStripeForm(false)
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
          <h1 className="text-3xl font-bold text-primary mb-2">Boosts & Abonnements</h1>
          <p className="text-primary/70">Améliorez la visibilité de vos offres et événements</p>
        </div>

        {/* Boost Credits Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Sparkles className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Crédits En Vedette</p>
                  <p className="text-2xl font-bold">{boostCredits?.available_en_vedette || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Crédits Visibilité</p>
                  <p className="text-2xl font-bold">{boostCredits?.available_visibilite || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <Zap className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Contenu Boosté</p>
                  <p className="text-2xl font-bold">{stats?.boostedContent || 0}/{stats?.totalContent || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* À la Carte Boost Purchase */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5" />
              <span>Acheter des Boosts à la Carte</span>
            </CardTitle>
            <CardDescription>
              Boostez votre contenu pour 72 heures - 5€ par boost
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="h-5 w-5 text-yellow-500" />
                    <span className="font-medium">Boost En Vedette</span>
                  </div>
                  <Badge variant="secondary">72h</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-4">Apparition prioritaire dans les recherches avec badge spécial</p>
                <Button 
                  onClick={() => purchaseBoost('en_vedette')}
                  className="w-full bg-yellow-500 hover:bg-yellow-600"
                >
                  Acheter 5€
                </Button>
              </div>
              
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-blue-500" />
                    <span className="font-medium">Boost Visibilité</span>
                  </div>
                  <Badge variant="secondary">72h</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-4">Commerce plus visible sur la carte Mapbox</p>
                <Button 
                  onClick={() => purchaseBoost('visibilite')}
                  className="w-full bg-blue-500 hover:bg-blue-600"
                >
                  Acheter 5€
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

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
                        {content.boosted && (
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="secondary">
                              {content.boost_type === 'en_vedette' ? (
                                <><Sparkles className="h-3 w-3 mr-1" />En Vedette</>
                              ) : (
                                <><TrendingUp className="h-3 w-3 mr-1" />Visibilité</>
                              )}
                            </Badge>
                            {content.remaining_time && (
                              <span className="text-xs text-gray-500">{content.remaining_time}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {content.boosted ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveBoost(content.id, content.type)}
                          disabled={isApplyingBoost === content.id}
                        >
                          Retirer le boost
                        </Button>
                      ) : (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApplyBoost(content.id, content.type, 'en_vedette')}
                            disabled={isApplyingBoost === content.id || (boostCredits?.available_en_vedette || 0) <= 0}
                          >
                            <Sparkles className="h-4 w-4 mr-1" />
                            En Vedette ({boostCredits?.available_en_vedette || 0})
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApplyBoost(content.id, content.type, 'visibilite')}
                            disabled={isApplyingBoost === content.id || (boostCredits?.available_visibilite || 0) <= 0}
                          >
                            <TrendingUp className="h-4 w-4 mr-1" />
                            Visibilité ({boostCredits?.available_visibilite || 0})
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Subscription Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Crown className="h-5 w-5" />
              <span>Abonnement Pro - 8€/mois</span>
            </CardTitle>
            <CardDescription>
              Recevez 1 boost En Vedette et 1 boost Visibilité chaque mois
            </CardDescription>
          </CardHeader>
          <CardContent>
            {subscription?.is_subscribed ? (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Vous êtes abonné au plan Pro ! Vos boosts mensuels sont automatiquement ajoutés le 1er de chaque mois.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="flex items-center justify-between">
                    <span>Abonnez-vous pour recevoir des boosts chaque mois + accès aux fonctionnalités Pro</span>
                    <Button 
                      size="sm" 
                      className="bg-yellow-500 hover:bg-yellow-600"
                      onClick={purchaseSubscription}
                    >
                      <Crown className="h-4 w-4 mr-2" />
                      S'abonner 8€/mois
                    </Button>
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Code Promo Section */}
        <Card>
          <CardHeader>
            <CardTitle>Code Promo</CardTitle>
            <CardDescription>
              Vous avez un code promo ?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Code Input */}
              <div className="flex space-x-2">
                <Input
                  type="text"
                  placeholder="Entrez votre code promo"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="flex-1"
                  disabled={isValidatingCode}
                />
                <Button 
                  onClick={validatePromoCode}
                  disabled={!promoCode.trim() || isValidatingCode}
                >
                  {isValidatingCode ? "Validation..." : "Appliquer"}
                </Button>
                {promoCode && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={clearPromoCode}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Validation Result */}
              {codeValidationResult && (
                <Alert className={codeValidationResult.isValid ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                  {codeValidationResult.isValid ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  <AlertDescription className={codeValidationResult.isValid ? "text-green-800" : "text-red-800"}>
                    {codeValidationResult.message}
                  </AlertDescription>
                </Alert>
              )}

              {/* Stripe Payment Form */}
              {showStripeForm && (
                <Card className="border-green-200 bg-green-50">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-green-800">
                      <CreditCard className="h-5 w-5" />
                      <span>Paiement Sécurisé</span>
                    </CardTitle>
                                         <CardDescription className="text-green-700">
                       1 mois gratuit grâce à votre code promo !
                     </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-white p-4 rounded-lg border">
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Numéro de carte
                          </label>
                          <Input 
                            type="text" 
                            placeholder="1234 5678 9012 3456"
                            className="font-mono"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Date d'expiration
                            </label>
                            <Input 
                              type="text" 
                              placeholder="MM/AA"
                              className="font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              CVC
                            </label>
                            <Input 
                              type="text" 
                              placeholder="123"
                              className="font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                                         <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                       <div className="flex items-center space-x-2 text-sm text-blue-800">
                         <Check className="h-4 w-4" />
                         <span>1 mois gratuit</span>
                       </div>
                       <div className="flex items-center space-x-2 text-sm text-blue-800 mt-1">
                         <Check className="h-4 w-4" />
                         <span>Puis tarif normal</span>
                       </div>
                     </div>

                    <div className="flex space-x-2">
                      <Button 
                        onClick={handleStripePayment}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        Payer en toute sécurité
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => setShowStripeForm(false)}
                      >
                        Annuler
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
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
