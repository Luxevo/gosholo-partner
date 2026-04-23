import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase/service'
import Stripe from 'stripe'

// This needs to be set when you create the webhook in Stripe dashboard
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = (await headers()).get('stripe-signature')

  // Validate required webhook configuration
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not configured')
    return NextResponse.json(
      { error: 'Webhook not configured' },
      { status: 500 }
    )
  }

  if (!signature) {
    console.error('Missing stripe-signature header')
    return NextResponse.json(
      { error: 'Missing signature' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    // Validate webhook signature - this is critical for security
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
    console.log('Processing webhook event:', event.type)

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const { userId, type } = session.metadata || {}
        
        if (type === 'subscription' && userId) {
          
          // Update user profile to mark as subscribed
          const { error: profileError } = await supabase
            .from('profiles')
            .update({ is_subscribed: true })
            .eq('id', userId)
            
          if (profileError) {
            console.error('Error updating profile subscription:', profileError)
          }

          // Record subscription in database
          const { error: subscriptionError } = await supabase
            .from('subscriptions')
            .insert({
              user_id: userId,
              plan_type: 'pro',
              status: 'active',
            })
            
          if (subscriptionError) {
            console.error('Error recording subscription:', subscriptionError)
          }
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