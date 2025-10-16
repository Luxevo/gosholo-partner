import { loadStripe } from '@stripe/stripe-js'
import Stripe from 'stripe'

// Client-side Stripe
export const getStripe = () => {
  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set')
  }
  
  return loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
}

// Server-side Stripe
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
  typescript: true,
})

// Price IDs
export const STRIPE_PRICES = {
  subscriptionMonthly: process.env.STRIPE_SUBSCRIPTION_PRICE_ID!,
  subscriptionAnnual: process.env.STRIPE_SUBSCRIPTION_ANNUAL_PRICE_ID!,
  boostEnVedette: process.env.STRIPE_BOOST_EN_VEDETTE_PRICE_ID!,
  boostVisibilite: process.env.STRIPE_BOOST_VISIBILITE_PRICE_ID!,
} as const

// Subscription plan types
export type SubscriptionInterval = 'monthly' | 'annual'

export const SUBSCRIPTION_PLANS = {
  monthly: {
    priceId: STRIPE_PRICES.subscriptionMonthly,
    price: 8,
    interval: 'month' as const,
    displayPrice: '$8/mois',
  },
  annual: {
    priceId: STRIPE_PRICES.subscriptionAnnual,
    price: 88,
    interval: 'year' as const,
    displayPrice: '$88/an',
    savings: 'Économisez $8 (2 mois gratuits)',
  },
} as const

// Boost type mapping
export const BOOST_TYPE_TO_PRICE_ID = {
  en_vedette: STRIPE_PRICES.boostEnVedette,
  visibilite: STRIPE_PRICES.boostVisibilite,
} as const