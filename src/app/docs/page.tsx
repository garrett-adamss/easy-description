"use client"

import { Check, Copy, Terminal } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function StripeDocPage() {
  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl light">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-3">Stripe Integration Guide</h1>
        <p className="text-xl text-muted-foreground">Step-by-step instructions for testing your Stripe payment flow</p>
      </div>

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <CardTitle>Step 1: Set Up Ngrok</CardTitle>
                <CardDescription>Create a secure tunnel to your local development server</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Basic Command</h3>
              <Tabs defaultValue="npx">
                <TabsList className="mb-2">
                  <TabsTrigger value="npx">Using npx</TabsTrigger>
                  <TabsTrigger value="global">Global installation</TabsTrigger>
                </TabsList>
                <TabsContent value="npx">
                  <CodeBlock code="npx ngrok http 3000" />
                </TabsContent>
                <TabsContent value="global">
                  <CodeBlock code="ngrok http 3000" />
                </TabsContent>
              </Tabs>
            </div>

            <Alert>
              <Terminal className="h-4 w-4" />
              <AlertTitle>Expected Output</AlertTitle>
              <AlertDescription className="font-mono text-xs mt-2">
                Forwarding https://359d-174-27-172-17.ngrok-free.app -&gt; http://localhost:3000
              </AlertDescription>
            </Alert>

            <div>
              <p className="text-sm mb-2">Use this forwarding URL as your public base URL for:</p>
              <ul className="list-disc pl-5 space-y-2 text-sm">
                <li>
                  <span className="font-medium">Stripe webhook endpoint:</span>
                  <CodeBlock code="https://359d-174-27-172-17.ngrok-free.app/api/stripe/webhook" />
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <CardTitle>Step 2: Configure Webhook Secret</CardTitle>
                <CardDescription>Set up your environment with the Stripe webhook secret</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="default">
              <AlertTitle className="font-medium">Important</AlertTitle>
              <AlertDescription>Copy the webhook secret from Stripe CLI or dashboard</AlertDescription>
            </Alert>

            <div>
              <h3 className="text-sm font-medium mb-2">Update .env.local:</h3>
              <CodeBlock code="STRIPE_WEBHOOK_SECRET=whsec_..." language="env" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <CardTitle>Step 3: Restart Development Server</CardTitle>
                <CardDescription>Apply your environment changes</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <CodeBlock code="npm run dev" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <CardTitle>Step 4: Test the Payment Flow</CardTitle>
                <CardDescription>Complete a Stripe Checkout and verify webhook delivery</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm">Complete a Stripe Checkout and watch the ngrok terminal for:</p>
            <CodeBlock code="POST /api/stripe/webhook 200 OK" />

            <Alert className="bg-green-50 text-green-800 border-green-200">
              <Check className="h-4 w-4" />
              <AlertTitle>Success Indicator</AlertTitle>
              <AlertDescription>
                When you see this response, it means your webhook was successfully received and processed.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Troubleshooting</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-medium">Webhook Not Receiving Events</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Verify your webhook URL is correctly configured in the Stripe dashboard</li>
                <li>Ensure the webhook secret in your .env.local file matches the one in Stripe</li>
                <li>Check that ngrok is running and the forwarding URL is active</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">Payment Completion Issues</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Use Stripe test cards (e.g., 4242 4242 4242 4242) for testing</li>
                <li>Check your browser console for any JavaScript errors</li>
                <li>Verify your Stripe API keys are correctly set in your environment</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

type CodeBlockProps = {
  code: string;
  language?: string;
};

// Component for displaying copyable code blocks
function CodeBlock({ code, language = "bash" }: CodeBlockProps) {
  return (
    <div className="relative">
      <pre className={`bg-muted p-3 rounded-md text-sm overflow-x-auto language-${language}`}>
        <code>{code}</code>
      </pre>
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-1.5 right-1.5 h-7 w-7 text-muted-foreground hover:text-foreground"
        onClick={() => {
          navigator.clipboard.writeText(code)
        }}
        title="Copy to clipboard"
      >
        <Copy className="h-3.5 w-3.5" />
        <span className="sr-only">Copy code</span>
      </Button>
    </div>
  )
}
