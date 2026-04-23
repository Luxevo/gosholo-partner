"use client"

import React, { useState, useEffect } from "react"
import { useLanguage } from "@/contexts/language-context"
import { t } from "@/lib/category-translations"
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Crown,
  CheckCircle,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useDashboard } from "@/contexts/dashboard-context"

export default function AbonnementPage() {
  const supabase = createClient()
  const { refreshCounts } = useDashboard()
  const { locale } = useLanguage()
  const [subscription, setSubscription] = useState<any>(null)
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>('monthly')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) {
          console.error('Authentication error:', userError)
          return
        }

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('is_subscribed')
          .eq('id', user.id)
          .single()

        if (profileError) {
          console.warn('Error fetching profile:', profileError)
        }

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

        const isSubscribed = profileData?.is_subscribed || subscriptionData?.status === 'active'
        const planType = subscriptionData?.plan_type || (profileData?.is_subscribed ? 'pro' : 'free')

        setSubscription({
          is_subscribed: isSubscribed,
          subscription_data: subscriptionData,
          plan_type: planType
        })
      } catch (error) {
        console.error('Error loading subscription data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const purchaseSubscription = async () => {
    try {
      const response = await fetch('/api/stripe/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interval: billingInterval }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Subscription error:', errorData)
        throw new Error(errorData.error || 'Failed to create subscription')
      }

      const { url } = await response.json()
      if (url) {
        window.open(url, '_blank')
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
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-2">
            {locale === 'fr' ? 'Abonnement' : 'Subscription'}
          </h1>
          <p className="text-primary/70 text-sm sm:text-base">
            {t('boostsPage.upgradeWithPlus', locale)}
          </p>
        </div>

        {/* Subscription Plans */}
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
                  <div className="space-y-2">
                    <div className="text-2xl sm:text-3xl text-gray-400 line-through font-semibold">
                      {billingInterval === 'monthly' ? `16$${t('boostsPage.perMonth', locale)}` : `176$${locale === 'fr' ? '/an' : '/year'}`}
                    </div>
                    <Badge className="bg-orange-500 text-white text-sm font-bold px-3 py-1 animate-pulse">
                      {locale === 'fr' ? 'OFFRE DE LANCEMENT -50%' : 'LAUNCH OFFER -50%'}
                    </Badge>
                    <div className="text-3xl sm:text-4xl font-bold text-brand-accent">
                      {billingInterval === 'monthly' ? `8$${t('boostsPage.perMonth', locale)}` : `88$${locale === 'fr' ? '/an' : '/year'}`}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 -mt-1">{locale === 'fr' ? '(offre et quantité à durée limitée)' : '(limited time offer and quantity)'}</p>

                  {/* Billing Interval Toggle (only show if not subscribed) */}
                  {!subscription?.is_subscribed && (
                    <div className="bg-white p-3 rounded-lg border border-brand-accent/30">
                      <div className="flex items-center justify-between gap-2">
                        <button
                          onClick={() => setBillingInterval('monthly')}
                          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                            billingInterval === 'monthly'
                              ? 'bg-brand-accent text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {locale === 'fr' ? 'Mensuel' : 'Monthly'}
                        </button>
                        <button
                          onClick={() => setBillingInterval('annual')}
                          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors relative ${
                            billingInterval === 'annual'
                              ? 'bg-brand-accent text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {locale === 'fr' ? 'Annuel' : 'Annual'}
                          <Badge className="absolute -top-2 -right-1 bg-green-500 text-white text-xs px-1 py-0">
                            -8%
                          </Badge>
                        </button>
                      </div>
                    </div>
                  )}

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
      </div>
    </div>
  )
}
