import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { UsageTable } from "@/components/usage-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getUserData } from "@/lib/user"


export default async function Page() {
  const userData = await getUserData()

  if (!userData) {
    return
  }

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
                    <Badge variant={userData.user?.is_subscription_active ? "default" : "destructive"}>
                      {userData.subscriptionPlan?.name || 'No Active Plan'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Credits Used:</span>
                    <span className="font-medium">{userData.credits?.usedThisPeriod}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Total Credits:</span>
                    <span className="font-medium">{userData.credits?.availableCredits|| 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Usage Chart */}
          <div className="px-4 lg:px-6">
            <ChartAreaInteractive usageLogs={userData?.usageLogs || []} />
          </div>

          {/* Recent Usage Table */}
          <div className="px-4 lg:px-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <UsageTable data={(userData?.usageLogs || []).map(log => ({ ...log, usage_type: log.usage_type || '' }))} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
