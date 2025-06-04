import Link from "next/link"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function PurchaseErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="mx-auto max-w-md text-center">
        <CardContent className="pt-6">
          <div className="mb-4 flex justify-center">
            <AlertCircle className="h-16 w-16 text-red-500" />
          </div>

          <h1 className="mb-2 text-2xl font-bold">Payment Unsuccessful</h1>

          <p className="mb-6 text-muted-foreground">
            We encountered an issue processing your payment. This could be due to insufficient funds, an expired card,
            or a temporary system error.
          </p>

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="gap-2">
              <Link href="/pricing">Try Again</Link>
            </Button>

            {/* <Button asChild variant="outline" size="lg">
              <Link href="/contact-support">Contact Support</Link>
            </Button> */}
          </div>

          <div className="mt-6 rounded-lg bg-muted p-4 text-left text-sm">
            <p className="font-medium">Common reasons for payment failures:</p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
              <li>Insufficient funds in your account</li>
              <li>Incorrect card details entered</li>
              <li>Your card issuer declined the transaction</li>
              <li>Temporary technical issue</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}