"use client"

import { useState } from "react"
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Crown, Star, Check, X, Zap, Tag, Calendar, ArrowRight } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface Subscription {
  id: string
  user_id: string
  plan_type: 'free' | 'pro'
  status: string
  starts_at: string
  ends_at: string | null
}

interface SubscriptionManagementFlowProps {
  currentSubscription: Subscription
  onCancel: () => void
  onSubscriptionUpdated: () => void
}

const plans = {
  free: {
    name: "Plan Gratuit",
    icon: Star,
    color: "text-gray-600",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200",
    price: "Gratuit",
    features: [
      "1 publication total (offre OU événement)",
      "0 crédit boost par mois",
      "Profil commerce de base",
      "Support communautaire"
    ],
    limitations: [
      "Pas de boosts",
      "Limite de publication stricte",
      "Fonctionnalités limitées"
    ]
  },
  pro: {
    name: "Plan Plus",
    icon: Crown,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    price: "$8/mois",
    features: [
      "10 publications totaux (offres ET événements)",
      "1 crédit boost par mois (auto-renouvelé)",
      "Profil commerce complet",
      "Support prioritaire",
      "Statistiques avancées",
      "Fonctionnalités premium"
    ],
    limitations: []
  }
}

export default function SubscriptionManagementFlow({ 
  currentSubscription, 
  onCancel, 
  onSubscriptionUpdated 
}: SubscriptionManagementFlowProps) {
  const supabase = createClient()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'pro' | null>(null)

  const currentPlan = currentSubscription?.plan_type || 'free'
  const isCurrentPlan = (plan: 'free' | 'pro') => plan === currentPlan

  const handlePlanChange = async (newPlan: 'free' | 'pro') => {
    if (newPlan === currentPlan) {
      toast({
        title: "Information",
        description: "Vous êtes déjà sur ce plan",
      })
      return
    }

    setIsLoading(true)

    try {
      if (newPlan === 'pro') {
        // Upgrade to Pro
        const { error } = await supabase
          .from('subscriptions')
          .update({
            plan_type: 'pro',
            updated_at: new Date().toISOString(),
          })
          .eq('id', currentSubscription.id)

        if (error) {
          console.error('Error upgrading subscription:', error)
          toast({
            title: "Erreur",
            description: "Erreur lors du changement de plan",
            variant: "destructive"
          })
          return
        }

        toast({
          title: "Succès",
          description: "Plan changé vers le plan Plus",
        })

        onSubscriptionUpdated()
      } else {
        // Downgrade to Free
        const { error } = await supabase
          .from('subscriptions')
          .update({
            plan_type: 'free',
            updated_at: new Date().toISOString(),
          })
          .eq('id', currentSubscription.id)

        if (error) {
          console.error('Error downgrading subscription:', error)
          toast({
            title: "Erreur",
            description: "Erreur lors du changement de plan",
            variant: "destructive"
          })
          return
        }

        toast({
          title: "Succès",
          description: "Plan changé vers le plan Gratuit",
        })

        onSubscriptionUpdated()
      }
    } catch (error) {
      console.error('Unexpected error changing plan:', error)
      toast({
        title: "Erreur",
        description: "Erreur inattendue lors du changement de plan",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleManageBilling = async () => {
    setIsLoading(true)

    try {
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to create portal session')
      }

      const { url } = await response.json()
      window.location.href = url // Redirect to Stripe Customer Portal

    } catch (error) {
      console.error('Error creating portal session:', error)
      toast({
        title: "Erreur",
        description: "Impossible d'accéder au portail de facturation",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="max-w-4xl w-full mx-auto border-primary/20 shadow-none">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl text-primary">
          Gérer l'abonnement
        </CardTitle>
        <CardDescription>
          Comparez les plans et modifiez votre abonnement
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Current Plan Status */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-blue-800">Plan actuel</h3>
              <p className="text-sm text-blue-700">
                {plans[currentPlan].name} - {plans[currentPlan].price}
              </p>
            </div>
            <Badge variant="default" className="bg-blue-600">
              Actuel
            </Badge>
          </div>
        </div>

        {/* Plan Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(['free', 'pro'] as const).map((plan) => {
            const planData = plans[plan]
            const Icon = planData.icon
            const isCurrent = isCurrentPlan(plan)
            
            return (
              <Card 
                key={plan}
                className={`relative ${planData.bgColor} ${plan === 'pro' ? 'border-0' : `${planData.borderColor} border-2`} transition-all hover:shadow-md ${
                  isCurrent && plan !== 'pro' ? 'ring-2 ring-primary' : ''
                }`}
              >
                {isCurrent && (
                  <div className="absolute -top-2 -right-2">
                    <Badge className="bg-primary text-white">
                      Actuel
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Icon className={`h-6 w-6 ${planData.color}`} />
                      <CardTitle className={`text-lg ${planData.color}`}>
                        {planData.name}
                      </CardTitle>
                    </div>
                    <div className="text-right">
                      <div className={`text-xl font-bold ${planData.color}`}>
                        {planData.price}
                      </div>
                      {plan === 'pro' && (
                        <div className="text-xs text-orange-500">par mois</div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Features */}
                  <div className="space-y-2">
                    <h4 className={`font-medium ${plan === 'pro' ? 'text-orange-600' : 'text-gray-900'}`}>Fonctionnalités incluses</h4>
                    <ul className="space-y-1">
                      {planData.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm">
                          <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                          <span className={plan === 'pro' ? 'text-orange-600' : ''}>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Limitations */}
                  {planData.limitations.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900">Limitations</h4>
                      <ul className="space-y-1">
                        {planData.limitations.map((limitation, index) => (
                          <li key={index} className="flex items-center text-sm">
                            <X className="h-4 w-4 text-red-500 mr-2 flex-shrink-0" />
                            <span className="text-gray-600">{limitation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Action Button */}
                  <Button
                    onClick={() => handlePlanChange(plan)}
                    disabled={isLoading || isCurrent}
                    className={`w-full ${
                      isCurrent 
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                        : plan === 'pro' 
                          ? 'bg-orange-600 hover:bg-orange-700' 
                          : 'bg-gray-600 hover:bg-gray-700'
                    }`}
                  >
                    {isLoading ? (
                      "Chargement..."
                    ) : isCurrent ? (
                      "Plan actuel"
                    ) : plan === 'pro' ? (
                      <>
                        <Crown className="h-4 w-4 mr-2" />
                        Passer au Plus
                      </>
                    ) : (
                      <>
                        <Star className="h-4 w-4 mr-2" />
                        Passer au Gratuit
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Stripe Billing Management */}
        {currentPlan === 'pro' && (
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <div className="space-y-3">
              <div>
                <h3 className="font-medium text-orange-800">Gestion de la facturation</h3>
                <p className="text-sm text-orange-700">
                  Gérez vos paiements, annulez votre abonnement, ou consultez votre historique de facturation.
                </p>
              </div>
              <Button
                onClick={handleManageBilling}
                disabled={isLoading}
                variant="outline"
                className="w-full sm:w-auto border-orange-300 text-orange-700 hover:bg-orange-100"
              >
                {isLoading ? "Chargement..." : "Gérer la facturation"}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

      </CardContent>
    </Card>
  )
}
