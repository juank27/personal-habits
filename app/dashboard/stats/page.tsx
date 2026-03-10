import { createClient } from '@/lib/supabase/server'
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval, parseISO, isSameDay } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { HabitIcon } from '@/components/habit-icon'
import { getColorClass, calculateStreak } from '@/lib/habits'
import { cn } from '@/lib/utils'
import { Flame, Target, Calendar, TrendingUp } from 'lucide-react'
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
      ? (uniqueHabitsCompleted / habitsData.length) * 100 
      : 0
    return { date, rate, count: uniqueHabitsCompleted }
  })

  // Calculate stats for each habit
  const habitStats = habitsData.map((habit) => {
    const habitLogs = logsData.filter((log) => log.habit_id === habit.id)
    const streak = calculateStreak(habitLogs)
    const completionRate = (habitLogs.length / 30) * 100
    return { ...habit, streak, completionRate, totalLogs: habitLogs.length }
  }).sort((a, b) => b.streak - a.streak)

  // Overall stats
  const totalCompletions = logsData.length
  const avgCompletionRate = habitsData.length > 0
    ? (totalCompletions / (habitsData.length * 30)) * 100
    : 0
  const bestStreak = habitStats.length > 0 
    ? Math.max(...habitStats.map((h) => h.streak))
    : 0
  const currentWeekCompletion = weeklyData.reduce((sum, d) => sum + d.count, 0)

  return (
    <main className="max-w-lg mx-auto px-4 pt-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Statistics</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Your habit tracking overview
        </p>
      </header>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatCard
          icon={TrendingUp}
          label="Avg. Rate"
          value={`${Math.round(avgCompletionRate)}%`}
          color="primary"
        />
        <StatCard
          icon={Flame}
          label="Best Streak"
          value={`${bestStreak} days`}
          color="orange"
        />
        <StatCard
          icon={Target}
          label="This Week"
          value={`${currentWeekCompletion} done`}
          color="emerald"
        />
        <StatCard
          icon={Calendar}
          label="Total Habits"
          value={habitsData.length.toString()}
          color="blue"
        />
      </div>

      {/* Weekly Chart */}
      <Card className="mb-6 border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Last 7 Days</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between gap-2 h-32">
            {weeklyData.map((day, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex-1 flex items-end">
                  <div
                    className={cn(
                      'w-full rounded-t-lg transition-all',
                      day.rate > 0 ? 'bg-primary' : 'bg-secondary'
                    )}
                    style={{ height: `${Math.max(day.rate, 4)}%` }}
                  />
                </div>
                <span className={cn(
                  'text-xs font-medium',
                  isSameDay(day.date, today)
                    ? 'text-primary'
                    : 'text-muted-foreground'
                )}>
                  {format(day.date, 'EEE')}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Per Habit Stats */}
      {habitStats.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Habit Performance</h2>
          <div className="space-y-3">
            {habitStats.map((habit) => (
              <Card key={habit.id} className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center',
                      getColorClass(habit.color)
                    )}>
                      <HabitIcon icon={habit.icon} className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{habit.name}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Flame className="h-3 w-3 text-orange-500" />
                          {habit.streak} day streak
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {Math.round(habit.completionRate)}% last 30d
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="mt-3 h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={cn('h-full rounded-full', getColorClass(habit.color))}
                      style={{ width: `${Math.min(habit.completionRate, 100)}%` }}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </main>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  color: 'primary' | 'orange' | 'emerald' | 'blue'
}) {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    orange: 'bg-orange-500/10 text-orange-500',
    emerald: 'bg-emerald-500/10 text-emerald-500',
    blue: 'bg-blue-500/10 text-blue-500',
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-4">
        <div className={cn(
          'w-10 h-10 rounded-xl flex items-center justify-center mb-3',
          colorClasses[color]
        )}>
          <Icon className="h-5 w-5" />
        </div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  )
}
