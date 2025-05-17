import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function SubscriptionStatusPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: userMeta } = await supabase
    .from('users')
    .select('subscription_status, cancel_at_period_end')
    .eq('id', user.id)
    .single()

  if (userMeta?.cancel_at_period_end) {
    redirect('/subscription/cancelled')
  }

  redirect('/subscription/resubscribed') // or /dashboard
}