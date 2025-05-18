import { createClient } from "@/lib/supabase/server"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import md5 from 'md5'
import { User } from '@supabase/supabase-js'

interface DashboardLayoutProps {
  children: React.ReactNode
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface UserMetadata {
  id: string
  is_subscription_active: boolean
  [key: string]: any
}

interface CombinedUser extends User {
  avatar: string
  [key: string]: any
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) throw error || new Error('User not found')

  const { data: userMetadata } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!userMetadata?.is_subscription_active) {
    throw error || new Error('Subscription not active or found')
  }

  const email = user.email?.trim().toLowerCase()
  const hash = md5(email || '')
  const gravatarUrl = `https://www.gravatar.com/avatar/${hash}?d=identicon`

  // ✅ Combine auth user + users table metadata
  const combinedUser: CombinedUser = {
    ...user,
    ...userMetadata,
    avatar: gravatarUrl,
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar user={combinedUser} variant="inset" />
      <SidebarInset>
        <SiteHeader />
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
