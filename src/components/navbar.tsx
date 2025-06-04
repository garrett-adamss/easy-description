import Link from "next/link"
import { Package } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { AuthButtons } from "./auth-buttons"
import { DashboardAlert } from "./dashboard-alert"

export default async function Navbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <>
      <header className="border-b w-full bg-background sticky top-0">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6 w-full">
          <div className="flex items-center gap-2 font-bold">
            <Link href="/" className="flex items-center gap-2">
              <Package className="h-6 w-6" />
              <span>SaaS Starter</span>
            </Link>
          </div>
          <div className="flex items-center">
            <nav className="flex gap-4 sm:gap-6 mr-4">
              <Link href="/pricing" className="text-sm font-medium hover:underline underline-offset-4">
                Pricing
              </Link>
              <Link href="/dashboard" className="text-sm font-medium hover:underline underline-offset-4">
                Dashboard
              </Link>
              <Link href="/docs" className="text-sm font-medium hover:underline underline-offset-4">
                Docs
              </Link>
              {user && (
                <Link href="/account" className="text-sm font-medium hover:underline underline-offset-4">
                  Account
                </Link>
              )}
            </nav>
            <AuthButtons user={user} />
          </div>
        </div>
      </header>
      <DashboardAlert user={user} />
    </>
  )
}