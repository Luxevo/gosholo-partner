import { NextRequest, NextResponse } from 'next/server'
import { stripe, STRIPE_PRICES } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    // Parse JSON body to get interval (monthly or annual)
    let interval: 'monthly' | 'annual' = 'monthly'
    let promoCode: string | undefined
    try {
      const body = await request.json()
      interval = body.interval || 'monthly'
      promoCode = body.promoCode
    } catch (e) {
      // Body is empty or invalid, default to monthly
      interval = 'monthly'
      promoCode = undefined
    }

    // Get user from Supabase
    const supabase = await createClient()
    
    if (!supabase) {
      console.error('Failed to create Supabase client')
      return NextResponse.json(
        { error: 'Configuration error' },
        { status: 500 }
      )
    }

    if (!supabase.auth) {
      console.error('Supabase auth is undefined')
      return NextResponse.json(
        { error: 'Authentication service unavailable' },
        { status: 500 }
      )
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Utilisateur non authentifié' },
        { status: 401 }
      )
    }

    // Get or create Stripe customer
    let customer
    const existingCustomers = await stripe.customers.list({
      email: user.email,
      limit: 1,
    })

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0]
    } else {
      customer = await stripe.customers.create({
        email: user.email || undefined,
        metadata: {
          userId: user.id,
        },
      })
    }

    // Determine which price ID to use based on interval
    const priceId = interval === 'annual' 
      ? STRIPE_PRICES.subscriptionAnnual 
      : STRIPE_PRICES.subscriptionMonthly

    console.log('Creating subscription:', { interval, priceId, userId: user.id })

    // Validate price ID
    if (!priceId) {
      console.error(`Missing price ID for interval: ${interval}`)
      return NextResponse.json(
        { error: `Configuration error: Missing ${interval} price ID` },
        { status: 500 }
      )
    }

    // Create checkout session for subscription
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${request.nextUrl.origin}/dashboard/boosts?success=subscription`,
      cancel_url: `${request.nextUrl.origin}/dashboard/boosts?canceled=true`,
      metadata: {
        userId: user.id,
        type: 'subscription',
        interval: interval,
      },
      // Allow users to enter promo codes directly in Stripe checkout
      allow_promotion_codes: true,
    })

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    })

  } catch (error) {
    console.error('Error creating subscription:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'abonnement' },
      { status: 500 }
    )
  }
}