import { NextResponse } from 'next/server'
import { stripe, STRIPE_PRICES } from '@/lib/stripe'

export async function GET() {
  try {
    // Test 1: Check if Stripe is initialized
    const stripeCheck = stripe ? 'initialized' : 'not initialized'
    
    // Test 2: Check environment variables
    const envCheck = {
      STRIPE_SECRET_KEY: !!process.env.STRIPE_SECRET_KEY,
      STRIPE_SUBSCRIPTION_PRICE_ID: !!process.env.STRIPE_SUBSCRIPTION_PRICE_ID,
    }
    
    // Test 3: Check STRIPE_PRICES
    const pricesCheck = {
      subscription: STRIPE_PRICES.subscription || 'empty',
      subscription_length: STRIPE_PRICES.subscription?.length || 0
    }

    return NextResponse.json({
      status: 'ok',
      stripe: stripeCheck,
      environment: envCheck,
      prices: pricesCheck,
      message: 'Test endpoint is working'
    })
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

