import { createClient } from '@/lib/supabase/server'
import { format, subDays } from 'date-fns'
import { processHabitsWithLogs } from '@/lib/habits'
import { DashboardHeader } from '@/components/dashboard-header'
import { DashboardContent } from '@/components/dashboard-content'
import { EmptyHabits } from '@/components/empty-habits'
import type { Habit, HabitLog } from '@/lib/types'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <main className="max-w-lg mx-auto px-4 pt-6">
        <p className="text-muted-foreground">Loading...</p>
      </main>
    )
  }

  // Fetch habits
  const { data: habits } = await supabase
    .from('habits')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  // Fetch logs for the last 90 days to support carousel navigation
  const today = new Date()
  const ninetyDaysAgo = subDays(today, 90)

  const { data: logs } = await supabase
    .from('habit_logs')
    .select('*')
    .eq('user_id', user.id)
    .gte('completed_at', format(ninetyDaysAgo, 'yyyy-MM-dd'))
    .lte('completed_at', format(today, 'yyyy-MM-dd'))

  // Fetch profile for display name
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', user.id)
    .single()

  const habitsWithLogs = processHabitsWithLogs(
    (habits as Habit[]) || [],
    (logs as HabitLog[]) || []
  )

  const displayName = profile?.display_name || user.email?.split('@')[0] || 'there'

  return (
    <main className="max-w-lg mx-auto px-4 pt-6">
      <DashboardHeader displayName={displayName} />

      {habitsWithLogs.length === 0 ? (
        <EmptyHabits />
      ) : (
        <DashboardContent habits={habitsWithLogs} />
      )}
    </main>
  )
}
