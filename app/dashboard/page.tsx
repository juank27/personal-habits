import { createClient } from '@/lib/supabase/server'
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns'
import { processHabitsWithLogs } from '@/lib/habits'
import { DashboardHeader } from '@/components/dashboard-header'
import { WeekCalendar } from '@/components/week-calendar'
import { HabitList } from '@/components/habit-list'
import { EmptyHabits } from '@/components/empty-habits'
import type { Habit, HabitLog } from '@/lib/types'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    // This should not happen as the middleware should redirect
    // But as a fallback, show something
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

  // Fetch logs for the current week
  const today = new Date()
  const weekStart = startOfWeek(today, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 })

  const { data: logs } = await supabase
    .from('habit_logs')
    .select('*')
    .eq('user_id', user.id)
    .gte('completed_at', format(weekStart, 'yyyy-MM-dd'))
    .lte('completed_at', format(weekEnd, 'yyyy-MM-dd'))

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

  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })
  const displayName = profile?.display_name || user.email?.split('@')[0] || 'there'

  return (
    <main className="max-w-lg mx-auto px-4 pt-6">
      <DashboardHeader displayName={displayName} />
      <WeekCalendar 
        days={weekDays} 
        habits={habitsWithLogs} 
      />
      
      {habitsWithLogs.length === 0 ? (
        <EmptyHabits />
      ) : (
        <HabitList habits={habitsWithLogs} />
      )}
    </main>
  )
}
