import { NextRequest, NextResponse } from 'next/server'
import { stripe, BOOST_TYPE_TO_PRICE_ID } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { boostType } = await request.json() as {
      boostType: 'en_vedette' | 'visibilite'
    }

    if (!boostType || !BOOST_TYPE_TO_PRICE_ID[boostType]) {
      return NextResponse.json(
        { error: 'Type de boost invalide' },
        { status: 400 }
      )
    }

    // Get user from Supabase
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Utilisateur non authentifié' },
        { status: 401 }
      )
    }

    // Get price details from Stripe
    const price = await stripe.prices.retrieve(BOOST_TYPE_TO_PRICE_ID[boostType])
    
    if (!price.unit_amount) {
      return NextResponse.json(
        { error: 'Prix non trouvé' },
        { status: 400 }
      )
    }

    // Create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: price.unit_amount,
      currency: 'usd',
      metadata: {
        userId: user.id,
        boostType,
        type: 'boost_purchase',
      },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      amount: price.unit_amount,
    })

  } catch (error) {
    console.error('Error creating payment intent:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du paiement' },
      { status: 500 }
    )
  }
}