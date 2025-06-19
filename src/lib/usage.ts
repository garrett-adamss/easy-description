import { createClient } from '@/lib/supabase/server'
import { getUserData } from '@/lib/user'

export async function addUsageLog(
  description: string,
  credits_used: number = 1,
  usage_type?: string
) {
  try {
    const supabase = await createClient()
    
    // Get user data to extract user_id and auth_user_id
    const userData = await getUserData()
    
    if (!userData.user || !userData.authUser) {
      throw new Error('User not found or not authenticated')
    }

    // Insert usage log
    const { data, error } = await supabase
      .from('usage_logs')
      .insert({
        user_id: userData.user.id,
        auth_user_id: userData.authUser.id,
        description,
        credits_used,
        usage_type,
        is_deleted: false
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Error adding usage log: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error('Error in addUsageLog:', error)
    throw error
  }
}