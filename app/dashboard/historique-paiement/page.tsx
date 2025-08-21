"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Receipt, 
  Calendar,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Eye,
  Sparkles,
  ExternalLink,
  Settings
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

interface Transaction {
  id: string
  boost_type: 'en_vedette' | 'visibilite'
  amount_cents: number
  status: string
  card_brand?: string
  card_last_four?: string
  stripe_payment_intent_id?: string
  created_at: string
}

interface SubscriptionTransaction {
  id: string
  plan_type: 'pro' | 'free'
  status: string
  created_at: string
  amount: number
}


const BOOST_LABELS = {
  en_vedette: "En Vedette",
  visibilite: "Visibilité"
}


export default function PaymentHistoryPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [subscriptions, setSubscriptions] = useState<SubscriptionTransaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isLoadingPortal, setIsLoadingPortal] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        setError("Utilisateur non authentifié")
        return
      }

      // Fetch boost transactions
      const { data: boostTransactions, error: boostError } = await supabase
        .from('boost_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (boostError) {
        console.error('Error fetching boost transactions:', boostError)
        setError("Erreur lors du chargement des transactions boost")
        return
      }

      // Fetch subscription transactions
      const { data: subscriptionData, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (subError) {
        console.error('Error fetching subscriptions:', subError)
        // Don't return here as boost transactions are more important
      }

      setTransactions(boostTransactions || [])
      setSubscriptions(subscriptionData?.map(sub => ({
        ...sub,
        amount: 800 // $8 CAD in cents for Pro subscription
      })) || [])

    } catch (error) {
      console.error('Unexpected error:', error)
      setError("Erreur inattendue lors du chargement")
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('fr-CA', {
      style: 'currency',
      currency: 'CAD',
    }).format(cents / 100)
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "d MMMM yyyy 'à' HH:mm", { locale: fr })
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'succeeded':
      case 'active':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Réussi
          </Badge>
        )
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <Clock className="h-3 w-3 mr-1" />
            En cours
          </Badge>
        )
      case 'failed':
      case 'cancelled':
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Échoué
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary">
            {status}
          </Badge>
        )
    }
  }

  const openCustomerPortal = async () => {
    try {
      setIsLoadingPortal(true)
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
      })
      
      if (response.ok) {
        const { url } = await response.json()
        window.open(url, '_blank')
      } else {
        const errorData = await response.json()
        console.error('Failed to create portal session:', errorData)
        alert(`Erreur: ${errorData.error}${errorData.details ? '\n' + errorData.details : ''}`)
      }
    } catch (error) {
      console.error('Error opening customer portal:', error)
    } finally {
      setIsLoadingPortal(false)
    }
  }

  const openReceipt = async (paymentIntentId: string) => {
    try {
      const response = await fetch(`/api/stripe/get-receipt?payment_intent_id=${paymentIntentId}`)
      
      if (response.ok) {
        const data = await response.json()
        
        if (data.receipt_url) {
          // Open Stripe receipt
          window.open(data.receipt_url, '_blank')
        } else if (data.transaction_details) {
          // Show transaction details in a new window/tab
          const details = data.transaction_details
          const receiptContent = `
            <html>
              <head>
                <title>Détails de Transaction - Gosholo Partner</title>
                <style>
                  body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
                  .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #016167; padding-bottom: 20px; }
                  .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee; }
                  .label { font-weight: bold; color: #016167; }
                  .amount { font-size: 24px; font-weight: bold; color: #016167; text-align: center; margin: 20px 0; }
                  .status { display: inline-block; padding: 4px 12px; border-radius: 4px; background: #e6f7e6; color: #2d5a2d; }
                </style>
              </head>
              <body>
                <div class="header">
                  <h1>Gosholo Partner</h1>
                  <h2>Détails de Transaction</h2>
                </div>
                <div class="amount">${new Intl.NumberFormat('fr-CA', {
                  style: 'currency',
                  currency: details.currency?.toUpperCase() || 'CAD',
                }).format(details.amount / 100)}</div>
                <div class="detail-row">
                  <span class="label">ID de Transaction:</span>
                  <span>${details.payment_intent_id}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Date:</span>
                  <span>${new Date(details.created * 1000).toLocaleDateString('fr-FR', { 
                    year: 'numeric', month: 'long', day: 'numeric', 
                    hour: '2-digit', minute: '2-digit' 
                  })}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Statut:</span>
                  <span class="status">${details.status === 'succeeded' ? 'Réussi' : details.status}</span>
                </div>
                ${details.card_brand ? `
                <div class="detail-row">
                  <span class="label">Carte:</span>
                  <span>${details.card_brand.toUpperCase()} •••• ${details.card_last4}</span>
                </div>
                ` : ''}
                <div class="detail-row">
                  <span class="label">Monnaie:</span>
                  <span>${details.currency.toUpperCase()}</span>
                </div>
                <div style="margin-top: 40px; text-align: center; color: #666; font-size: 12px;">
                  Généré le ${new Date().toLocaleDateString('fr-FR')}
                </div>
              </body>
            </html>
          `
          const newWindow = window.open('', '_blank')
          if (newWindow) {
            newWindow.document.write(receiptContent)
            newWindow.document.close()
          }
        } else {
          alert('Reçu non disponible pour cette transaction')
        }
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Reçu non disponible')
      }
    } catch (error) {
      console.error('Error fetching receipt:', error)
      alert('Erreur lors de la récupération du reçu')
    }
  }

  const allTransactions = [
    ...transactions.map(t => ({ ...t, type: 'boost' as const })),
    ...subscriptions.map(s => ({ ...s, type: 'subscription' as const }))
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-primary">Historique de paiement</h1>
            <p className="text-muted-foreground text-sm lg:text-base">
              Consultez vos achats de boosts et abonnements
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Button
              onClick={openCustomerPortal}
              disabled={isLoadingPortal}
              variant="outline"
              size="sm"
            >
              <Settings className="h-4 w-4 mr-2" />
              {isLoadingPortal ? 'Chargement...' : 'Gérer mes cartes'}
            </Button>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Receipt className="h-4 w-4" />
              <span>{allTransactions.length} transaction{allTransactions.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center space-y-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto"></div>
                <p className="text-muted-foreground">Chargement des transactions...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Empty State */}
        {!isLoading && !error && allTransactions.length === 0 && (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center space-y-4">
                <Receipt className="h-12 w-12 text-muted-foreground mx-auto" />
                <div>
                  <h3 className="text-lg font-semibold">Aucune transaction</h3>
                  <p className="text-muted-foreground">
                    Vos achats de boosts et abonnements apparaîtront ici
                  </p>
                </div>
                <Button asChild>
                  <a href="/dashboard/boosts">
                    <Zap className="h-4 w-4 mr-2" />
                    Acheter des boosts
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Transactions List */}
        {!isLoading && !error && allTransactions.length > 0 && (
          <div className="space-y-4">
            {allTransactions.map((transaction) => {
              const isBoost = transaction.type === 'boost'
              const boostTransaction = isBoost ? transaction as Transaction : null
              const subscriptionTransaction = !isBoost ? transaction as SubscriptionTransaction : null

              return (
                <Card key={`${transaction.type}-${transaction.id}`} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-full ${isBoost ? 'bg-blue-100' : 'bg-yellow-100'}`}>
                          {isBoost ? (
                            boostTransaction!.boost_type === 'en_vedette' ? (
                              <Sparkles className="h-6 w-6 text-blue-600" />
                            ) : (
                              <Eye className="h-6 w-6 text-blue-600" />
                            )
                          ) : (
                            <CreditCard className="h-6 w-6 text-yellow-600" />
                          )}
                        </div>
                        
                        <div className="space-y-1">
                          <h3 className="font-semibold text-lg">
                            {isBoost 
                              ? `Boost ${BOOST_LABELS[boostTransaction!.boost_type]}`
                              : `Abonnement ${subscriptionTransaction!.plan_type.toUpperCase()}`
                            }
                          </h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            {formatDate(transaction.created_at)}
                          </p>
                          {isBoost && boostTransaction!.card_brand && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <CreditCard className="h-3 w-3" />
                              {boostTransaction!.card_brand.toUpperCase()} •••• {boostTransaction!.card_last_four}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="text-right space-y-2">
                        <div className="text-xl font-bold text-brand-primary">
                          {formatCurrency(
                            isBoost 
                              ? boostTransaction!.amount_cents 
                              : subscriptionTransaction!.amount
                          )}
                        </div>
                        <div className="flex items-center justify-end gap-2">
                          {getStatusBadge(transaction.status)}
                          {isBoost && boostTransaction!.stripe_payment_intent_id && (
                            <Button
                              onClick={() => openReceipt(boostTransaction!.stripe_payment_intent_id!)}
                              variant="ghost"
                              size="sm"
                            >
                              <Receipt className="h-3 w-3 mr-1" />
                              Reçu
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Transaction ID */}
                    {isBoost && boostTransaction!.stripe_payment_intent_id && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-xs text-muted-foreground">
                          ID de transaction: {boostTransaction!.stripe_payment_intent_id}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Summary Card */}
        {!isLoading && !error && allTransactions.length > 0 && (
          <Card className="bg-gradient-to-r from-brand-primary/5 to-brand-accent/5 sticky bottom-4 z-10 shadow-lg border-2">
            <CardHeader>
              <CardTitle className="text-lg">Résumé</CardTitle>
              <CardDescription>Statistiques de vos paiements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-brand-primary">
                    {transactions.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Boosts achetés</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-brand-accent">
                    {subscriptions.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Abonnements</div>
                </div>
                <div className="text-center col-span-2 md:col-span-1">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(
                      transactions.reduce((sum, t) => sum + t.amount_cents, 0) +
                      subscriptions.reduce((sum, s) => sum + s.amount, 0)
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">Total dépensé</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
  )
}