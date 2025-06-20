'use client'

import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function SignUpForm({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const checkAllowList = async (email: string) => {
    const supabase = createClient()
    const domain = email.split('@')[1]
    
    // Check if email or domain exists in allow_list
    const { data, error } = await supabase
      .from('allow_list')
      .select('*')
      .or(`email.eq.${email},domain.eq.${domain}`)
      .limit(1)
    
    if (error) {
      console.error('Allow list check error:', error)
      throw new Error('Failed to verify authorization')
    }
    
    return data && data.length > 0
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (password !== repeatPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    try {
      // Check allow list if enabled
      const isAllowListEnabled = process.env.NEXT_PUBLIC_ENABLE_ALLOW_LIST === 'true'
      
      if (isAllowListEnabled) {
        console.log('Checking allow list for email:', email)
        const isAuthorized = await checkAllowList(email)
        
        if (!isAuthorized) {
          setError('You are not authorized to sign up with this email.')
          setIsLoading(false)
          return
        }
      }

      console.log('Attempting signup with email:', email)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
          data: {
            email_confirmed: false
          }
        },
      })
      
      if (error) {
        console.error('Signup error details:', error)
        throw error
      }
      
      console.log('Signup response:', data)
      router.push('/auth/sign-up-success')
    } catch (error: unknown) {
      console.error('Signup error:', error)
      if (error instanceof Error) {
        setError(`Error: ${error.message}`)
      } else if (typeof error === 'object' && error !== null) {
        setError(`Error: ${JSON.stringify(error)}`)
      } else {
        setError('An unexpected error occurred')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Sign up</CardTitle>
          <CardDescription>Create a new account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="repeat-password">Repeat Password</Label>
                </div>
                <Input
                  id="repeat-password"
                  type="password"
                  required
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Creating an account...' : 'Sign up'}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Already have an account?{' '}
              <Link href="/auth/login" className="underline underline-offset-4">
                Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
