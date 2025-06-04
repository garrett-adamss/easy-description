"use client"

import { usePathname, useSearchParams } from "next/navigation"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface DashboardAlertProps {
  user: unknown
}

export function DashboardAlert({ user }: DashboardAlertProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    // Add a small delay before showing the alert
    const timer = setTimeout(() => {
      setIsMounted(true)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  // Only show on home page, if user is logged in, and if ref=login
  if (!user || pathname !== "/" || !isVisible || searchParams.get('ref') !== 'login') {
    return null
  }

  return (
    <div 
      className={`fixed top-12 left-1/2 -translate-x-1/2 z-50 w-1/2 transition-all duration-500 ease-in-out ${
        isMounted ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      }`}
    >
      <Alert className="my-4 relative shadow-lg">
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-2 top-2"
          onClick={() => setIsVisible(false)}
        >
          <X className="h-4 w-4" />
        </Button>
        <AlertTitle className="text-xl">Welcome back!</AlertTitle>
        <AlertDescription className="flex items-center justify-between pt-2">
          <span className="text-md">Navigate to your dashboard to manage your account</span>
          <Button
            variant="default"
            size="sm"
            onClick={() => router.push("/dashboard")}
          >
            Go to Dashboard
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  )
} 