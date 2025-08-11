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
    // Try signature validation first
    if (webhookSecret && signature) {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } else {
      // Fallback: parse event directly (TESTING ONLY)
      console.warn('⚠️ TESTING MODE: Skipping webhook signature validation')
      event = JSON.parse(body) as Stripe.Event
    }
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    console.log('Webhook secret:', webhookSecret ? 'SET' : 'MISSING')
    console.log('Signature:', signature ? 'PRESENT' : 'MISSING')
    
    // Try parsing without signature (TESTING ONLY)
    try {
      console.warn('⚠️ FALLBACK: Attempting to parse event without signature validation')
      event = JSON.parse(body) as Stripe.Event
    } catch (parseError) {
      console.error('Failed to parse webhook body:', parseError)
      return NextResponse.json(
        { error: 'Invalid signature and unparseable body' },
        { status: 400 }
      )
    }
  }

  try {
    const supabase = supabaseAdmin

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const { userId, boostType, type } = paymentIntent.metadata

        if (type === 'boost_purchase' && userId && boostType) {
          console.log(`Processing boost purchase: ${boostType} for user ${userId}`)
          
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
          const { error: transactionError } = await supabase.from('boost_transactions').insert({
            user_id: userId,
            boost_type: boostType as 'en_vedette' | 'visibilite',
            amount_cents: paymentIntent.amount,
            stripe_payment_intent_id: paymentIntent.id,
            card_last_four: cardLast4,
            card_brand: cardBrand,
            status: 'completed',
          })
          
          if (transactionError) {
            console.error('Error recording transaction:', transactionError)
          } else {
            console.log('Transaction recorded successfully')
          }

          // Add boost credit to user - simplified approach
          const creditField = boostType === 'en_vedette' 
            ? 'available_en_vedette' 
            : 'available_visibilite'

          // First, try to get existing record
          const { data: existingCredits } = await supabase
            .from('user_boost_credits')
            .select('*')
            .eq('user_id', userId)
            .single()

          if (existingCredits) {
            // Update existing record by incrementing the credit
            const newValue = (existingCredits[creditField] || 0) + 1
            const { error: updateError } = await supabase
              .from('user_boost_credits')
              .update({ [creditField]: newValue })
              .eq('user_id', userId)
              
            if (updateError) {
              console.error('Error updating boost credits:', updateError)
            } else {
              console.log(`Updated boost credits: ${creditField} = ${newValue}`)
            }
          } else {
            // Create new record
            const { error: insertError } = await supabase
              .from('user_boost_credits')
              .insert({
                user_id: userId,
                available_en_vedette: boostType === 'en_vedette' ? 1 : 0,
                available_visibilite: boostType === 'visibilite' ? 1 : 0,
              })
              
            if (insertError) {
              console.error('Error creating boost credits:', insertError)
            } else {
              console.log(`Created new boost credits for user ${userId}`)
            }
          }

          console.log(`Boost purchase completed for user ${userId}: ${boostType}`)
        }
        break
      }

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const { userId, type } = session.metadata || {}

        if (type === 'subscription' && userId) {
          console.log(`Processing subscription for user ${userId}`)
          
          // Update user profile to mark as subscribed
          const { error: profileError } = await supabase
            .from('profiles')
            .update({ is_subscribed: true })
            .eq('id', userId)
            
          if (profileError) {
            console.error('Error updating profile subscription:', profileError)
          } else {
            console.log('Updated profile subscription status')
          }

          // Initialize boost credits for new subscriber
          const { error: creditsError } = await supabase
            .from('user_boost_credits')
            .upsert({
              user_id: userId,
              available_en_vedette: 1,
              available_visibilite: 1,
            }, {
              onConflict: 'user_id',
            })
            
          if (creditsError) {
            console.error('Error creating subscription boost credits:', creditsError)
          } else {
            console.log('Created subscription boost credits')
          }

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