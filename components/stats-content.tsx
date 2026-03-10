'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { HabitIcon } from '@/components/habit-icon'
import { useLanguage } from '@/components/language-provider'
import { getColorClass } from '@/lib/habits'
import { cn } from '@/lib/utils'
import { Flame, Target, Calendar, TrendingUp } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
} from 'recharts'

interface WeeklyDataPoint {
  date: string
  dayName: string
  dayNameEs: string
  rate: number
  count: number
  isToday: boolean
}

interface HabitStat {
  id: string
  name: string
  icon: string
  color: string
  streak: number
  completionRate: number
  totalLogs: number
}

interface StatsContentProps {
  weeklyData: WeeklyDataPoint[]
  habitStats: HabitStat[]
  avgCompletionRate: number
  bestStreak: number
  currentWeekCompletion: number
  totalHabits: number
}

export function StatsContent({
  weeklyData,
  habitStats,
  avgCompletionRate,
  bestStreak,
  currentWeekCompletion,
  totalHabits,
}: StatsContentProps) {
  const { t, language } = useLanguage()

  const chartData = weeklyData.map((d) => ({
    name: language === 'es' ? d.dayNameEs : d.dayName,
    value: d.rate,
    isToday: d.isToday,
  }))

  return (
    <main className="max-w-lg mx-auto px-4 pt-6 pb-24">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">{t.statistics}</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {t.habitOverview}
        </p>
      </header>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatCard
          icon={TrendingUp}
          label={t.avgRate}
          value={`${avgCompletionRate}%`}
          color="primary"
        />
        <StatCard
          icon={Flame}
          label={t.bestStreak}
          value={`${bestStreak} ${t.days}`}
          color="orange"
        />
        <StatCard
          icon={Target}
          label={t.thisWeek}
          value={`${currentWeekCompletion} ${t.done}`}
          color="emerald"
        />
        <StatCard
          icon={Calendar}
          label={t.totalHabits}
          value={totalHabits.toString()}
          color="blue"
        />
      </div>

      {/* Weekly Chart */}
      <Card className="mb-6 border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{t.last7Days}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  domain={[0, 100]}
                  ticks={[0, 50, 100]}
                  tickFormatter={(value) => `${value}%`}
                />
                <Bar 
                  dataKey="value" 
                  radius={[6, 6, 0, 0]}
                  maxBarSize={40}
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.isToday ? 'hsl(var(--primary))' : 'hsl(var(--muted))'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Per Habit Stats */}
      {habitStats.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">{t.habitPerformance}</h2>
          <div className="space-y-3">
            {habitStats.map((habit) => (
              <Card key={habit.id} className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                      getColorClass(habit.color)
                    )}>
                      <HabitIcon icon={habit.icon} className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{habit.name}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Flame className="h-3 w-3 text-orange-500" />
                          {habit.streak} {t.dayStreakLabel}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {habit.completionRate}% {t.last30d}
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="mt-3 h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all', getColorClass(habit.color))}
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
