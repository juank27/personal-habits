'use client'

import { useEffect, useState } from 'react'
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns'
import { createClient } from '@/lib/supabase/client'
import { processHabitsWithLogs, formatDateForDB } from '@/lib/habits'
import { DashboardHeader } from '@/components/dashboard-header'
import { WeekCalendar } from '@/components/week-calendar'
import { HabitList } from '@/components/habit-list'
import { EmptyHabits } from '@/components/empty-habits'
import type { Habit, HabitLog, HabitWithLogs } from '@/lib/types'

export default function DashboardPage() {
  const [displayName, setDisplayName] = useState<string>('there')
  const [weekDays, setWeekDays] = useState<Date[]>([])
  const [habits, setHabits] = useState<Habit[]>([])
  const [logs, setLogs] = useState<HabitLog[]>([])
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return today
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          setError('User not found')
          return
        }

        // Fetch habits
        const { data: habitsData, error: habitsError } = await supabase
          .from('habits')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true })

        if (habitsError) throw habitsError

        // Fetch logs for the current week
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const weekStart = startOfWeek(today, { weekStartsOn: 1 })
        const weekEnd = endOfWeek(today, { weekStartsOn: 1 })

        const { data: logsData, error: logsError } = await supabase
          .from('habit_logs')
          .select('*')
          .eq('user_id', user.id)
          .gte('completed_at', format(weekStart, 'yyyy-MM-dd'))
          .lte('completed_at', format(weekEnd, 'yyyy-MM-dd'))

        if (logsError) throw logsError

        // Fetch profile for display name
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('id', user.id)
          .single()

        if (profileError && profileError.code !== 'PGRST116') throw profileError

        const weekDaysArray = eachDayOfInterval({ start: weekStart, end: weekEnd })
        setDisplayName(profile?.display_name || user.email?.split('@')[0] || 'there')
        setHabits((habitsData as Habit[]) || [])
        setLogs((logsData as HabitLog[]) || [])
        setWeekDays(weekDaysArray)
      } catch (err) {
        console.error('[v0] Error loading data:', err)
        setError('Failed to load habits')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const habitsWithLogs = processHabitsWithLogs(
    habits,
    logs
  ).map((habit) => ({
    ...habit,
    isCompletedToday: isSameDay(selectedDate, new Date())
      ? habit.isCompletedToday
      : habit.logs.some((log) => isSameDay(new Date(log.completed_at), selectedDate)),
  }))

  if (loading) {
    return (
      <main className="max-w-lg mx-auto px-4 pt-6">
        <p className="text-muted-foreground">Loading...</p>
      </main>
    )
  }

  if (error) {
    return (
      <main className="max-w-lg mx-auto px-4 pt-6">
        <p className="text-muted-foreground">{error}</p>
      </main>
    )
  }

  return (
    <main className="max-w-lg mx-auto px-4 pt-6">
      <DashboardHeader displayName={displayName} />
      {weekDays.length > 0 && (
        <WeekCalendar 
          days={weekDays} 
          habits={habitsWithLogs}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
        />
      )}
      
      {habitsWithLogs.length === 0 ? (
        <EmptyHabits />
      ) : (
        <HabitList habits={habitsWithLogs} selectedDate={selectedDate} />
      )}
    </main>
  )
}
