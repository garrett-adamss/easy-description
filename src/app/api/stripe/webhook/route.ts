/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

// Helper function to get user data with admin client
async function getUserDataWithAdmin(supabaseAdmin: any, supabaseUid: string) {
  // Get the user profile
  const { data: user, error: userError } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('auth_user_id', supabaseUid)
    .single()

  if (userError) {
    throw new Error(`Error fetching user: ${userError.message}`)
  }

  // Get active subscription
  let activeSubscription = null
  if (user.active_subscription_id) {
    const { data: subscription, error: subscriptionError } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('id', user.active_subscription_id)
      .single()

    if (subscriptionError && subscriptionError.code !== 'PGRST116') {
      throw new Error(`Error fetching subscription: ${subscriptionError.message}`)
    }
    
    activeSubscription = subscription
  }

  // Get subscription plan if there's an active subscription
  let subscriptionPlan = null
  if (activeSubscription) {
    const { data: plan, error: planError } = await supabaseAdmin
      .from('subscription_plans')
      .select('*')
      .eq('id', activeSubscription.plan_id)
      .single()

    if (planError) {
      throw new Error(`Error fetching subscription plan: ${planError.message}`)
    }
    subscriptionPlan = plan
  }

  return {
    user,
    activeSubscription,
    subscriptionPlan
  }
}

// Helper function to check if event was already processed
async function isEventProcessed(supabaseAdmin: any, eventId: string): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from('stripe_webhook_events')
    .select('id')
    .eq('stripe_event_id', eventId)
    .single()
  return !!data
}

// Helper function to mark event as processed
async function markEventAsProcessed(supabaseAdmin: any, eventId: string, eventType: string) {
  await supabaseAdmin
    .from('stripe_webhook_events')
    .insert({
      stripe_event_id: eventId,
      event_type: eventType,
      processed_at: new Date().toISOString()
    })
}

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
      console.log('🆔 Event ID:', event.id)
      console.log('📅 Event created:', new Date(event.created * 1000).toISOString())
      console.log('🔍 Is test event:', event.livemode === false)
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

    // Check if this is a test event and if we should process it
    if (!event.livemode && process.env.NODE_ENV === 'production') {
      console.log('⚠️ Skipping test event in production environment')
      return NextResponse.json({ received: true })
    }

    // Check for idempotency
    const isProcessed = await isEventProcessed(supabaseAdmin, event.id)
    if (isProcessed) {
      console.log('🔄 Event already processed, skipping:', event.id)
      return NextResponse.json({ received: true })
    }

    // Process the event
    try {
      switch (event.type) {
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted': {
          console.log(`🔄 Processing ${event.type}`)
          const subscription = event.data.object as Stripe.Subscription
          const customerId = subscription.customer as string
          console.log('👤 Customer ID:', customerId)
          console.log('📊 Subscription status:', subscription.status)

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

          // Get user data using the admin helper
          const { user } = await getUserDataWithAdmin(supabaseAdmin, supabaseUid)
          console.log('✅ Found user:', user.id)

          // Update user's stripe_customer_id if not set
          if (!user.stripe_customer_id) {
            const { error: customerUpdateError } = await supabaseAdmin
              .from('users')
              .update({ stripe_customer_id: customerId })
              .eq('id', user.id)

            if (customerUpdateError) {
              console.error('❌ Failed to update user with customer ID:', customerUpdateError)
              throw customerUpdateError
            }
            console.log('✅ Updated user with customer ID:', customerId)
          }

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
          const { data: existingSub } = await supabaseAdmin
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
            auth_user_id: supabaseUid,
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

            const { error: userUpdateError } = await supabaseAdmin
              .from('users')
              .update({
                monthly_credits: plan.monthly_credits,
              })
              .eq('id', user.id)

            console.log('👤 User HERE HERE:', user)

            if (updateError) {
              console.error('❌ Failed to update subscription:', updateError)
              throw updateError
            }
            if (userUpdateError) {
              console.error('❌ Failed to update user credits:', userUpdateError)
              throw userUpdateError
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
                // credits_remaining: plan.monthly_credits,
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
          const customerId = session.customer as string
          console.log('👤 Supabase UID:', supabaseUid)
          console.log('👤 Customer ID:', customerId)
          console.log('📦 Purchase type:', type)

          if (!supabaseUid) {
            console.error('❌ No Supabase UID found in session metadata')
            return NextResponse.json(
              { error: 'No Supabase UID found' },
              { status: 400 }
            )
          }

          // Get user data using the admin helper
          const { user } = await getUserDataWithAdmin(supabaseAdmin, supabaseUid)
          console.log('✅ Found user:', user.id)

          // Update user's stripe_customer_id if not set
          if (!user.stripe_customer_id) {
            const { error: customerUpdateError } = await supabaseAdmin
              .from('users')
              .update({ stripe_customer_id: customerId })
              .eq('id', user.id)

            if (customerUpdateError) {
              console.error('❌ Failed to update user with customer ID:', customerUpdateError)
              throw customerUpdateError
            }
            console.log('✅ Updated user with customer ID:', customerId)
          }

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
                auth_user_id: supabaseUid,
                stripe_subscription_id: subscription.id,
                plan_id: plan.id,
                status: subscription.status,
                cancel_at_period_end: subscription.cancel_at_period_end,
                current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
                current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
                trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
                is_active: true,
              })
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
                // credits_remaining: plan.monthly_credits,
                last_credit_reset: new Date().toISOString(),
              })
              .eq('id', user.id)

            if (userUpdateError) {
              console.error('❌ Failed to update user:', userUpdateError)
              throw userUpdateError
            }
          } else if (type === 'credit') {
            // Handle credit purchase
            const { data: creditPlan, error: creditPlanError } = await supabaseAdmin
              .from('credit_plans')
              .select('*')
              .eq('stripe_price_id', session.line_items?.data[0]?.price?.id)
              .single()

            if (creditPlanError || !creditPlan) {
              console.error('❌ Credit plan not found:', creditPlanError)
              return NextResponse.json(
                { error: 'Credit plan not found' },
                { status: 400 }
              )
            }

            // Create credit purchase record
            const { error: creditPurchaseError } = await supabaseAdmin
              .from('credit_purchases')
              .insert({
                user_id: user.id,
                credit_plan_id: creditPlan.id,
                credits_added: creditPlan.credits,
                purchase_amount: creditPlan.price,
                status: 'completed',
                expires_at: null,
              })

            if (creditPurchaseError) {
              console.error('❌ Failed to create credit purchase:', creditPurchaseError)
              throw creditPurchaseError
            }

            // Update user's credits
            // const { error: userUpdateError } = await supabaseAdmin
            //   .from('users')
            //   .update({
            //     credits_remaining: user.credits_remaining + creditPlan.credits,
            //   })
            //   .eq('id', user.id)

            // if (userUpdateError) {
            //   console.error('❌ Failed to update user credits:', userUpdateError)
            //   throw userUpdateError
            // }
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

      // Mark the event as processed
      await markEventAsProcessed(supabaseAdmin, event.id, event.type)
      console.log('✅ Event processed successfully')

      return NextResponse.json({ received: true })
    } catch (error) {
      console.error('❌ Error processing event:', error)
      return NextResponse.json(
        { error: 'Error processing event' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('❌ Webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
