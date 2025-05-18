"use client"

import Link from "next/link"
import { Package, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect, useState } from "react"
import type { User } from '@supabase/auth-helpers-nextjs'

export default function Navbar() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getUser() {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setUser(session?.user || null)
      setLoading(false)

      // Set up auth state listener
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event: string, session) => {
        setUser(session?.user || null)
      })

      return () => subscription.unsubscribe()
    }

    getUser()
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  return (

    // <header className="sticky top-0 z-50 border-b w-full bg-background">
    <header className="border-b w-full bg-background">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
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
            <Link href="/account" className="text-sm font-medium hover:underline underline-offset-4">
              Account
            </Link>
          </nav>
          <Button variant="outline" size="sm" onClick={handleSignOut} className="flex items-center gap-1">
            {/* <LogOut className="h-4 w-4 mr-1" /> */}
            Sign Out
          </Button>
          {!loading &&
            (user ? (
              <Button variant="outline" size="sm" onClick={handleSignOut} className="flex items-center gap-1">
                <LogOut className="h-4 w-4 mr-1" />
                Sign Out
              </Button>
            ) : (
              <Button
                variant="default"
                onClick={() => router.push("/auth/login")}
                className="flex items-center gap-1"
              >
                {/* <LogIn className="h-4 w-4 mr-1" /> */}
                Sign Up
              </Button>
            ))}
        </div>
      </div>
    </header>
  )
}