import { createClient } from '@/lib/supabase/server'
import { format, subDays, eachDayOfInterval, parseISO, isSameDay } from 'date-fns'
import { StatsContent } from '@/components/stats-content'
import type { Habit, HabitLog } from '@/lib/types'

export default async function StatsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Fetch all habits
  const { data: habits } = await supabase
    .from('habits')
    .select('*')
    .eq('user_id', user.id)

  // Fetch logs for last 30 days
  const thirtyDaysAgo = subDays(new Date(), 30)
  const { data: logs } = await supabase
    .from('habit_logs')
    .select('*')
    .eq('user_id', user.id)
    .gte('completed_at', format(thirtyDaysAgo, 'yyyy-MM-dd'))

  const habitsData = (habits as Habit[]) || []
  const logsData = (logs as HabitLog[]) || []

  // Calculate overall stats
  const today = new Date()
  const last7Days = eachDayOfInterval({
    start: subDays(today, 6),
    end: today,
  })

  // Calculate completion rate for each of the last 7 days
  const weeklyData = last7Days.map((date) => {
    const dayLogs = logsData.filter((log) => 
      isSameDay(parseISO(log.completed_at), date)
    )
    const uniqueHabitsCompleted = new Set(dayLogs.map((l) => l.habit_id)).size
    const rate = habitsData.length > 0 
      ? Math.round((uniqueHabitsCompleted / habitsData.length) * 100)
      : 0
    return { 
      date: format(date, 'yyyy-MM-dd'),
      dayName: format(date, 'EEE'),
      dayNameEs: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][date.getDay()],
      rate, 
      count: uniqueHabitsCompleted,
      isToday: isSameDay(date, today)
    }
  })

  // Calculate streak for a habit
  const calculateStreak = (habitLogs: HabitLog[]): number => {
    if (habitLogs.length === 0) return 0
    
    const sortedDates = [...new Set(habitLogs.map(l => l.completed_at))]
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
    
    let streak = 0
    let currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0)
    
    for (const dateStr of sortedDates) {
      const logDate = new Date(dateStr)
      logDate.setHours(0, 0, 0, 0)
      
      const diffDays = Math.floor((currentDate.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24))
      
      if (diffDays <= 1) {
        streak++
        currentDate = logDate
      } else {
        break
      }
    }
    
    return streak
  }

  // Calculate stats for each habit
  const habitStats = habitsData.map((habit) => {
    const habitLogs = logsData.filter((log) => log.habit_id === habit.id)
    const streak = calculateStreak(habitLogs)
    const completionRate = Math.min(Math.round((habitLogs.length / 30) * 100), 100)
    return { ...habit, streak, completionRate, totalLogs: habitLogs.length }
  }).sort((a, b) => b.streak - a.streak)

  // Overall stats
  const totalCompletions = logsData.length
  const avgCompletionRate = habitsData.length > 0
    ? Math.round((totalCompletions / (habitsData.length * 30)) * 100)
    : 0
  const bestStreak = habitStats.length > 0 
    ? Math.max(...habitStats.map((h) => h.streak))
    : 0
  const currentWeekCompletion = weeklyData.reduce((sum, d) => sum + d.count, 0)

  return (
    <StatsContent
      weeklyData={weeklyData}
      habitStats={habitStats}
      avgCompletionRate={Math.min(avgCompletionRate, 100)}
      bestStreak={bestStreak}
      currentWeekCompletion={currentWeekCompletion}
      totalHabits={habitsData.length}
    />
  )
}
