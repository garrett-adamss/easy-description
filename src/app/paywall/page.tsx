// app/paywall/page.jsx
import { createClient } from "@/lib/supabase/server"
import { redirect } from 'next/navigation'

export default async function PaywallPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()

  if (error || !data?.user) {
    redirect("/auth/login")
  }

  const user = data.user

  // Check subscription access
  const { data: userMetadata } = await supabase
    .from('users')
    .select('is_subscription_active')
    .eq('id', user.id)
    .single()

  if (!userMetadata?.is_subscription_active) {
    redirect('/pricing')
  }

  return (
    <div className="p-8">
      <h1 className="text-xl">Welcome to the exclusive content!</h1>
    </div>
  )
}
