/* eslint-disable @typescript-eslint/no-unused-vars */
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { SiteHeader } from "@/components/site-header"
import { UsageTable } from "@/components/usage-table"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User } from "@supabase/supabase-js"

export default async function Page() {
  const supabase = await createClient()
  
  // Get current user - no need to check for null since middleware handles auth
  const { data: { user: authUser } } = await supabase.auth.getUser()
  // Type assertion since middleware ensures user exists
  const user = authUser as User

  // Get user details with subscription info
  const { data: userDetails, error: userError } = await supabase
    .from('users')
    .select(`
      *,
      subscriptions!active_subscription_id (
        *,
        subscription_plans (*)
      )
    `)
    .eq('auth_user_id', user.id)
    .single()

  if (userError || !userDetails) {
    throw new Error('Failed to fetch user details')
  }

  // Get recent usage logs
  const { data: recentUsage } = await supabase
    .from('usage_logs')
    .select('*')
    .eq('user_id', userDetails.id)
    .order('created_at', { ascending: false })
    .limit(10)

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          {/* Subscription Status Card */}
          <div className="px-4 lg:px-6">
            <Card>
              <CardHeader>
                <CardTitle>Subscription Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <span>Current Plan:</span>
                    <Badge variant={userDetails.is_subscription_active ? "default" : "destructive"}>
                      {userDetails.subscriptions?.subscription_plans?.name || 'No Active Plan'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Credits Remaining:</span>
                    <span className="font-medium">{userDetails.credits_remaining || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Monthly Credits:</span>
                    <span className="font-medium">{userDetails.monthly_credits || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Usage Chart */}
          <div className="px-4 lg:px-6">
            <ChartAreaInteractive />
          </div>

          {/* Recent Usage Table */}
          <div className="px-4 lg:px-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <UsageTable data={recentUsage || []} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
