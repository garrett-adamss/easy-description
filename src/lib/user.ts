import { createClient } from '@/lib/supabase/server'
import md5 from 'md5'

export type UserData = {
  authUser: {
    id: string
    email: string | undefined
    role: string | undefined
    app_metadata: {
      provider?: string
      [key: string]: any
    }
    user_metadata: {
      [key: string]: any
    }
  } | null
  user: {
    id: string
    email: string
    full_name: string | null
    preferred_name: string | null
    user_role: string
    stripe_customer_id: string | null
    is_subscription_active: boolean
    is_on_grace_period: boolean
    is_user_active: boolean
    onboarding_complete: boolean
    monthly_credits: number
    credits_usage: number
    last_credit_reset: string | null
    timezone: string
    locale: string
    referral_code: string | null
    referred_by: string | null
    utm_source: string | null
    utm_campaign: string | null
    feature_flags: Record<string, any>
  } | null
  activeSubscription: {
    id: string
    stripe_subscription_id: string
    plan_id: string
    status: string
    cancel_at_period_end: boolean
    current_period_start: string
    current_period_end: string
    trial_end: string | null
    is_active: boolean
  } | null
  subscriptionPlan: {
    id: string
    name: string
    description: string | null
    monthly_price: number | null
    annual_price: number | null
    monthly_credits: number
    features: Record<string, any>
  } | null
  creditPurchases: Array<{
    id: string
    credit_plan_id: string
    credits_added: number
    purchase_amount: number
    status: string
    expires_at: string | null
    created_at: string
  }>
  usageLogs: Array<{
    id: string
    description: string
    credits_used: number
    usage_type: string | null
    created_at: string
  }>
  avatar: string
}

export async function getUserData(): Promise<UserData> {
  const supabase = await createClient()
  
  // Get the current user
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) {
    throw new Error('No authenticated user found')
  }

  // Get the user profile
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('auth_user_id', authUser.id)
    .single()

  if (userError) {
    throw new Error(`Error fetching user: ${userError.message}`)
  }

  // Get active subscription using auth_user_id
  const { data: activeSubscriptions, error: subscriptionError } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('auth_user_id', authUser.id)
    .eq('is_active', true)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })

  if (subscriptionError) {
    throw new Error(`Error fetching subscription: ${subscriptionError.message}`)
  }

  // Get the most recent active subscription
  const activeSubscription = activeSubscriptions?.[0] || null

  // Get subscription plan if there's an active subscription
  let subscriptionPlan = null
  if (activeSubscription) {
    const { data: plan, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', activeSubscription.plan_id)
      .single()

    if (planError) {
      throw new Error(`Error fetching subscription plan: ${planError.message}`)
    }
    subscriptionPlan = plan
  }

  // Get credit purchases
  const { data: creditPurchases, error: creditPurchasesError } = await supabase
    .from('credit_purchases')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })

  if (creditPurchasesError) {
    throw new Error(`Error fetching credit purchases: ${creditPurchasesError.message}`)
  }

  // Get usage logs
  const { data: usageLogs, error: usageLogsError } = await supabase
    .from('usage_logs')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })

  if (usageLogsError) {
    throw new Error(`Error fetching usage logs: ${usageLogsError.message}`)
  }

  // Format auth user data
  const formattedAuthUser = {
    id: authUser.id,
    email: authUser.email,
    role: authUser.role,
    app_metadata: authUser.app_metadata,
    user_metadata: authUser.user_metadata
  }

  // Generate Gravatar URL
  const email = authUser.email?.trim().toLowerCase()
  const hash = md5(email || '')
  const gravatarUrl = `https://www.gravatar.com/avatar/${hash}?d=identicon`

  return {
    authUser: formattedAuthUser,
    user,
    activeSubscription,
    subscriptionPlan,
    creditPurchases,
    usageLogs,
    avatar: gravatarUrl
  }
} 