import { createClient as createServiceClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getUserData } from '@/lib/user'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  console.log('🛍️ Checkout request received')
  try {
    const { priceId, type } = await req.json() // type can be 'subscription' or 'credit'
    
    console.log('📦 Request details:', { priceId, type })

    if (!priceId || !type) {
      console.error('❌ Missing required fields')
      return NextResponse.json(
        { error: 'Price ID and type are required' },
        { status: 400 }
      )
    }

    if (!['subscription', 'credit'].includes(type)) {
      console.error('❌ Invalid type provided')
      return NextResponse.json(
        { error: 'Type must be either "subscription" or "credit"' },
        { status: 400 }
      )
    }
    
    // Get user data using the helper function
    const userData = await getUserData()
    if (!userData.authUser || !userData.user) {
      console.error('❌ No authenticated user found')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    console.log('✅ Authenticated user:', userData.authUser.id)

    // Validate the product exists in our database
    const supabaseAdmin = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: productOffer, error: productError } = await supabaseAdmin
      .from('product_offers')
      .select('*')
      .eq('stripe_product_id', priceId)
      .eq('plan_type', type)
      .eq('is_deleted', false)
      .single()

    if (productError || !productOffer) {
      console.error('❌ Product not found:', productError)
      return NextResponse.json(
        { error: 'Product not found or invalid' },
        { status: 400 }
      )
    }
    console.log('✅ Product validated:', productOffer.name)

    // Check if user already has an active subscription (for subscription purchases)
    if (type === 'subscription' && userData.user.is_subscription_active) {
      console.error('❌ User already has an active subscription')
      return NextResponse.json(
        { error: 'You already have an active subscription. Please cancel your current subscription before purchasing a new one.' },
        { status: 400 }
      )
    }

    // Get or create Stripe customer
    let customerId = userData.user.stripe_customer_id
    console.log('👤 Existing customer ID:', customerId)

    if (!customerId) {
      console.log('🆕 Creating new Stripe customer')
      // Create a new Stripe customer
      const customer = await stripe.customers.create({
        email: userData.authUser.email,
        name: userData.user.full_name || userData.user.preferred_name || undefined,
        metadata: {
          supabaseUid: userData.authUser.id,
          userId: userData.user.id,
        },
      })
      console.log('✅ Created new customer:', customer.id)

      // Save the Stripe customer ID to the user's record
      const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({ stripe_customer_id: customer.id })
        .eq('id', userData.user.id)

      if (updateError) {
        console.error('❌ Failed to update user with customer ID:', updateError)
        throw updateError
      }
      console.log('✅ Updated user with customer ID')

      customerId = customer.id
    }

    // Set appropriate success and cancel URLs based on type
    const successUrl = type === 'subscription' 
      ? `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?success=subscription`
      : `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?success=credits`
    
    const cancelUrl = type === 'subscription'
      ? `${process.env.NEXT_PUBLIC_SITE_URL}/pricing?canceled=subscription`
      : `${process.env.NEXT_PUBLIC_SITE_URL}/credit-pricing?canceled=credits`

    // Create a Stripe checkout session
    console.log('🛒 Creating checkout session')
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: type === 'subscription' ? 'subscription' : 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        supabaseUid: userData.authUser.id,
        userId: userData.user.id,
        type: type,
        productName: productOffer.name,
      },
    }

    // Add subscription-specific configuration
    if (type === 'subscription') {
      sessionConfig.subscription_data = {
        metadata: {
          supabaseUid: userData.authUser.id,
          userId: userData.user.id,
          productName: productOffer.name,
        }
      }
      
      // Allow promotion codes for subscriptions
      sessionConfig.allow_promotion_codes = true
    }

    // Add payment-specific configuration for credits
    if (type === 'credit') {
      sessionConfig.payment_intent_data = {
        metadata: {
          supabaseUid: userData.authUser.id,
          userId: userData.user.id,
          productName: productOffer.name,
          credits: productOffer.credits.toString(),
        }
      }
    }

    const session = await stripe.checkout.sessions.create(sessionConfig)
    console.log('✅ Created checkout session:', session.id)
    console.log('🔗 Session URL:', session.url)

    return NextResponse.json({ 
      url: session.url,
      sessionId: session.id,
      productName: productOffer.name,
      amount: productOffer.price,
      credits: type === 'credit' ? productOffer.credits : null
    })
  } catch (error) {
    console.error('❌ Checkout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
