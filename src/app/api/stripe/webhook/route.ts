import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
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

    const supabaseAdmin = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        console.log(`🔄 Processing ${event.type}`)
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string
        console.log('👤 Customer ID:', customerId)
        console.log('📊 Subscription status:', subscription.status)
        console.log('📅 Raw period start:', (subscription as any).current_period_start)
        console.log('📅 Raw period end:', (subscription as any).current_period_end)

        // Get the customer to find the Supabase UID
        const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer
        const supabaseUid = customer.metadata.supabaseUid

        if (!supabaseUid) {
          console.error('❌ No Supabase UID found in customer metadata')
          return NextResponse.json(
            { error: 'No Supabase UID found' },
            { status: 400 }
          )
        }

        // Get the user from Supabase
        const { data: user, error: userError } = await supabaseAdmin
          .from('users')
          .select('id')
          .eq('auth_user_id', supabaseUid)
          .single()

        if (userError || !user) {
          console.error('❌ User not found:', userError)
          return NextResponse.json(
            { error: 'User not found' },
            { status: 400 }
          )
        }
        console.log('✅ Found user:', user.id)

        // Get the price ID to determine the plan
        const priceId = subscription.items.data[0]?.price.id
        console.log('💰 Price ID:', priceId)

        // Get the subscription plan details
        const { data: plan, error: planError } = await supabaseAdmin
          .from('subscription_plans')
          .select('*')
          .eq('stripe_price_id', priceId)
          .single()

        if (planError || !plan) {
          console.error('❌ Plan not found for price:', priceId)
          return NextResponse.json(
            { error: 'Plan not found' },
            { status: 400 }
          )
        }

        // Create or update subscription record
        const { data: existingSub, error: subError } = await supabaseAdmin
          .from('subscriptions')
          .select('id')
          .eq('stripe_subscription_id', subscription.id)
          .single()

        // Safely handle date conversions
        const periodStart = (subscription as any).current_period_start
        const periodEnd = (subscription as any).current_period_end
        const trialEnd = subscription.trial_end

        console.log('📅 Period start:', periodStart ? new Date(periodStart * 1000).toISOString() : null)
        console.log('📅 Period end:', periodEnd ? new Date(periodEnd * 1000).toISOString() : null)
        console.log('📅 Trial end:', trialEnd ? new Date(trialEnd * 1000).toISOString() : null )

        const subscriptionData = {
          user_id: user.id,
          stripe_subscription_id: subscription.id,
          plan_id: plan.id,
          status: subscription.status,
          cancel_at_period_end: subscription.cancel_at_period_end,
          current_period_start: periodStart ? new Date(periodStart * 1000).toISOString() : null,
          current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
          trial_end: trialEnd ? new Date(trialEnd * 1000).toISOString() : null,
          is_active: ['active', 'trialing'].includes(subscription.status),
        }

        if (existingSub) {
          // Update existing subscription
          const { error: updateError } = await supabaseAdmin
            .from('subscriptions')
            .update(subscriptionData)
            .eq('id', existingSub.id)

          if (updateError) {
            console.error('❌ Failed to update subscription:', updateError)
            throw updateError
          }
        } else {
          // Create new subscription
          const { data: newSub, error: createError } = await supabaseAdmin
            .from('subscriptions')
            .insert(subscriptionData)
            .select()
            .single()

          if (createError || !newSub) {
            console.error('❌ Failed to create subscription:', createError)
            throw createError
          }

          // Update user's active subscription
          const { error: userUpdateError } = await supabaseAdmin
            .from('users')
            .update({
              active_subscription_id: newSub.id,
              is_subscription_active: true,
              is_on_grace_period: subscription.cancel_at_period_end,
              monthly_credits: plan.monthly_credits,
              credits_remaining: plan.monthly_credits,
              last_credit_reset: new Date().toISOString(),
            })
            .eq('id', user.id)

          if (userUpdateError) {
            console.error('❌ Failed to update user:', userUpdateError)
            throw userUpdateError
          }
        }

        break
      }

      case 'checkout.session.completed': {
        console.log('🎉 Processing checkout.session.completed')
        const session = event.data.object as Stripe.Checkout.Session
        const type = session.metadata?.type
        const supabaseUid = session.metadata?.supabaseUid
        console.log('👤 Supabase UID:', supabaseUid)
        console.log('📦 Purchase type:', type)

        if (!supabaseUid) {
          console.error('❌ No Supabase UID found in session metadata')
          return NextResponse.json(
            { error: 'No Supabase UID found' },
            { status: 400 }
          )
        }

        // Get the user directly from Supabase
        const { data: user, error: userError } = await supabaseAdmin
          .from('users')
          .select('id')
          .eq('auth_user_id', supabaseUid)
          .single()

        if (userError || !user) {
          console.error('❌ User not found:', userError)
          return NextResponse.json(
            { error: 'User not found' },
            { status: 400 }
          )
        }
        console.log('✅ Found user:', user.id)

        if (type === 'subscription') {
          // Get the subscription from the checkout session
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
          const priceId = subscription.items.data[0]?.price.id
          console.log('💰 Price ID:', priceId)

          // Get the subscription plan details
          const { data: plan, error: planError } = await supabaseAdmin
            .from('subscription_plans')
            .select('*')
            .eq('stripe_price_id', priceId)
            .single()

          if (planError || !plan) {
            console.error('❌ Plan not found for price:', priceId)
            return NextResponse.json(
              { error: 'Plan not found' },
              { status: 400 }
            )
          }

          // Create subscription record
          const { data: newSub, error: createError } = await supabaseAdmin
            .from('subscriptions')
            .insert({
              user_id: user.id,
              stripe_subscription_id: subscription.id,
              plan_id: plan.id,
              status: subscription.status,
              cancel_at_period_end: subscription.cancel_at_period_end,
              current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
              current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
              trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
              is_active: ['active', 'trialing'].includes(subscription.status),
            })
            .select()
            .single()

          if (createError || !newSub) {
            console.error('❌ Failed to create subscription:', createError)
            throw createError
          }

          // Update user's subscription status and customer ID
          const { error: userUpdateError } = await supabaseAdmin
            .from('users')
            .update({
              active_subscription_id: newSub.id,
              is_subscription_active: true,
              is_on_grace_period: subscription.cancel_at_period_end,
              monthly_credits: plan.monthly_credits,
              credits_remaining: plan.monthly_credits,
              last_credit_reset: new Date().toISOString(),
              stripe_customer_id: session.customer as string, // Save the customer ID here
            })
            .eq('id', user.id)

          if (userUpdateError) {
            console.error('❌ Failed to update user:', userUpdateError)
            throw userUpdateError
          }
        } else if (type === 'credit') {
          // Handle credit purchase
          const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent as string)
          const priceId = session.line_items?.data[0]?.price?.id

          if (!priceId) {
            console.error('❌ No price ID found in session')
            return NextResponse.json(
              { error: 'No price ID found' },
              { status: 400 }
            )
          }

          // Get credit plan details
          const { data: creditPlan, error: planError } = await supabaseAdmin
            .from('credit_plans')
            .select('*')
            .eq('stripe_price_id', priceId)
            .single()

          if (planError || !creditPlan) {
            console.error('❌ Credit plan not found:', planError)
            return NextResponse.json(
              { error: 'Credit plan not found' },
              { status: 400 }
            )
          }

          // Create credit purchase record
          const { error: purchaseError } = await supabaseAdmin
            .from('credit_purchases')
            .insert({
              user_id: user.id,
              credit_plan_id: creditPlan.id,
              stripe_payment_intent_id: paymentIntent.id,
              credits_added: creditPlan.credits,
              purchase_amount: creditPlan.price,
              status: paymentIntent.status,
            })

          if (purchaseError) {
            console.error('❌ Failed to create credit purchase:', purchaseError)
            throw purchaseError
          }

          // Update user's credits
          const { error: updateError } = await supabaseAdmin
            .from('users')
            .update({
              credits_remaining: supabaseAdmin.rpc('add_credits', {
                user_id: user.id,
                credits_to_add: creditPlan.credits
              })
            })
            .eq('id', user.id)

          if (updateError) {
            console.error('❌ Failed to update user credits:', updateError)
            throw updateError
          }
        }

        break
      }

      case 'customer.subscription.trial_will_end': {
        console.log('⚠️ Processing trial_will_end')
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string
        console.log('👤 Customer ID:', customerId)

        // Get the user from the customer ID
        const { data: user, error: userError } = await supabaseAdmin
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

        // Update the subscription record
        const { error: updateError } = await supabaseAdmin
          .from('subscriptions')
          .update({
            status: 'trialing',
            is_active: true,
          })
          .eq('stripe_subscription_id', subscription.id)

        if (updateError) {
          console.error('❌ Failed to update subscription:', updateError)
          throw updateError
        }

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
