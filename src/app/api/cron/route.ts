/* eslint-disable @typescript-eslint/no-explicit-any */
// /* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.warn('Unauthorized cron request')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  console.log('🔁 Starting nightly Stripe sync cron job...')

  try {
    // Step 1: Fetch all active subscriptions from Stripe
    const stripeSubs = await stripe.subscriptions.list({ limit: 100 }).catch(err => {
      console.error('❌ Stripe API error during subscription fetch:', err)
      return { data: [] }
    })

    console.log(`📦 Retrieved ${stripeSubs.data.length} subscriptions from Stripe`)

    for (const sub of stripeSubs.data) {
      const userStripeId = sub.customer as string

      // Step 2: Lookup the user in Supabase by stripe_customer_id
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('stripe_customer_id', userStripeId)
        .single()

      if (!user || userError) {
        console.warn(`⚠️ No user found for Stripe customer ID: ${userStripeId}`)
        continue
      }

      // Step 3: Upsert the subscription
      const { data: upsertedSub, error: subError } = await supabase
        .from('subscriptions')
        .upsert({
          stripe_subscription_id: sub.id,
          user_id: user.id,
          status: sub.status,
          plan_id: sub.items.data[0]?.price.id,
          cancel_at_period_end: sub.cancel_at_period_end,
          current_period_start: new Date((sub as any).current_period_start * 1000).toISOString(),
          current_period_end: new Date((sub as any).current_period_end * 1000).toISOString(),
          trial_end: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
          is_active: ['active', 'trialing'].includes(sub.status),
        }, { onConflict: 'stripe_subscription_id' })
        .select()

      if (subError || !upsertedSub) {
        console.error(`❌ Failed to upsert subscription for user ${user.id}:`, subError)
        continue
      }

      // Step 4: Update cached subscription fields on user
      const updateUser = await supabase
        .from('users')
        .update({
          active_subscription_id: upsertedSub[0].id,
          is_subscription_active: ['active', 'trialing'].includes(sub.status),
          is_on_grace_period: sub.cancel_at_period_end
        })
        .eq('id', user.id)

      if (updateUser.error) {
        console.error(`❌ Failed to update user ${user.id} cached fields:`, updateUser.error)
      }

      // Step 5: Reset credits if billing period just ended
      const { data: userDetails, error: userDetailsError } = await supabase
        .from('users')
        .select('monthly_credits, last_credit_reset')
        .eq('id', user.id)
        .single()

      if (userDetailsError) {
        console.error(`❌ Error fetching user details for ${user.id}:`, userDetailsError)
        continue
      }

      const currentPeriodEnd = new Date((sub as any).current_period_end * 1000)
      const now = new Date()
      const lastReset = userDetails?.last_credit_reset ? new Date(userDetails.last_credit_reset) : new Date(0)
      const isResetDue = currentPeriodEnd > lastReset && now >= currentPeriodEnd

      if (isResetDue) {
        const resetCredits = await supabase
          .from('users')
          .update({
            credits_remaining: 0,
            last_credit_reset: now.toISOString()
          })
          .eq('id', user.id)

        if (resetCredits.error) {
          console.error(`❌ Failed to reset credits for user ${user.id}:`, resetCredits.error)
        } else {
          console.log(`✅ Credits reset for user ${user.id}`)
        }
      }

      // Step 6: Disable access if subscription expired
      const isExpired = !['active', 'trialing'].includes(sub.status) && now > currentPeriodEnd

      if (isExpired) {
        const disableUser = await supabase
          .from('users')
          .update({
            is_subscription_active: false,
            is_on_grace_period: false
          })
          .eq('id', user.id)

        if (disableUser.error) {
          console.error(`❌ Failed to disable access for user ${user.id}:`, disableUser.error)
        } else {
          console.log(`⛔ Subscription expired — access disabled for user ${user.id}`)
        }
      }

      // Log user summary
      console.log(`✔ Synced user ${user.id} | status: ${sub.status} | resetCredits: ${isResetDue} | expired: ${isExpired}`)
    }

    console.log('✅ Stripe sync cron job completed successfully.')
    return NextResponse.json({ status: 'sync complete', count: stripeSubs.data.length })
  } catch (err) {
    console.error('❌ Stripe sync cron job failed:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}