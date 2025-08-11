import { NextRequest, NextResponse } from 'next/server'
import { stripe, STRIPE_PRICES } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { promoCode } = await request.json() as {
      promoCode?: string
    }

    // Get user from Supabase
    const supabase = createClient()
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
        promoCode: promoCode || '',
      },
      // Apply promo code if provided
      ...(promoCode === 'jmq2025' && {
        discounts: [
          {
            coupon: 'first_month_free', // You'll need to create this coupon in Stripe
          },
        ],
      }),
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