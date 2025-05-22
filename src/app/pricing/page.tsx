// price_1RO9awBSFWoGr8GMlDFFI2J9
// price_1ROsTZBSFWoGr8GM3So2Mrk0
// price_1ROsSwBSFWoGr8GMm6DnBShN
"use client"

import { useRouter, usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Check, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import { User } from '@supabase/supabase-js'

const PRICES = [
  {
    id: "price_1RO9awBSFWoGr8GMlDFFI2J9",
    label: "Basic",
    price: "$25",
    period: "month",
    description: "Perfect for individuals and small projects",
    features: ["Up to 3 projects", "1GB storage", "Basic analytics", "Email support"],
    buttonText: "Get Started",
  },
  {
    id: "price_1ROsTZBSFWoGr8GM3So2Mrk0",
    label: "Pro",
    price: "$50",
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
    price: "$100",
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
    console.log('User auth status:', !!user)
    console.log('Attempting to subscribe to price:', priceId)
    
    if (!user) {
      console.log('No authenticated user found, redirecting to login')
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
          <Card
            key={plan.id}
            className={`flex flex-col h-full relative overflow-hidden cursor-pointer group transition-all duration-300 hover:scale-105 ${
              plan.popular ? "border-primary shadow-lg" : ""
            }`}
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              const x = e.clientX - rect.left
              const y = e.clientY - rect.top

              e.currentTarget.style.setProperty("--x", `${x}px`)
              e.currentTarget.style.setProperty("--y", `${y}px`)
            }}
            onClick={() => handleSubscribe(plan.id)}
          >
            <div
              className="absolute pointer-events-none inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background: "radial-gradient(circle 80px at var(--x) var(--y), rgba(255, 255, 255, 0.2), transparent)",
                zIndex: 1,
              }}
            />
            {plan.popular && (
              <Badge className="absolute top-3 right-4 bg-primary hover:bg-primary z-10">Best Value</Badge>
            )}
            <CardHeader className={plan.popular ? "pb-8" : "pb-6"}>
              <CardTitle className="text-2xl">{plan.label}</CardTitle>
              <CardDescription className="pt-1.5">{plan.description}</CardDescription>
              <div className="mt-4 flex items-baseline">
                <span className="text-4xl font-extrabold">{plan.price}</span>
                <span className="ml-1 text-muted-foreground">/{plan.period}</span>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-3">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center">
                    {plan.popular ? (
                      <CheckCircle2 className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
                    ) : (
                      <Check className="h-5 w-5 text-muted-foreground mr-2 flex-shrink-0" />
                    )}
                    <span className={plan.popular ? "font-medium" : ""}>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                variant={plan.popular ? "default" : "outline"}
                size="lg"
              >
                {plan.buttonText}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-16 text-center">
        <h2 className="text-2xl font-semibold mb-4">Need something custom?</h2>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
          Contact our sales team for a custom quote tailored to your specific requirements.
        </p>
        <Button variant="outline" size="lg">
          Contact Sales
        </Button>
      </div>
    </div>
  )
}