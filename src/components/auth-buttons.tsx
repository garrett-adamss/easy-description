"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { User } from '@supabase/auth-helpers-nextjs'

interface AuthButtonsProps {
  user: User | null
}

export function AuthButtons({ user }: AuthButtonsProps) {
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  if (user) {
    return (
      <Button
        variant="outline"
        onClick={handleSignOut}
        className="flex items-center gap-1"
      >
        Log Out
      </Button>
    )
  }

  return (
    <div className="flex gap-2">
      <Button
        variant="default"
        onClick={() => router.push("/auth/sign-up")}
        className="flex items-center"
      >
        Sign Up
      </Button>
      <Button
        variant="secondary"
        onClick={() => router.push("/auth/login")}
        className="flex items-center gap-1"
      >
        Log in
      </Button>
    </div>
  )
} 