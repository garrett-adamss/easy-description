import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies })

  // Get current user
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  // Get user details
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('auth_user_id', authUser.id)
    .single()

  if (!user) {
    return new NextResponse("User not found", { status: 404 })
  }

  // Get usage logs for the last 30 days
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: usageLogs } = await supabase
    .from('usage_logs')
    .select('credits_used, created_at')
    .eq('user_id', user.id)
    .gte('created_at', thirtyDaysAgo.toISOString())
    .order('created_at', { ascending: true })

  // Group usage by date
  const usageByDate = usageLogs?.reduce((acc, log) => {
    const date = new Date(log.created_at).toISOString().split('T')[0]
    acc[date] = (acc[date] || 0) + log.credits_used
    return acc
  }, {} as Record<string, number>)

  // Convert to array format for the chart
  const chartData = Object.entries(usageByDate || {}).map(([date, credits]) => ({
    date,
    credits,
  }))

  return NextResponse.json(chartData)
} 