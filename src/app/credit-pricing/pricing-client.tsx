"use client"

import { useRouter, usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { User } from '@supabase/supabase-js'
import { PricingCard } from "@/components/pricing-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Info } from "lucide-react"

type PriceData = {
  id: string
  stripe_price_id: string
  label: string
  price: number
  period: string
  description: string
  popular?: boolean
  features: string[]
  buttonText: string
}

interface PricingPageClientProps {
  prices: PriceData[]
}

export function PricingPageClient({ prices }: PricingPageClientProps) {
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const supabase = createClient()
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [])

  const handleSubscribe = async (priceId: string) => {
    if (!user) {
      router.push(`/auth/login?redirectedFrom=${encodeURIComponent(pathname)}`)
      return
    }

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId, type: 'credit' }),
      })

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }

      const data = await res.json()
      if (data?.url) {
        console.log('Redirecting to Stripe checkout')
        window.location.href = data.url
      } else {
        console.error('No checkout URL received from API')
      }
    } catch (error) {
      console.error('Error during checkout:', error)
    }
  }

  return (
    <div className="container mx-auto py-16 px-4 md:px-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-3">Simple, Transparent Pricing</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Choose the perfect plan for your needs.
          {/* All plans include a 14-day free trial. */}
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {prices.map((plan) => (
          <PricingCard
            key={plan.stripe_price_id}
            {...plan}
            onClick={handleSubscribe}
          />
        ))}
      </div>

      <div className="mt-16 text-center">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold flex justify-center items-center"> <Info className="mr-2 h-6 w-6"/> Important Notice</CardTitle>
            <CardDescription className="text-white">
              An active subscription is required to use and purchase additional credits.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Your credits will be automatically added to your account upon purchase.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 