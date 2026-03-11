import { createClient } from '@/lib/supabase/server'
import { format, subDays, eachDayOfInterval, parseISO, isSameDay, startOfWeek, endOfWeek, startOfMonth } from 'date-fns'
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

  // Fetch logs for last 60 days to cover all date ranges
  const sixtyDaysAgo = subDays(new Date(), 60)
  const { data: logs } = await supabase
    .from('habit_logs')
    .select('*')
    .eq('user_id', user.id)
    .gte('completed_at', format(sixtyDaysAgo, 'yyyy-MM-dd'))

  const habitsData = (habits as Habit[]) || []
  const logsData = (logs as HabitLog[]) || []

  const today = new Date()

  // Helper function to calculate data for a date interval
  const calculateDataForInterval = (days: Date[]) => {
    return days.map((date) => {
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
  }

  // Last 7 days (including today)
  const last7Days = eachDayOfInterval({
    start: subDays(today, 6),
    end: today,
  })
  const weeklyData = calculateDataForInterval(last7Days)

  // Last week (Monday to Sunday of previous week)
  const lastWeekStart = startOfWeek(subDays(today, 7), { weekStartsOn: 1 })
  const lastWeekEnd = endOfWeek(subDays(today, 7), { weekStartsOn: 1 })
  const lastWeekDays = eachDayOfInterval({
    start: lastWeekStart,
    end: lastWeekEnd,
  })
  const lastWeekData = calculateDataForInterval(lastWeekDays)

  // This month (from start of month to today)
  const monthStart = startOfMonth(today)
  const monthDays = eachDayOfInterval({
    start: monthStart,
    end: today,
  })
  const monthlyData = calculateDataForInterval(monthDays)

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

  // Calculate stats for each habit (using last 30 days for habit stats)
  const thirtyDaysAgo = subDays(today, 30)
  const last30DaysLogs = logsData.filter(log => 
    new Date(log.completed_at) >= thirtyDaysAgo
  )

  const habitStats = habitsData.map((habit) => {
    const habitLogs = last30DaysLogs.filter((log) => log.habit_id === habit.id)
    const streak = calculateStreak(logsData.filter((log) => log.habit_id === habit.id))
    const completionRate = Math.min(Math.round((habitLogs.length / 30) * 100), 100)
    return { ...habit, streak, completionRate, totalLogs: habitLogs.length }
  }).sort((a, b) => b.streak - a.streak)

  // Overall stats
  const totalCompletions = last30DaysLogs.length
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
      lastWeekData={lastWeekData}
      monthlyData={monthlyData}
      habitStats={habitStats}
      avgCompletionRate={Math.min(avgCompletionRate, 100)}
      bestStreak={bestStreak}
      currentWeekCompletion={currentWeekCompletion}
      totalHabits={habitsData.length}
    />
  )
}
