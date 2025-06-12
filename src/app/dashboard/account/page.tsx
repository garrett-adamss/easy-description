import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { getUserData } from "@/lib/user"

export default async function AccountPage() {
  const userData = await getUserData()

  if (!userData) {
    throw new Error('No user data found')
  }

  console.log('User data HERE:', userData)

  // Format date strings for better readability
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString()
  }

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
                <AvatarImage src={userData.avatar} alt={userData.user?.preferred_name || userData.user?.full_name || 'User'} />
                <AvatarFallback>{(userData.user?.preferred_name || userData.user?.full_name || 'U').charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h3 className="font-medium">{userData.user?.preferred_name || userData.user?.full_name || 'User'}</h3>
                <p className="text-sm text-muted-foreground">{userData.user?.email}</p>
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
                    userData.user?.is_subscription_active 
                      ? 'bg-green-50 text-green-700 hover:bg-green-50 hover:text-green-700'
                      : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-50 hover:text-yellow-700'
                  }`}
                >
                  {userData.user?.is_subscription_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Plan</span>
                <span className="text-sm">{userData.subscriptionPlan?.name || 'No Plan'}</span>
              </div>
              {userData.activeSubscription && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Current Period</span>
                    <span className="text-sm">
                      {formatDate(userData.activeSubscription.current_period_start)} - {formatDate(userData.activeSubscription.current_period_end)}
                    </span>
                  </div>
                  {userData.activeSubscription.trial_end && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Trial Ends</span>
                      <span className="text-sm">{formatDate(userData.activeSubscription.trial_end)}</span>
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
                  <span className="text-sm font-medium">Credits Used</span>
                  <span className="text-sm">
                    {userData.credits?.usedThisPeriod} / {userData.subscriptionPlan?.credits}
                  </span>
                </div>
                <Progress 
                  value={(userData.credits?.usedThisPeriod || 0) / (userData.subscriptionPlan?.credits || 1) * 100} 
                  className="h-2" 
                />
              </div>

              {/* Credits Grid */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border p-3">
                  <div className="text-xs font-medium text-muted-foreground">Available Credits</div>
                  <div className="mt-1 text-2xl font-bold">{(userData.credits?.availableCredits || 0)}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs font-medium text-muted-foreground">Monthly Credits</div>
                  <div className="mt-1 text-2xl font-bold">{userData.subscriptionPlan?.credits}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs font-medium text-muted-foreground">Last Reset</div>
                  <div className="mt-1 text-lg font-bold">{formatDate(userData.credits?.subscriptionRenewsAt || null)}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs font-medium text-muted-foreground">Account Status</div>
                  <div className="mt-1 text-lg font-bold">
                    <Badge variant={userData.user?.is_user_active ? "default" : "destructive"}>
                      {userData.user?.is_user_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
