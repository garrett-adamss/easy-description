// price_1RO9awBSFWoGr8GMlDFFI2J9
// price_1ROsTZBSFWoGr8GM3So2Mrk0
// price_1ROsSwBSFWoGr8GMm6DnBShN
"use client"

import { useRouter, usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { User } from '@supabase/supabase-js'
import { PricingCard } from "@/components/pricing-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const PRICES = [
  {
    id: "price_1RO9awBSFWoGr8GMlDFFI2J9",
    label: "Starter",
    price: "$9",
    period: "month",
    description: "Perfect for individuals and small projects",
    features: ["4 credits / month", "1GB storage", "Basic analytics", "Email support"],
    buttonText: "Get Started",
  },
  {
    id: "price_1ROsTZBSFWoGr8GM3So2Mrk0",
    label: "Pro",
    price: "$19",
    period: "month",
    description: "Ideal for growing businesses and teams",
    popular: true,
    features: [
      "Unlimited projects",
      "10GB storage",
      "Advanced analytics",
      "Priority support",
      "Team collaboration",
      "Custom integrations",
    ],
    buttonText: "Get Pro",
  },
  {
    id: "price_1ROsSwBSFWoGr8GMm6DnBShN",
    label: "Enterprise",
    price: "$39",
    period: "month",
    description: "For large organizations with advanced needs",
    features: [
      "Unlimited everything",
      "100GB storage",
      "Enterprise analytics",
      "Dedicated support",
      "Advanced security",
      "Custom development",
      "SLA guarantees",
    ],
    buttonText: "Contact Sales",
  },
]

export default function PricingPage() {
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
        body: JSON.stringify({ priceId, type: 'subscription' }),
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
        {PRICES.map((plan) => (
          <PricingCard
            key={plan.id}
            {...plan}
            onClick={handleSubscribe}
          />
        ))}

      </div>

      <div className="mt-16 text-center">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Need more credits?</CardTitle>
            <CardDescription className="text-muted-foreground">
              You can purchase additional credits in bulk to extend your usage.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Please note that a valid subscription is required to buy additional credits.
            </p>
          </CardContent>
        </Card>
      </div>
      
    </div>
  )
}