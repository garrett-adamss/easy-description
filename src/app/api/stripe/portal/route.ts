import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  console.log('🚪 Portal request received')
  try {
    // Get the user from Supabase auth
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error('❌ Authentication error:', authError)
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    console.log('✅ Authenticated user:', user.id)

    // Get the user's Stripe customer ID
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single()

    if (userError || !userData?.stripe_customer_id) {
      console.error('❌ No Stripe customer found:', userError)
      return NextResponse.json(
        { error: 'No Stripe customer found' },
        { status: 400 }
      )
    }
    console.log('👤 Found customer ID:', userData.stripe_customer_id)

    // Create a Stripe billing portal session
    console.log('🔄 Creating portal session')
    const session = await stripe.billingPortal.sessions.create({
      customer: userData.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
    })
    console.log('✅ Created portal session:', session.id)

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('❌ Portal error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
