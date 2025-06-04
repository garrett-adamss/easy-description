import { LogoutButton } from "@/components/logout-button"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { User } from "lucide-react"

export default async function AccountPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()

  if (error || !data?.user) {
    throw error || new Error('User not found')
  }

  const user = data.user

  // Fetch subscription metadata from public.users
  const { data: publicUser } = await supabase
    .from('users')
    .select('*')
    .eq('auth_user_id', user.id)
    .single();

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', publicUser.id)
    .single();

  const { data: subscriptionPlan } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('id', subscription?.plan_id)
    .single();
    
  if (!publicUser) {
    throw new Error('User metadata not found');
  }

  // Format date strings for better readability
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <Card className="max-w-3xl mx-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-2xl font-bold">User Profile</CardTitle>
            <CardDescription>Complete information for your Supabase account</CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="ml-auto">
              {user.role || "authenticated"}
            </Badge>
            <LogoutButton />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex items-center justify-center md:w-1/3">
              <div className="bg-muted rounded-full p-8 w-32 h-32 flex items-center justify-center">
                {user.user_metadata?.avatar_url ? (
                  <img
                    src={user.user_metadata.avatar_url || "/placeholder.svg"}
                    alt="User avatar"
                    className="rounded-full w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-16 h-16 text-muted-foreground" />
                )}
              </div>
            </div>

            <div className="md:w-2/3">
              <div className="grid gap-4">
                <div>
                  <h3 className="text-lg font-medium">Basic Information</h3>
                  <Separator className="my-2" />
                  <dl className="grid grid-cols-1 gap-2 text-sm">
                    <div className="flex justify-between py-1">
                      <dt className="font-medium text-muted-foreground">User ID</dt>
                      <dd className="truncate max-w-[240px]">{user.id}</dd>
                    </div>
                    <div className="flex justify-between py-1">
                      <dt className="font-medium text-muted-foreground">Email</dt>
                      <dd>{user.email || "Not provided"}</dd>
                    </div>
                    <div className="flex justify-between py-1">
                      <dt className="font-medium text-muted-foreground">Phone</dt>
                      <dd>{user.phone || "Not provided"}</dd>
                    </div>
                    <div className="flex justify-between py-1">
                      <dt className="font-medium text-muted-foreground">Email Confirmed</dt>
                      <dd>{user.email_confirmed_at ? "Yes" : "No"}</dd>
                    </div>
                    <div className="flex justify-between py-1">
                      <dt className="font-medium text-muted-foreground">Created At</dt>
                      <dd>{user.created_at ? formatDate(user.created_at) : "Unknown"}</dd>
                    </div>
                    <div className="flex justify-between py-1">
                      <dt className="font-medium text-muted-foreground">Last Sign In</dt>
                      <dd>{user.last_sign_in_at ? formatDate(user.last_sign_in_at) : "Unknown"}</dd>
                    </div>
                  </dl>
                </div>

                {publicUser && (
                  <div>
                    <h3 className="text-lg font-medium">Subscription Info</h3>
                    <Separator className="my-2" />
                    <dl className="grid grid-cols-1 gap-2 text-sm">
                      <div className="flex justify-between py-1">
                        <dt className="font-medium text-muted-foreground">Plan</dt>
                        <dd>{subscriptionPlan?.name || 'None'}</dd>
                      </div>
                      <div className="flex justify-between py-1">
                        <dt className="font-medium text-muted-foreground">Subscription Status</dt>
                        <dd>{publicUser.is_subscription_active}</dd>
                      </div>
                      <div className="flex justify-between py-1">
                        <dt className="font-medium text-muted-foreground">Stripe Customer ID</dt>
                        <dd>{publicUser.stripe_customer_id || 'Not assigned'}</dd>
                      </div>
                      <div className="flex justify-between py-1">
                        <dt className="font-medium text-muted-foreground">Monthly Credits</dt>
                        <dd>{publicUser.monthly_credits}</dd>
                      </div>
                    </dl>
                  </div>
                )}

                {publicUser && (
                  <div>
                    <h3 className="text-lg font-medium">Entire public.user</h3>
                    <Separator className="my-2" />
                    <pre className="bg-muted p-3 rounded-md text-xs overflow-auto max-h-94">
                      {JSON.stringify(publicUser, null, 2)}
                    </pre>
                  </div>
                )}

                {user && (
                  <div>
                    <h3 className="text-lg font-medium">Entire auth.user</h3>
                    <Separator className="my-2" />
                    <pre className="bg-muted p-3 rounded-md text-xs overflow-auto max-h-94">
                      {JSON.stringify(user, null, 2)}
                    </pre>
                  </div>
                )}


              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
