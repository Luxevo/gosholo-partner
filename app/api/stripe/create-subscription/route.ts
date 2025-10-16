import { NextRequest, NextResponse } from 'next/server'
import { stripe, STRIPE_PRICES } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    console.log('🔵 [API] Starting subscription creation...')
    
    const { promoCode } = await request.json() as {
      promoCode?: string
    }

    // Get user from Supabase
    const supabase = await createClient()
    console.log('🔵 [API] Supabase client created')
    
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
      console.error('❌ [API] User authentication failed:', userError)
      return NextResponse.json(
        { error: 'Utilisateur non authentifié' },
        { status: 401 }
      )
    }

    console.log('✅ [API] User authenticated:', user.email)

    // Get or create Stripe customer
    let customer
    const existingCustomers = await stripe.customers.list({
      email: user.email,
      limit: 1,
    })

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0]
      console.log('✅ [API] Existing Stripe customer found:', customer.id)
    } else {
      customer = await stripe.customers.create({
        email: user.email || undefined,
        metadata: {
          userId: user.id,
        },
      })
      console.log('✅ [API] New Stripe customer created:', customer.id)
    }

    console.log('🔵 [API] Creating checkout session with price:', STRIPE_PRICES.subscription)

    // Create checkout session for subscription
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price: STRIPE_PRICES.subscription,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${request.nextUrl.origin}/dashboard/boosts?success=subscription`,
      cancel_url: `${request.nextUrl.origin}/dashboard/boosts?canceled=true`,
      metadata: {
        userId: user.id,
        type: 'subscription',
      },
      // Allow users to enter promo codes directly in Stripe checkout
      allow_promotion_codes: true,
    })

    console.log('✅ [API] Checkout session created:', session.id)
    console.log('✅ [API] Redirect URL:', session.url)

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    })

  } catch (error) {
    console.error('❌ [API] Error creating subscription:', error)
    console.error('❌ [API] Error details:', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'abonnement' },
      { status: 500 }
    )
  }
}