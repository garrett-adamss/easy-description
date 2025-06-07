import Link from "next/link"
import { CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function PurchaseSuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="mx-auto max-w-md text-center">
        <CardContent className="pt-6">
          <div className="mb-4 flex justify-center">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>

          <h1 className="mb-2 text-2xl font-bold">Purchase Successful!</h1>

          <p className="mb-6 text-muted-foreground">
            Congratulations! Your purchase has been completed successfully.
          </p>

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="gap-2">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>

            {/* <Button asChild variant="outline" size="lg">
              <Link href="/products">Continue Shopping</Link>
            </Button> */}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}