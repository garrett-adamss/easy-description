import { redirect } from "next/navigation"
import { LogoutButton } from "@/components/logout-button"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import md5 from 'md5'

export default async function AccountPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()

  if (error || !data?.user) {
    redirect("/auth/login")
  }

  const user = data.user

  // Fetch user metadata from public.users
  const { data: userMetadata } = await supabase
    .from('users')
    .select('*')
    .eq('auth_user_id', user.id)
    .single()

  if (!userMetadata) {
    redirect("/auth/login")
  }

  // Fetch subscription data if user has an active subscription
  let subscriptionData = null
  if (userMetadata.active_subscription_id) {
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('id', userMetadata.active_subscription_id)
      .single()
    
    if (subscription) {
      subscriptionData = subscription
      console.log("1", subscriptionData)
    }
  }

    console.log(userMetadata.active_subscription_id)
    console.log("3", subscriptionData)

  // Format date strings for better readability
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString()
  }

  // Get avatar URL
  const email = user.email?.trim().toLowerCase() ?? ''
  const hash = md5(email)
  const gravatarUrl = `https://www.gravatar.com/avatar/${hash}?d=identicon`

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Account</h1>
        <p className="text-muted-foreground">Manage your account settings and subscription</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Profile</CardTitle>
            <CardDescription>Your personal information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={gravatarUrl} alt={userMetadata.preferred_name || userMetadata.full_name || 'User'} />
                <AvatarFallback>{(userMetadata.preferred_name || userMetadata.full_name || 'U').charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h3 className="font-medium">{userMetadata.preferred_name || userMetadata.full_name || 'User'}</h3>
                <p className="text-sm text-muted-foreground">{userMetadata.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Subscription</CardTitle>
            <CardDescription>Your current plan and status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status</span>
                <Badge 
                  variant="outline" 
                  className={`${
                    userMetadata.is_subscription_active 
                      ? 'bg-green-50 text-green-700 hover:bg-green-50 hover:text-green-700'
                      : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-50 hover:text-yellow-700'
                  }`}
                >
                  {userMetadata.is_subscription_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Plan</span>
                <span className="text-sm">{subscriptionData?.subscription_plans?.name || 'No Plan'}</span>
              </div>
              {subscriptionData && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Current Period</span>
                    <span className="text-sm">
                      {formatDate(subscriptionData.current_period_start)} - {formatDate(subscriptionData.current_period_end)}
                    </span>
                  </div>
                  {subscriptionData.trial_end && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Trial Ends</span>
                      <span className="text-sm">{formatDate(subscriptionData.trial_end)}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Credits Card */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle>Credits</CardTitle>
            <CardDescription>Your credit usage and limits</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Current Credits */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Current Credits</span>
                  <span className="text-sm">
                    {userMetadata.credits_remaining} / {userMetadata.monthly_credits}
                  </span>
                </div>
                <Progress 
                  value={(userMetadata.credits_remaining / userMetadata.monthly_credits) * 100} 
                  className="h-2" 
                />
              </div>

              {/* Credits Grid */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border p-3">
                  <div className="text-xs font-medium text-muted-foreground">Available Credits</div>
                  <div className="mt-1 text-2xl font-bold">{userMetadata.credits_remaining}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs font-medium text-muted-foreground">Monthly Credits</div>
                  <div className="mt-1 text-2xl font-bold">{userMetadata.monthly_credits}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs font-medium text-muted-foreground">Last Reset</div>
                  <div className="mt-1 text-lg font-bold">{formatDate(userMetadata.last_credit_reset)}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs font-medium text-muted-foreground">Account Created</div>
                  <div className="mt-1 text-lg font-bold">{formatDate(userMetadata.created_at)}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
