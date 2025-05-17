/* eslint-disable react/no-unescaped-entities */
import Link from "next/link"
import { ArrowLeft, MessageSquare, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function SubscriptionCancelledPage() {
  return (
    <div className="container max-w-3xl mx-auto py-16 px-4 md:px-6">
      <div className="flex flex-col items-center text-center mb-8">
        <div className="rounded-full bg-muted p-6 mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-muted-foreground"
          >
            <path d="M17 18a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v9Z" />
            <path d="m17 9-6 6" />
            <path d="m11 9 6 6" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">We're Sad to See You Go</h1>
        <p className="text-muted-foreground max-w-md">
          Your subscription has been successfully cancelled. We appreciate the time you spent with us.
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Subscription Details</CardTitle>
          {/* <CardDescription>Your subscription access and information</CardDescription> */}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Access Period</p>
            <p className="text-sm text-muted-foreground">
              You'll continue to have access to your subscription benefits until the end of your current billing period.
            </p>
          </div>
          {/* <Separator /> */}
          <div className="space-y-2">
            {/* <p className="text-sm font-medium">Account Status</p> */}
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span>
              <p className="text-sm">Your premium features will be locked after the next billing cycle</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 sm:flex-row sm:justify-between sm:space-x-0 sm:space-y-0">
          <Button variant="outline" size="sm" asChild>
            <Link href="/pricing">
              <RefreshCw className="mr-2 h-4 w-4" />
              Resubscribe
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/account">View Account</Link>
          </Button>
        </CardFooter>
      </Card>

      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Before You Go...</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            We'd love to know why you're leaving so we can improve our service.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MessageSquare className="h-5 w-5" />
                Share Your Feedback
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Tell us what we could do better or why you decided to cancel.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/feedback">Give Feedback</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                  <polyline points="14 2 14 8 20 8" />
                  <path d="M12 18v-6" />
                  <path d="M8 15h8" />
                </svg>
                Need Help?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                If you're having issues or need assistance, our support team is here to help.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/support">Contact Support</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      <div className="mt-12 text-center">
        <Button variant="ghost" asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Return to Homepage
          </Link>
        </Button>
      </div>
    </div>
  )
}
