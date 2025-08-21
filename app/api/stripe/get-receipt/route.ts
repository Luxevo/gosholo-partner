import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const paymentIntentId = searchParams.get('payment_intent_id')

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: 'Payment Intent ID requis' },
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

    // Verify this payment intent belongs to the user
    const { data: transaction, error: transactionError } = await supabase
      .from('boost_transactions')
      .select('*')
      .eq('stripe_payment_intent_id', paymentIntentId)
      .eq('user_id', user.id)
      .single()

    if (transactionError || !transaction) {
      return NextResponse.json(
        { error: 'Transaction non trouvée' },
        { status: 404 }
      )
    }

    // Get payment intent and charges separately
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
    const charges = await stripe.charges.list({
      payment_intent: paymentIntentId,
      limit: 1,
    })

    if (!charges.data.length) {
      return NextResponse.json(
        { error: 'Aucun reçu disponible' },
        { status: 404 }
      )
    }

    const charge = charges.data[0]
    
    // Always return transaction details and Stripe receipt URL if available
    return NextResponse.json({
      receipt_url: charge.receipt_url || null,
      receipt_number: charge.receipt_number || null,
      transaction_details: {
        payment_intent_id: paymentIntentId,
        charge_id: charge.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        created: charge.created,
        payment_method_details: charge.payment_method_details,
        description: paymentIntent.description,
        card_brand: charge.payment_method_details?.card?.brand,
        card_last4: charge.payment_method_details?.card?.last4,
        outcome: charge.outcome
      },
      has_stripe_receipt: !!charge.receipt_url
    })

  } catch (error) {
    console.error('Error retrieving receipt:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du reçu' },
      { status: 500 }
    )
  }
}