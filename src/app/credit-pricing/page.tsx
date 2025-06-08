// price_1RO9awBSFWoGr8GMlDFFI2J9
// price_1ROsTZBSFWoGr8GM3So2Mrk0
// price_1ROsSwBSFWoGr8GMm6DnBShN
"use client"

import { useRouter, usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { PricingCard } from "@/components/pricing-card"

const CREDIT_PRICES = [
  {
    id: "price_credit_small", // Placeholder Stripe Price ID for 100 credits
    label: "Mini Top-Up	",
    price: "$10",
    period: "one-time",
    description: "Perfect for occasional boosts",
    features: ["30 Credits", "Instant Delivery", "No Expiry"],
    buttonText: "Buy Now",
  },
  {
    id: "price_credit_medium", // Placeholder Stripe Price ID for 500 credits
    label: "Backlog Boost",
    price: "$24",
    period: "one-time",
    description: "Great for regular usage",
    features: ["30 Credits", "Instant Delivery", "No Expiry", "5% Bonus Credits"],
    buttonText: "Buy Now",
  },
  {
    id: "price_credit_large", // Placeholder Stripe Price ID for 1200 credits
    label: "Power Pack",
    price: "$45",
    period: "one-time",
    popular: true,
    description: "Best value for power users",
    features: ["70 Credits", "Instant Delivery", "No Expiry", "10% Bonus Credits", "Priority Support"],
    buttonText: "Go Big",
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

  const handleBuyCredits = async (priceId: string) => {

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
        console.error('No checkout URL received from API for credits')
      }
    } catch (error) {
      console.error('Error during checkout:', error)
    }
  }

  return (
    <div className="container mx-auto py-16 px-4 md:px-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-3">Flexible Credit Packs</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Top up your account with credits for additional usage.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {CREDIT_PRICES.map((plan) => (
          <PricingCard key={plan.id} {...plan} onClick={() => handleBuyCredits(plan.id)} />
        ))}
      </div>

      <div className="mt-16 text-center">
        <h2 className="text-2xl font-semibold mb-4">Questions about credits?</h2>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
          Check our FAQ or contact support for more information.
        </p>
        <Button variant="outline" size="lg">
          Contact Support
        </Button>
      </div>
    </div>
  )
}