"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  CreditCard, 
  Crown, 
  Star, 
  Calendar, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  ArrowRight,
  Download,
  Eye,
  Sparkles
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Transaction {
  id: string
  amount: number
  currency: string
  description: string
  status: 'completed' | 'pending' | 'failed'
  created_at: string
  type: 'subscription' | 'boost'
}

interface PaymentMethod {
  id: string
  type: 'card'
  last4: string
  brand: string
  exp_month: number
  exp_year: number
  is_default: boolean
}

export default function PaiementsPage() {
  const supabase = createClient()
  const [subscription, setSubscription] = useState<any>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUpgrading, setIsUpgrading] = useState(false)
  const [isCanceling, setIsCanceling] = useState(false)

  useEffect(() => {
    const loadPaymentData = async () => {
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
        
        setSubscription(subscriptionData || { plan_type: 'free', status: 'active' })

        // Mock transactions data (replace with actual Supabase query when transactions table exists)
        const mockTransactions: Transaction[] = subscriptionData?.plan_type === 'pro' ? [
          {
            id: '1',
            amount: 19.00,
            currency: 'USD',
            description: 'Abonnement Pro - Janvier 2025',
            status: 'completed',
            created_at: '2025-01-01T00:00:00Z',
            type: 'subscription'
          },
          {
            id: '2',
            amount: 19.00,
            currency: 'USD',
            description: 'Abonnement Pro - Décembre 2024',
            status: 'completed',
            created_at: '2024-12-01T00:00:00Z',
            type: 'subscription'
          }
        ] : []
        setTransactions(mockTransactions)

        // Mock payment methods (replace with actual payment provider integration)
        const mockPaymentMethods: PaymentMethod[] = subscriptionData?.plan_type === 'pro' ? [
          {
            id: '1',
            type: 'card',
            last4: '4242',
            brand: 'visa',
            exp_month: 12,
            exp_year: 2028,
            is_default: true
          }
        ] : []
        setPaymentMethods(mockPaymentMethods)

      } catch (error) {
        console.error('Error loading payment data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadPaymentData()
  }, [])

  const handleUpgrade = async () => {
    setIsUpgrading(true)
    // Here you would integrate with your payment provider (Stripe, etc.)
    // For now, we'll simulate the upgrade process
    setTimeout(() => {
      alert('Redirection vers le portail de paiement...')
      setIsUpgrading(false)
    }, 1000)
  }

  const handleCancelSubscription = async () => {
    setIsCanceling(true)
    // Here you would cancel the subscription via your payment provider
    setTimeout(() => {
      alert('Demande d\'annulation envoyée. Votre abonnement restera actif jusqu\'\u00e0 la fin de la période de facturation.')
      setIsCanceling(false)
    }, 1000)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600'
      case 'pending': return 'text-yellow-600'
      case 'failed': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'pending': return <AlertCircle className="h-4 w-4 text-yellow-600" />
      case 'failed': return <XCircle className="h-4 w-4 text-red-600" />
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />
    }
  }

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
          <h1 className="text-3xl font-bold text-primary mb-2">Paiements & Facturation</h1>
          <p className="text-primary/70">Gérez votre abonnement et consultez votre historique de paiements</p>
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
                      ? 'Abonnement mensuel actif' 
                      : 'Plan gratuit avec limitations'
                    }
                  </CardDescription>
                </div>
              </div>
              <Badge 
                variant={subscription?.plan_type === 'pro' ? "default" : "secondary"}
                className={subscription?.plan_type === 'pro' ? "bg-yellow-500" : ""}
              >
                {subscription?.plan_type === 'pro' ? 'ACTIF' : 'GRATUIT'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {subscription?.plan_type === 'pro' ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Prix mensuel</span>
                  <span className="text-lg font-bold">$19/mois</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Prochaine facturation</span>
                  <span className="text-sm">
                    {subscription?.ends_at 
                      ? new Date(subscription.ends_at).toLocaleDateString('fr-FR')
                      : 'N/A'
                    }
                  </span>
                </div>
                <div className="flex space-x-3 pt-2">
                  <Button variant="outline" size="sm">
                    Modifier le plan
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleCancelSubscription}
                    disabled={isCanceling}
                  >
                    {isCanceling ? 'Annulation...' : 'Annuler l\'abonnement'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center py-4">
                  <p className="text-gray-600 mb-4">Passez au plan Pro pour débloquer toutes les fonctionnalités</p>
                  <Button 
                    onClick={handleUpgrade}
                    disabled={isUpgrading}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white"
                  >
                    {isUpgrading ? 'Traitement...' : (
                      <>
                        <Crown className="h-4 w-4 mr-2" />
                        Passer au Pro - $19/mois
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Ce que vous obtiendrez :</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li className="flex items-center">
                      <Sparkles className="h-4 w-4 text-yellow-500 mr-2" />
                      5 contenus (offres + événements)
                    </li>
                    <li className="flex items-center">
                      <Sparkles className="h-4 w-4 text-yellow-500 mr-2" />
                      1 crédit boost par mois
                    </li>
                    <li className="flex items-center">
                      <Sparkles className="h-4 w-4 text-yellow-500 mr-2" />
                      Visibilité premium sur la carte
                    </li>
                    <li className="flex items-center">
                      <Sparkles className="h-4 w-4 text-yellow-500 mr-2" />
                      Support prioritaire
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Methods & Transaction History */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payment Methods */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>Méthodes de paiement</span>
              </CardTitle>
              <CardDescription>
                Gérez vos moyens de paiement
              </CardDescription>
            </CardHeader>
            <CardContent>
              {paymentMethods.length === 0 ? (
                <div className="text-center py-6">
                  <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">
                    {subscription?.plan_type === 'free' 
                      ? 'Aucune méthode de paiement requise pour le plan gratuit'
                      : 'Aucune méthode de paiement enregistrée'
                    }
                  </p>
                  {subscription?.plan_type === 'pro' && (
                    <Button variant="outline" size="sm">
                      Ajouter une carte
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <div key={method.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <CreditCard className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium capitalize">
                            {method.brand} **** {method.last4}
                          </p>
                          <p className="text-sm text-gray-600">
                            Expire {method.exp_month.toString().padStart(2, '0')}/{method.exp_year}
                          </p>
                        </div>
                      </div>
                      {method.is_default && (
                        <Badge variant="secondary">Par défaut</Badge>
                      )}
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="w-full mt-3">
                    Ajouter une carte
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Transaction History */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <span>Historique des paiements</span>
                  </CardTitle>
                  <CardDescription>
                    Vos dernières transactions
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exporter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-center py-6">
                  <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    {subscription?.plan_type === 'free' 
                      ? 'Aucune transaction avec le plan gratuit'
                      : 'Aucune transaction pour le moment'
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(transaction.status)}
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(transaction.created_at).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {transaction.amount.toFixed(2)} {transaction.currency}
                        </p>
                        <p className={`text-sm capitalize ${getStatusColor(transaction.status)}`}>
                          {transaction.status === 'completed' ? 'Payé' : 
                           transaction.status === 'pending' ? 'En attente' : 'Échoué'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Billing Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informations de facturation</CardTitle>
            <CardDescription>
              Adresse utilisée pour la facturation
            </CardDescription>
          </CardHeader>
          <CardContent>
            {subscription?.plan_type === 'free' ? (
              <div className="text-center py-6">
                <p className="text-gray-600">Aucune information de facturation requise pour le plan gratuit</p>
              </div>
            ) : (
              <div className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Les informations de facturation seront configurées lors de votre premier paiement.
                  </AlertDescription>
                </Alert>
                <Button variant="outline">
                  Configurer l'adresse de facturation
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
