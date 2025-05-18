/* eslint-disable @typescript-eslint/no-unused-vars */
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { SiteHeader } from "@/components/site-header"
import { UsageTable } from "@/components/usage-table"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default async function Page() {
  const supabase = createServerComponentClient({ cookies })
  
  // Get current user
  const { data: { user: authUser } } = await supabase.auth.getUser()
  
  if (!authUser) {
    throw new Error('User not found')
  }

  // Get user details with subscription info
  const { data: user, error: userError } = await supabase
    .from('users')
    .select(`
      *,
      subscriptions!active_subscription_id (
        *,
        subscription_plans (*)
      )
    `)
    .eq('auth_user_id', authUser.id)
    .single()

  if (userError || !user) {
    throw userError || new Error('User not found')
  }

  // Check if user doesn't has an active subscription
  if (!user.is_subscription_active) {
    throw new Error('Subscription not active or found')
  }

  // Get recent usage logs
  const { data: recentUsage } = await supabase
    .from('usage_logs')
    .select('*')
    .eq('user_id', user.id)
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
                    <Badge variant={user.is_subscription_active ? "default" : "destructive"}>
                      {user.subscriptions?.subscription_plans?.name || 'No Active Plan'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Credits Remaining:</span>
                    <span className="font-medium">{user.credits_remaining || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Monthly Credits:</span>
                    <span className="font-medium">{user.monthly_credits || 0}</span>
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
