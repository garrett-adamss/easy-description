'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AppRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    const productUrl = process.env.NEXT_PUBLIC_PRODUCT_URL
    
    if (productUrl) {
      // Redirect to the product URL
      window.location.href = productUrl
    } else {
      // Fallback if env variable is not set
      console.error('NEXT_PUBLIC_PRODUCT_URL environment variable is not set')
      router.push('/')
    }
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  )
}
