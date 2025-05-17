import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import md5 from 'md5'

export default async function DashboardLayout({ children }) {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) redirect('/auth/login')

  const { data: userMetadata } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

    if (!userMetadata?.is_subscription_active) {
      redirect('/pricing')
    }

  const email = user.email?.trim().toLowerCase()
  const hash = md5(email)
  const gravatarUrl = `https://www.gravatar.com/avatar/${hash}?d=identicon`

  // ✅ Combine auth user + users table metadata
  const combinedUser = {
    ...user,
    ...userMetadata,
    avatar: gravatarUrl,
    // name: user.user_metadata?.name || '',
    // avatar: user.user_metadata?.avatar_url || '/placeholder.svg',
  }

  return (
    (<SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)"
        }
      }>
      <AppSidebar user={combinedUser} variant="inset" />
      <SidebarInset>
        <SiteHeader />
        {children}
      </SidebarInset>
    </SidebarProvider>)
  );
}
