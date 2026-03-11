'use client'

import { useState } from 'react'
import { useTheme } from 'next-themes'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { HabitIcon } from '@/components/habit-icon'
import { useLanguage } from '@/components/language-provider'
import { getColorClass } from '@/lib/habits'
import { cn } from '@/lib/utils'
import { Flame, Target, Calendar, TrendingUp, ChevronDown } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

type DateRange = 'last7Days' | 'lastWeek' | 'thisMonth'

interface DataPoint {
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
  weeklyData: DataPoint[]
  lastWeekData: DataPoint[]
  monthlyData: DataPoint[]
  habitStats: HabitStat[]
  avgCompletionRate: number
  bestStreak: number
  currentWeekCompletion: number
  totalHabits: number
}

export function StatsContent({
  weeklyData,
  lastWeekData,
  monthlyData,
  habitStats,
  avgCompletionRate,
  bestStreak,
  currentWeekCompletion,
  totalHabits,
}: StatsContentProps) {
  const { t, language } = useLanguage()
  const { resolvedTheme } = useTheme()
  const [dateRange, setDateRange] = useState<DateRange>('last7Days')

  const isDark = resolvedTheme === 'dark'
  const tickColor = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)'
  const gridColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
  const barActive  = isDark ? '#a78bfa' : '#7c3aed'   // primary
  const barNormal  = isDark ? '#7c3aed80' : '#7c3aed80'
  const barEmpty   = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
  const tooltipBg  = isDark ? '#1e1b4b' : '#ffffff'
  const tooltipBorder = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'

  const getChartData = () => {
    switch (dateRange) {
      case 'last7Days':
        return weeklyData.map((d) => ({
          name: language === 'es' ? d.dayNameEs : d.dayName,
          fullDate: d.date,
          value: d.rate,
          count: d.count,
          isToday: d.isToday,
        }))
      case 'lastWeek':
        return lastWeekData.map((d) => ({
          name: language === 'es' ? d.dayNameEs : d.dayName,
          fullDate: d.date,
          value: d.rate,
          count: d.count,
          isToday: false,
        }))
      case 'thisMonth':
        return monthlyData.map((d, index) => ({
          name: index % 5 === 0 ? d.date.split('-')[2] : '',
          fullDate: d.date,
          value: d.rate,
          count: d.count,
          isToday: d.isToday,
        }))
    }
  }

  const chartData = getChartData()

  const getDateRangeLabel = () => {
    switch (dateRange) {
      case 'last7Days':
        return t.last7Days
      case 'lastWeek':
        return t.lastWeek
      case 'thisMonth':
        return t.thisMonth
    }
  }

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { fullDate: string; value: number; count: number } }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div style={{ background: tooltipBg, border: `1px solid ${tooltipBorder}` }} className="rounded-lg px-3 py-2 shadow-lg">
          <p className="text-xs text-muted-foreground">{data.fullDate}</p>
          <p className="text-sm font-semibold text-foreground">{data.value}% {t.completionRate}</p>
          <p className="text-xs text-muted-foreground">{data.count} {t.done}</p>
        </div>
      )
    }
    return null
  }

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
      <Card className="mb-6 border-0 shadow-md bg-card/80 backdrop-blur">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">{t.completionRate}</CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1 text-xs">
                  {getDateRangeLabel()}
                  <ChevronDown className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setDateRange('last7Days')}>
                  {t.last7Days}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDateRange('lastWeek')}>
                  {t.lastWeek}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDateRange('thisMonth')}>
                  {t.thisMonth}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={chartData} 
                margin={{ top: 10, right: 5, left: -15, bottom: 5 }}
              >
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  vertical={false} 
                  stroke={gridColor}
                />
                <XAxis 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: tickColor }}
                  dy={5}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: tickColor }}
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 75, 100]}
                  tickFormatter={(value) => `${value}%`}
                  width={40}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }} />
                <Bar 
                  dataKey="value" 
                  radius={[6, 6, 0, 0]}
                  maxBarSize={dateRange === 'thisMonth' ? 12 : 32}
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.isToday ? barActive : entry.value > 0 ? barNormal : barEmpty}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t border-border">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm" style={{ background: barActive }} />
              <span className="text-xs text-muted-foreground">
                {language === 'es' ? 'Hoy' : 'Today'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm" style={{ background: barNormal }} />
              <span className="text-xs text-muted-foreground">
                {language === 'es' ? 'Con actividad' : 'With activity'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm" style={{ background: barEmpty, border: `1px solid ${gridColor}` }} />
              <span className="text-xs text-muted-foreground">
                {language === 'es' ? 'Sin actividad' : 'No activity'}
              </span>
            </div>
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
