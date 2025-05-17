import { redirect } from "next/navigation"
import { LogoutButton } from "@/components/logout-button"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { User } from "lucide-react"
import md5 from 'md5'



export default async function AccountPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()

  if (error || !data?.user) {
    redirect("/auth/login")
  }

  const user = data.user

  // Fetch subscription metadata from public.users
  const { data: userMetadata } = await supabase
    .from('users')
    .select('plan, subscription_status, can_bulk_upload, stripe_customer_id, created_at')
    .eq('id', user.id)
    .single();


  // Format date strings for better readability
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString()
  }

  // Helper to check if an object has properties
  const hasProperties = (obj) => obj && Object.keys(obj).length > 0

  const email = user.email?.trim().toLowerCase()
  const hash = md5(email)
  const gravatarUrl = `https://www.gravatar.com/avatar/${hash}?d=identicon`

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
                <img
                  src={gravatarUrl}
                  alt="User avatar"
                  className="rounded-full w-full h-full object-cover"
                />
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

                {userMetadata && (
                  <div>
                    <h3 className="text-lg font-medium">Subscription Info</h3>
                    <Separator className="my-2" />
                    <dl className="grid grid-cols-1 gap-2 text-sm">
                      <div className="flex justify-between py-1">
                        <dt className="font-medium text-muted-foreground">Plan</dt>
                        <dd>{userMetadata.plan || 'Free'}</dd>
                      </div>
                      <div className="flex justify-between py-1">
                        <dt className="font-medium text-muted-foreground">Subscription Status</dt>
                        <dd>{userMetadata.subscription_status || 'inactive'}</dd>
                      </div>
                      <div className="flex justify-between py-1">
                        <dt className="font-medium text-muted-foreground">Bulk Upload</dt>
                        <dd>{userMetadata.can_bulk_upload ? 'Enabled' : 'Disabled'}</dd>
                      </div>
                      <div className="flex justify-between py-1">
                        <dt className="font-medium text-muted-foreground">Stripe Customer ID</dt>
                        <dd>{userMetadata.stripe_customer_id || 'Not assigned'}</dd>
                      </div>
                      <div className="flex justify-between py-1">
                        <dt className="font-medium text-muted-foreground">User Record Created</dt>
                        <dd>{formatDate(userMetadata.created_at)}</dd>
                      </div>
                    </dl>
                  </div>
                )}

                {hasProperties(user.app_metadata) && (
                  <div>
                    <h3 className="text-lg font-medium">App Metadata</h3>
                    <Separator className="my-2" />
                    <pre className="bg-muted p-3 rounded-md text-xs overflow-auto max-h-32">
                      {JSON.stringify(user.app_metadata, null, 2)}
                    </pre>
                  </div>
                )}

                {hasProperties(user.user_metadata) && (
                  <div>
                    <h3 className="text-lg font-medium">User Metadata</h3>
                    <Separator className="my-2" />
                    <pre className="bg-muted p-3 rounded-md text-xs overflow-auto max-h-32">
                      {JSON.stringify(user.user_metadata, null, 2)}
                    </pre>
                  </div>
                )}

                {hasProperties(user.identities) && (
                  <div>
                    <h3 className="text-lg font-medium">Identities</h3>
                    <Separator className="my-2" />
                    <pre className="bg-muted p-3 rounded-md text-xs overflow-auto max-h-32">
                      {JSON.stringify(user.identities, null, 2)}
                    </pre>
                  </div>
                )}



                {hasProperties(userMetadata) && (
                  <div>
                    <h3 className="text-lg font-medium">Subscription Info Json</h3>
                    <Separator className="my-2" />
                    <pre className="bg-muted p-3 rounded-md text-xs overflow-auto max-h-32">
                      {JSON.stringify(userMetadata, null, 2)}
                    </pre>
                  </div>
                )}


                {hasProperties(user) && (
                  <div>
                    <h3 className="text-lg font-medium">Entire User Object</h3>
                    <Separator className="my-2" />
                    <pre className="bg-muted p-3 rounded-md text-xs overflow-auto max-h-32">
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
