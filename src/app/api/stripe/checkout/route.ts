import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  console.log('🛍️ Checkout request received')
  try {
    const { priceId, type } = await req.json() // type can be 'subscription' or 'credit'
    
    // Get the user from Supabase auth
    const supabase = await createClient()
    const supabaseAdmin = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
  
    if (authError || !user) {
      console.error('❌ Authentication error:', authError)
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    console.log('✅ Authenticated user:', user.id)

    // Get or create Stripe customer
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single()

    let customerId = userData?.stripe_customer_id
    console.log('👤 Existing customer ID:', customerId)

    if (!customerId) {
      console.log('🆕 Creating new Stripe customer')
      // Create a new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabaseUid: user.id,
        },
      })
      console.log('✅ Created new customer:', customer.id)

      // Save the Stripe customer ID to the user's record
      const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({ stripe_customer_id: customer.id })
        .eq('id', user.id)

      if (updateError) {
        console.error('❌ Failed to update user with customer ID:', updateError)
        throw updateError
      }
      console.log('✅ Updated user with customer ID')

      customerId = customer.id
    }

    // Create a Stripe checkout session
    console.log('🛒 Creating checkout session')
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: type === 'subscription' ? 'subscription' : 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing?canceled=true`,
      metadata: {
        supabaseUid: user.id,
        type: type, // Store the type in metadata for webhook processing
      },
    })
    console.log('✅ Created checkout session:', session.id)

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('❌ Checkout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
