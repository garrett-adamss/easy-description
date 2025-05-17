/* eslint-disable react/no-unescaped-entities */
import Link from "next/link"
import { ArrowRight, CheckCircle, Sparkles, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function SubscriptionRenewedPage() {
  return (
    <div className="container max-w-3xl mx-auto py-16 px-4 md:px-6">
      <div className="flex flex-col items-center text-center mb-10">
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-primary/10 rounded-full h-24 w-24 animate-pulse"></div>
          </div>
          <div className="relative rounded-full bg-primary/20 p-6">
            <Sparkles className="h-12 w-12 text-primary" />
          </div>
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome Back!</h1>
        <p className="text-muted-foreground max-w-md">
          We're thrilled to have you with us again.
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-center">Subscription Confirmed</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p>Your subscription has been successfully renewed.</p>
          <p className="text-sm text-muted-foreground mt-2">All premium features are now available.</p>
        </CardContent>
        <CardFooter className="flex justify-center pt-2 pb-6">
          <Button size="lg" asChild>
            <Link href="/dashboard">
              Go to Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
