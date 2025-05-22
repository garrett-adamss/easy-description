import { createClient } from "@/lib/supabase/server"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import md5 from 'md5'
import { User } from '@supabase/supabase-js'

interface DashboardLayoutProps {
  children: React.ReactNode
}

interface UserMetadata {
  id: string
  email: string
  full_name: string | null
  preferred_name: string | null
  user_role: string
  stripe_customer_id: string | null
  active_subscription_id: string | null
  is_subscription_active: boolean
  is_on_grace_period: boolean
  is_user_active: boolean
  onboarding_complete: boolean
  monthly_credits: number
  credits_remaining: number
  last_credit_reset: string | null
  timezone: string
  locale: string
  referral_code: string | null
  referred_by: string | null
  utm_source: string | null
  utm_campaign: string | null
  feature_flags: Record<string, any>
  created_at: string
  updated_at: string
}

interface SubscriptionData {
  id: string
  status: string
  cancel_at_period_end: boolean
  current_period_start: string
  current_period_end: string
  trial_end: string | null
  is_active: boolean
  plan_id: string
}

interface CombinedUser extends User {
  avatar: string
  metadata: UserMetadata
  subscription?: SubscriptionData
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) throw error || new Error('User not found')

  // Fetch user metadata
  const { data: userMetadata } = await supabase
    .from('users')
    .select('*')
    .eq('auth_user_id', user.id)
    .single()

  if (!userMetadata) throw new Error('User metadata not found')

  // Fetch subscription data if user has an active subscription
  let subscriptionData: SubscriptionData | undefined
  if (userMetadata.active_subscription_id) {
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('id', userMetadata.active_subscription_id)
      .single()
    
    if (subscription) {
      subscriptionData = subscription
    }
  }

  const email = user.email?.trim().toLowerCase()
  const hash = md5(email || '')
  const gravatarUrl = `https://www.gravatar.com/avatar/${hash}?d=identicon`

  // Combine auth user + users table metadata + subscription data
  const combinedUser: CombinedUser = {
    ...user,
    metadata: userMetadata,
    subscription: subscriptionData,
    avatar: gravatarUrl,
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar user={combinedUser} variant="inset" />
      <SidebarInset>
        <SiteHeader />
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
