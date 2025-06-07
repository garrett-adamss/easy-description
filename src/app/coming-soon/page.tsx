'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Mail } from 'lucide-react'

export default function ComingSoonPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      // Insert the email directly into Supabase (no select needed)
      const { error } = await supabase
        .from('email_list')
        .insert({ email })

      if (error) {
        // Handle duplicate email error
        if (error.code === '23505') {
          throw new Error('Email already registered')
        }
        throw new Error('Failed to save email')
      }

      setEmail('')
      setShowSuccessModal(true)
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('An unexpected error occurred')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md mx-auto text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-white">Coming Soon</h1>
          <p>We&apos;re working on something great. Leave your email to get notified.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <Input 
            type="email" 
            placeholder="your@email.com" 
            className="w-full text-center" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />
          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Submitting...' : 'Notify Me'}
          </Button>
        </form>
      </div>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-900 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-8 h-8 text-green-400" />
            </div>
            <DialogTitle className="text-2xl text-white">You&apos;re all set!</DialogTitle>
            <DialogDescription className="text-base pt-2">
              Thanks for signing up. We&apos;ll notify you when we launch.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center mt-6">
            <Button onClick={() => setShowSuccessModal(false)} className="w-full">
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 