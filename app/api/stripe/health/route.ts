import { NextResponse } from 'next/server'

export async function GET() {
  const checks = {
    STRIPE_SECRET_KEY: !!process.env.STRIPE_SECRET_KEY,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    STRIPE_SUBSCRIPTION_PRICE_ID: !!process.env.STRIPE_SUBSCRIPTION_PRICE_ID,
    STRIPE_BOOST_EN_VEDETTE_PRICE_ID: !!process.env.STRIPE_BOOST_EN_VEDETTE_PRICE_ID,
    STRIPE_BOOST_VISIBILITE_PRICE_ID: !!process.env.STRIPE_BOOST_VISIBILITE_PRICE_ID,
  }

  const details = {
    STRIPE_SUBSCRIPTION_PRICE_ID_value: process.env.STRIPE_SUBSCRIPTION_PRICE_ID?.substring(0, 15) + '...',
    STRIPE_SECRET_KEY_starts_with: process.env.STRIPE_SECRET_KEY?.substring(0, 7),
  }

  return NextResponse.json({
    status: 'ok',
    environment_variables: checks,
    partial_values: details,
    all_configured: Object.values(checks).every(v => v === true)
  })
}

