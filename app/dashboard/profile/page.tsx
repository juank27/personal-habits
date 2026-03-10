import { createClient } from '@/lib/supabase/server'
import { ProfileContent } from '@/components/profile-content'
import type { Habit } from '@/lib/types'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch habits
  const { data: habits } = await supabase
    .from('habits')
    .select('*')
    .eq('user_id', user.id)

  return (
    <ProfileContent
      user={{
        id: user.id,
        email: user.email,
        created_at: user.created_at,
      }}
      profile={profile}
      habits={(habits as Habit[]) || []}
    />
  )
}
