import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase/service'
import Stripe from 'stripe'

// This needs to be set when you create the webhook in Stripe dashboard
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = (await headers()).get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  try {
    const supabase = supabaseAdmin

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const { userId, boostType, type } = paymentIntent.metadata

        if (type === 'boost_purchase' && userId && boostType) {
          // Get payment method details for card info
          let cardLast4 = ''
          let cardBrand = ''
          
          if (paymentIntent.payment_method) {
            const paymentMethod = await stripe.paymentMethods.retrieve(
              paymentIntent.payment_method as string
            )
            cardLast4 = paymentMethod.card?.last4 || ''
            cardBrand = paymentMethod.card?.brand || ''
          }

          // Record transaction
          await supabase.from('boost_transactions').insert({
            user_id: userId,
            boost_type: boostType as 'en_vedette' | 'visibilite',
            amount_cents: paymentIntent.amount,
            stripe_payment_intent_id: paymentIntent.id,
            card_last_four: cardLast4,
            card_brand: cardBrand,
            status: 'completed',
          })

          // Add boost credit to user
          const creditField = boostType === 'en_vedette' 
            ? 'available_en_vedette' 
            : 'available_visibilite'

          await supabase
            .from('user_boost_credits')
            .upsert({
              user_id: userId,
              [creditField]: 1,
            }, {
              onConflict: 'user_id',
              ignoreDuplicates: false,
            })
            .select()
            .then(({ data }) => {
              if (!data || data.length === 0) {
                // If no existing record, create new one
                return supabase
                  .from('user_boost_credits')
                  .insert({
                    user_id: userId,
                    available_en_vedette: boostType === 'en_vedette' ? 1 : 0,
                    available_visibilite: boostType === 'visibilite' ? 1 : 0,
                  })
              } else {
                // Update existing record
                const current = data[0]
                return supabase
                  .from('user_boost_credits')
                  .update({
                    [creditField]: (current[creditField as keyof typeof current] as number || 0) + 1,
                  })
                  .eq('user_id', userId)
              }
            })

          console.log(`Boost purchase completed for user ${userId}: ${boostType}`)
        }
        break
      }

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const { userId, type } = session.metadata || {}

        if (type === 'subscription' && userId) {
          // Update user profile to mark as subscribed
          await supabase
            .from('profiles')
            .update({ is_subscribed: true })
            .eq('id', userId)

          // Initialize boost credits for new subscriber
          await supabase
            .from('user_boost_credits')
            .upsert({
              user_id: userId,
              available_en_vedette: 1,
              available_visibilite: 1,
            }, {
              onConflict: 'user_id',
            })

          console.log(`Subscription activated for user ${userId}`)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        
        // Find user by customer ID
        const customer = await stripe.customers.retrieve(subscription.customer as string)
        if (customer.deleted) return NextResponse.json({ received: true })
        
        const userId = customer.metadata?.userId
        if (userId) {
          await supabase
            .from('profiles')
            .update({ is_subscribed: false })
            .eq('id', userId)

          console.log(`Subscription cancelled for user ${userId}`)
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}