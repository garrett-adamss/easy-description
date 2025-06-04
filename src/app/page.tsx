/* eslint-disable react/no-unescaped-entities */
import Link from "next/link"
import { ArrowRight, CheckCircle, CreditCard, ExternalLink, Lock, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="bg-muted/50 py-12 md:py-16 lg:py-24 w-full">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Next.js SaaS Starter Template
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                A complete starter kit with authentication, payments, and user management
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button asChild>
                <Link href="/pricing">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/doc">View Documentation</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Pages Overview */}
      <section className="py-12 md:py-16 w-full">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold tracking-tight">Key Pages</h2>
            <p className="mt-2 text-muted-foreground">
              Explore the main pages of the application and their functionality
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Pricing Page
                </CardTitle>
                <CardDescription>Subscription plans and payment processing</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  The pricing page displays your subscription tiers with a modern, interactive design. It integrates
                  with Stripe for secure payment processing.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/pricing">
                    View Pricing <ExternalLink className="ml-2 h-3.5 w-3.5" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Paywall
                </CardTitle>
                <CardDescription>Premium content for subscribers only</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  The paywall restricts access to premium content. Users must complete payment through Stripe before
                  they can access this protected area.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/paywall">
                    View Paywall <ExternalLink className="ml-2 h-3.5 w-3.5" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5" />
                  Account Page
                </CardTitle>
                <CardDescription>Authentication-required area</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  The protected page requires users to be logged in. It displays the user's Supabase profile information
                  and authentication details.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/account">
                    View Protected <ExternalLink className="ml-2 h-3.5 w-3.5" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* Setup Instructions */}
      <section className="border-t bg-muted/50 py-12 md:py-16 w-full">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold tracking-tight">Setup Instructions</h2>
            <p className="mt-2 text-muted-foreground">Follow these steps to get your application up and running</p>
          </div>

          <Tabs defaultValue="nextjs" className="max-w-3xl mx-auto">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="nextjs">Next.js</TabsTrigger>
              <TabsTrigger value="env">Environment</TabsTrigger>
              <TabsTrigger value="supabase">Supabase</TabsTrigger>
              <TabsTrigger value="stripe">Stripe</TabsTrigger>
            </TabsList>

            <TabsContent value="nextjs" className="mt-6 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Setting Up Next.js</CardTitle>
                  <CardDescription>Get your development environment running</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold">1. Clone the repository</h3>
                    <pre className="bg-muted p-3 rounded-md text-sm overflow-x-auto">
                      git clone https://github.com/yourusername/your-repo.git
                    </pre>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold">2. Install dependencies</h3>
                    <pre className="bg-muted p-3 rounded-md text-sm overflow-x-auto">npm install</pre>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold">3. Start the development server</h3>
                    <pre className="bg-muted p-3 rounded-md text-sm overflow-x-auto">npm run dev</pre>
                  </div>

                  <div className="rounded-md bg-blue-50 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <CheckCircle className="h-5 w-5 text-blue-400" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-blue-700">
                          Your application should now be running at{" "}
                          <span className="font-mono font-bold">http://localhost:3000</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="env" className="mt-6 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Environment Setup</CardTitle>
                  <CardDescription>Configure your environment variables</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold">1. Copy the environment template</h3>
                    <pre className="bg-muted p-3 rounded-md text-sm overflow-x-auto">cp .env.example .env.local</pre>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold">2. Update with your credentials</h3>
                    <pre className="bg-muted p-3 rounded-md text-sm overflow-x-auto">
                      # Supabase NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
                      NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key # Stripe
                      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
                      STRIPE_SECRET_KEY=your-stripe-secret-key STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret # Site
                      URL NEXT_PUBLIC_SITE_URL=http://localhost:3000
                    </pre>
                  </div>

                  <div className="rounded-md bg-amber-50 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <CheckCircle className="h-5 w-5 text-amber-400" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-amber-700">
                          Make sure to restart your development server after updating environment variables.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="supabase" className="mt-6 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Supabase Configuration</CardTitle>
                  <CardDescription>Set up your database and authentication</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold">1. Create a Supabase project</h3>
                    <p className="text-sm">
                      Go to{" "}
                      <a
                        href="https://supabase.com"
                        className="text-blue-600 hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Supabase
                      </a>{" "}
                      and create a new project.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold">2. Set up database tables</h3>
                    <p className="text-sm mb-2">Run the following SQL in the Supabase SQL editor:</p>
                    <pre className="bg-muted p-3 rounded-md text-sm overflow-x-auto">
                      {`-- Create products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  stripe_price_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subscriptions table
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  status TEXT NOT NULL,
  product_id UUID REFERENCES products NOT NULL,
  stripe_subscription_id TEXT,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow public read access to products
CREATE POLICY "Allow public read access to products" 
  ON products FOR SELECT USING (true);

-- Allow users to view their own subscriptions
CREATE POLICY "Users can view own subscriptions" 
  ON subscriptions FOR SELECT USING (auth.uid() = user_id);

-- Allow service role to manage subscriptions
CREATE POLICY "Service role can manage subscriptions" 
  ON subscriptions USING (auth.role() = 'service_role');`}
                    </pre>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold">3. Configure Resend SMTP with Supabase Auth</h3>
                    <ol className="list-decimal pl-5 space-y-2 text-sm">
                      <li>Go to your Supabase project dashboard</li>
                      <li>Navigate to Authentication → Email Templates</li>
                      <li>Click on "Email Settings"</li>
                      <li>Select "Custom SMTP" as the Email Provider</li>
                      <li>
                        Enter your Resend SMTP credentials:
                        <ul className="list-disc pl-5 mt-1">
                          <li>
                            Host: <code>smtp.resend.com</code>
                          </li>
                          <li>
                            Port: <code>465</code>
                          </li>
                          <li>
                            User: <code>resend</code>
                          </li>
                          <li>Password: Your Resend API key</li>
                          <li>Sender Name: Your app name</li>
                          <li>Sender Email: An email from your verified domain</li>
                        </ul>
                      </li>
                      <li>Click "Save" to apply the settings</li>
                    </ol>
                  </div>

                  <div className="rounded-md bg-green-50 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <CheckCircle className="h-5 w-5 text-green-400" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-green-700">
                          Test your authentication flow by signing up a new user to ensure emails are being sent
                          correctly.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="stripe" className="mt-6 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Stripe Integration</CardTitle>
                  <CardDescription>Set up payment processing</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold">1. Create a Stripe account</h3>
                    <p className="text-sm">
                      Sign up at{" "}
                      <a
                        href="https://stripe.com"
                        className="text-blue-600 hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Stripe
                      </a>{" "}
                      if you don't already have an account.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold">2. Create products and prices</h3>
                    <p className="text-sm">
                      In the Stripe dashboard, create products and prices that match your pricing page offerings. Note
                      the price IDs to update in your application.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold">3. Set up webhooks</h3>
                    <p className="text-sm mb-2">For local development, use the Stripe CLI:</p>
                    <pre className="bg-muted p-3 rounded-md text-sm overflow-x-auto">
                      stripe listen --forward-to http://localhost:3000/api/stripe/webhook
                    </pre>
                    <p className="text-sm mt-2">
                      For production, create a webhook endpoint in the Stripe dashboard pointing to:
                    </p>
                    <pre className="bg-muted p-3 rounded-md text-sm overflow-x-auto">
                      https://your-domain.com/api/stripe/webhook
                    </pre>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold">4. Update environment variables</h3>
                    <p className="text-sm">Add your Stripe API keys and webhook secret to your .env.local file.</p>
                  </div>

                  <div className="rounded-md bg-purple-50 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <CheckCircle className="h-5 w-5 text-purple-400" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-purple-700">
                          For detailed testing instructions, visit the{" "}
                          <Link href="/doc" className="font-medium underline">
                            documentation page
                          </Link>
                          .
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>


    </div>
  )
}