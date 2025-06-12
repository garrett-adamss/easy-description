'use client'

import { Check, CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface PricingCardProps {
  stripe_product_id: string
  label: string
  price: number
  period: string
  description: string
  features: string[]
  buttonText: string
  popular?: boolean
  onClick: (priceId: string) => void
}

export function PricingCard({
  stripe_product_id,
  label,
  price,
  period,
  description,
  features,
  buttonText,
  popular = false,
  onClick,
}: PricingCardProps) {
  return (
    <Card
      key={stripe_product_id}
      className={`flex flex-col h-full relative overflow-hidden cursor-pointer group transition-all duration-300 hover:scale-105 ${popular ? "border-primary shadow-lg" : ""
        }`}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        e.currentTarget.style.setProperty("--x", `${x}px`)
        e.currentTarget.style.setProperty("--y", `${y}px`)
      }}
      onClick={() => onClick(stripe_product_id)}
    >
      <div
        className="absolute pointer-events-none inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: "radial-gradient(circle 80px at var(--x) var(--y), rgba(255, 255, 255, 0.2), transparent)",
          zIndex: 1,
        }}
      />
      {popular && (
        <Badge className="absolute top-3 right-4 bg-primary hover:bg-primary z-10">Best Value</Badge>
      )}
      <CardHeader className={popular ? "pb-8" : "pb-6"}>
        <CardTitle className="text-2xl">{label}</CardTitle>
        <CardDescription className="pt-1.5">{description}</CardDescription>
        <div className="mt-4 flex items-baseline">
          <span className="text-4xl font-extrabold">${price}</span>
          <span className="ml-1 text-muted-foreground">/{period}</span>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <ul className="space-y-3">
          {features.map((feature, i) => (
            <li key={i} className="flex items-center">
              {popular ? (
                <CheckCircle2 className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
              ) : (
                <Check className="h-5 w-5 text-muted-foreground mr-2 flex-shrink-0" />
              )}
              <span className={popular ? "font-medium" : ""}>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          variant={popular ? "default" : "outline"}
          size="lg"
        >
          {buttonText}
        </Button>
      </CardFooter>
    </Card>
  )
}