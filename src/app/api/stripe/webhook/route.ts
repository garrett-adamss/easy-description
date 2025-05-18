import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: Request) {
  console.log('🔔 Webhook received')
  try {
    const body = await req.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')!
    console.log('📝 Webhook signature:', signature)

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
      console.log('✅ Webhook signature verified')
      console.log('📦 Event type:', event.type)
    } catch (err) {
      console.error('❌ Webhook signature verification failed:', err)
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        console.log(`🔄 Processing ${event.type}`)
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string
        console.log('👤 Customer ID:', customerId)
        console.log('📊 Subscription status:', subscription.status)

        // Get the user from the customer ID
        const { data: user, error: userError } = await supabase
          .from('users')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (userError || !user) {
          console.error('❌ User not found for customer:', customerId)
          return NextResponse.json(
            { error: 'User not found' },
            { status: 400 }
          )
        }
        console.log('✅ Found user:', user.id)

        // Get the price ID to determine the plan
        const priceId = subscription.items.data[0]?.price.id
        console.log('💰 Price ID:', priceId)

        // Update the user's subscription status
        const { error: updateError } = await supabase
          .from('users')
          .update({
            subscription_status: subscription.status,
            subscription_id: subscription.id,
            cancel_at_period_end: subscription.cancel_at_period_end,
            current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
            plan_id: priceId,
            is_subscription_active: ['active', 'trialing'].includes(subscription.status),
            is_on_grace_period: subscription.cancel_at_period_end,
          })
          .eq('id', user.id)

        if (updateError) {
          console.error('❌ Failed to update user subscription:', updateError)
          return NextResponse.json(
            { error: 'Failed to update user subscription' },
            { status: 500 }
          )
        }
        console.log('✅ Updated user subscription')

        break
      }

      case 'checkout.session.completed': {
        console.log('🎉 Processing checkout.session.completed')
        const session = event.data.object as Stripe.Checkout.Session
        const customerId = session.customer as string
        console.log('👤 Customer ID:', customerId)

        // Get the user from the customer ID
        const { data: user, error: userError } = await supabase
          .from('users')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (userError || !user) {
          console.error('❌ User not found for customer:', customerId)
          return NextResponse.json(
            { error: 'User not found' },
            { status: 400 }
          )
        }
        console.log('✅ Found user:', user.id)

        // Get the subscription to get the current period end and price
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
        const priceId = subscription.items.data[0]?.price.id
        console.log('💰 Price ID:', priceId)
        console.log('📊 Subscription status:', subscription.status)

        // Update the user's subscription status
        const { error: updateError } = await supabase
          .from('users')
          .update({
            subscription_status: 'active',
            subscription_id: session.subscription as string,
            cancel_at_period_end: false,
            current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
            plan_id: priceId,
            is_subscription_active: true,
            is_on_grace_period: false,
          })
          .eq('id', user.id)

        if (updateError) {
          console.error('❌ Failed to update user subscription:', updateError)
          return NextResponse.json(
            { error: 'Failed to update user subscription' },
            { status: 500 }
          )
        }
        console.log('✅ Updated user subscription')

        break
      }

      case 'customer.subscription.trial_will_end': {
        console.log('⚠️ Processing trial_will_end')
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string
        console.log('👤 Customer ID:', customerId)

        // Get the user from the customer ID
        const { data: user, error: userError } = await supabase
          .from('users')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (userError || !user) {
          console.error('❌ User not found for customer:', customerId)
          return NextResponse.json(
            { error: 'User not found' },
            { status: 400 }
          )
        }
        console.log('✅ Found user:', user.id)

        // Update the user's subscription status to indicate trial ending
        const { error: updateError } = await supabase
          .from('users')
          .update({
            subscription_status: 'trialing',
            is_subscription_active: true,
            is_on_grace_period: false,
          })
          .eq('id', user.id)

        if (updateError) {
          console.error('❌ Failed to update user subscription:', updateError)
          return NextResponse.json(
            { error: 'Failed to update user subscription' },
            { status: 500 }
          )
        }
        console.log('✅ Updated user subscription for trial ending')

        break
      }
    }

    console.log('✅ Webhook processed successfully')
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('❌ Webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
