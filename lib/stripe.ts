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
  apiVersion: '2024-12-18.acacia',
  typescript: true,
})

// Price IDs
export const STRIPE_PRICES = {
  subscription: process.env.STRIPE_SUBSCRIPTION_PRICE_ID!,
  boostEnVedette: process.env.STRIPE_BOOST_EN_VEDETTE_PRICE_ID!,
  boostVisibilite: process.env.STRIPE_BOOST_VISIBILITE_PRICE_ID!,
} as const

// Boost type mapping
export const BOOST_TYPE_TO_PRICE_ID = {
  en_vedette: STRIPE_PRICES.boostEnVedette,
  visibilite: STRIPE_PRICES.boostVisibilite,
} as const