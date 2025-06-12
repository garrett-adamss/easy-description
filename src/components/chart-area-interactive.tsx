"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

export const description = "An interactive area chart"

const chartConfig = {
  credits: {
    label: "Credits Used",
    color: "var(--primary)",
  },
} satisfies ChartConfig

type UsageLog = {
  id: string
  description: string
  credits_used: number
  usage_type: string | null
  created_at: string
}

type ChartAreaInteractiveProps = {
  usageLogs: UsageLog[]
}

export function ChartAreaInteractive({ usageLogs }: ChartAreaInteractiveProps) {
  const chartData = React.useMemo(() => {
    // Group usage logs by date and sum credits
    const groupedData = usageLogs.reduce((acc, log) => {
      const date = new Date(log.created_at).toISOString().split('T')[0] // Get YYYY-MM-DD format
      
      if (!acc[date]) {
        acc[date] = {
          date,
          credits: 0
        }
      }
      
      acc[date].credits += log.credits_used
      
      return acc
    }, {} as Record<string, { date: string; credits: number }>)

    // Convert to array and sort by date
    return Object.values(groupedData).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )
  }, [usageLogs])

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Credit Usage Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center">
            <div className="text-muted-foreground">No usage data available</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Credit Usage Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            data={chartData}
            margin={{
              left: 0,
              right: 10,
              top: 10,
              bottom: 0,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => new Date(value).toLocaleDateString()}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.toString()}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Area
              dataKey="credits"
              type="monotone"
              fill="var(--color-credits)"
              fillOpacity={0.4}
              stroke="var(--color-credits)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
