'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { HabitIcon } from '@/components/habit-icon'
import { useLanguage } from '@/components/language-provider'
import { getColorClass } from '@/lib/habits'
import { cn } from '@/lib/utils'
import { Flame, Target, Calendar, TrendingUp, ChevronDown, X, ArrowUpDown } from 'lucide-react'
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

interface LogEntry {
  habit_id: string
  completed_at: string
}

interface StatsContentProps {
  weeklyData: DataPoint[]
  lastWeekData: DataPoint[]
  monthlyData: DataPoint[]
  habitStats: HabitStat[]
  logs: LogEntry[]
  avgCompletionRate: number
  bestStreak: number
  currentWeekCompletion: number
  totalHabits: number
}

const HABIT_COLOR_HEX: Record<string, string> = {
  purple: '#7c3aed',
  pink:   '#ec4899',
  blue:   '#3b82f6',
  green:  '#10b981',
  orange: '#f97316',
  red:    '#ef4444',
}

const HABIT_COLOR_RING: Record<string, string> = {
  purple: 'ring-violet-500',
  pink:   'ring-pink-500',
  blue:   'ring-blue-500',
  green:  'ring-emerald-500',
  orange: 'ring-orange-500',
  red:    'ring-red-500',
}

export function StatsContent({
  weeklyData,
  lastWeekData,
  monthlyData,
  habitStats,
  logs,
  avgCompletionRate,
  bestStreak,
  currentWeekCompletion,
  totalHabits,
}: StatsContentProps) {
  type SortType = 'streak' | 'rate' | 'name'

  const { t, language } = useLanguage()
  const { resolvedTheme } = useTheme()
  const [dateRange, setDateRange] = useState<DateRange>('last7Days')
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<SortType>('streak')
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const isDark = mounted ? resolvedTheme === 'dark' : false
  const tickColor    = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)'
  const gridColor    = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
  const barActive    = isDark ? '#a78bfa' : '#7c3aed'
  const barNormal    = isDark ? '#7c3aed80' : '#7c3aed80'
  const barEmpty     = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
  const tooltipBg    = isDark ? '#1e1b4b' : '#ffffff'
  const tooltipBorder = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'

  const selectedHabit = habitStats.find((h) => h.id === selectedHabitId) ?? null
  const selectedColorHex = selectedHabit ? (HABIT_COLOR_HEX[selectedHabit.color] ?? barActive) : null

  const getRateColors = (rate: number) => {
    if (rate >= 80) return { bg: 'rgba(16,185,129,0.12)', text: '#10b981' }
    if (rate >= 50) return { bg: 'rgba(245,158,11,0.12)', text: '#f59e0b' }
    return { bg: 'rgba(239,68,68,0.12)', text: '#ef4444' }
  }

  const sortedHabitStats = [...habitStats].sort((a, b) => {
    switch (sortBy) {
      case 'rate':   return b.completionRate - a.completionRate
      case 'name':   return a.name.localeCompare(b.name)
      default:       return b.streak - a.streak
    }
  })

  const cycleSortBy = () => {
    setSortBy((prev) => {
      if (prev === 'streak') return 'rate'
      if (prev === 'rate')   return 'name'
      return 'streak'
    })
  }

  const getSortLabel = () => {
    if (sortBy === 'streak') return language === 'es' ? 'Racha' : 'Streak'
    if (sortBy === 'rate')   return language === 'es' ? 'Tasa'  : 'Rate'
    return language === 'es' ? 'Nombre' : 'Name'
  }

  const toggleHabit = (id: string) =>
    setSelectedHabitId((prev) => (prev === id ? null : id))

  const getRawDays = () => {
    switch (dateRange) {
      case 'last7Days': return weeklyData
      case 'lastWeek':  return lastWeekData
      case 'thisMonth': return monthlyData
    }
  }

  const getBarName = (d: DataPoint, index: number) => {
    if (dateRange === 'thisMonth') return index % 5 === 0 ? d.date.split('-')[2] : ''
    return language === 'es' ? d.dayNameEs : d.dayName
  }

  const getChartData = () => {
    const rawDays = getRawDays()

    if (selectedHabitId) {
      return rawDays.map((d, i) => {
        const completed = logs.some(
          (log) => log.habit_id === selectedHabitId && log.completed_at === d.date
        )
        return {
          name: getBarName(d, i),
          fullDate: d.date,
          value: completed ? 100 : 0,
          count: completed ? 1 : 0,
          isToday: d.isToday,
        }
      })
    }

    return rawDays.map((d, i) => ({
      name: getBarName(d, i),
      fullDate: d.date,
      value: d.rate,
      count: d.count,
      isToday: d.isToday,
    }))
  }

  const getBarColor = (entry: { isToday: boolean; value: number }) => {
    if (selectedColorHex) {
      return entry.value > 0
        ? selectedColorHex
        : barEmpty
    }
    return entry.isToday ? barActive : entry.value > 0 ? barNormal : barEmpty
  }

  const chartData = getChartData()

  const getDateRangeLabel = () => {
    switch (dateRange) {
      case 'last7Days': return t.last7Days
      case 'lastWeek':  return t.lastWeek
      case 'thisMonth': return t.thisMonth
    }
  }

  // Completions for selected habit in the current range
  const selectedHabitRangeCount = selectedHabitId
    ? getRawDays().filter((d) =>
        logs.some((l) => l.habit_id === selectedHabitId && l.completed_at === d.date)
      ).length
    : null

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean
    payload?: Array<{ payload: { fullDate: string; value: number; count: number } }>
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div
          style={{ background: tooltipBg, border: `1px solid ${tooltipBorder}` }}
          className="rounded-lg px-3 py-2 shadow-lg"
        >
          <p className="text-xs text-muted-foreground">{data.fullDate}</p>
          {selectedHabit ? (
            <p className="text-sm font-semibold text-foreground">
              {data.value > 0
                ? (language === 'es' ? '✓ Completado' : '✓ Completed')
                : (language === 'es' ? '✗ No completado' : '✗ Not completed')}
            </p>
          ) : (
            <>
              <p className="text-sm font-semibold text-foreground">
                {data.value}% {t.completionRate}
              </p>
              <p className="text-xs text-muted-foreground">
                {data.count} {t.done}
              </p>
            </>
          )}
        </div>
      )
    }
    return null
  }

  return (
    <main className="max-w-lg mx-auto px-4 pt-6 pb-24">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">{t.statistics}</h1>
        <p className="text-muted-foreground text-sm mt-1">{t.habitOverview}</p>
      </header>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatCard icon={TrendingUp} label={t.avgRate}        value={`${avgCompletionRate}%`}            color="primary" />
        <StatCard icon={Flame}      label={t.bestStreak}     value={`${bestStreak} ${t.days}`}          color="orange"  />
        <StatCard icon={Target}     label={t.thisWeek}       value={`${currentWeekCompletion} ${t.done}`} color="emerald" />
        <StatCard icon={Calendar}   label={t.totalHabits}   value={totalHabits.toString()}              color="blue"    />
      </div>

      {/* Chart */}
      <Card className="mb-6 border-0 shadow-md bg-card/80 backdrop-blur">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              {selectedHabit && (
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ background: selectedColorHex ?? undefined }}
                />
              )}
              <CardTitle className="text-base truncate">
                {selectedHabit ? selectedHabit.name : t.completionRate}
              </CardTitle>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {selectedHabit && (
                <button
                  onClick={() => setSelectedHabitId(null)}
                  className="p-1 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 gap-1 text-xs">
                    {getDateRangeLabel()}
                    <ChevronDown className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setDateRange('last7Days')}>{t.last7Days}</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setDateRange('lastWeek')}>{t.lastWeek}</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setDateRange('thisMonth')}>{t.thisMonth}</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Selected habit quick stats */}
          {selectedHabit && (
            <div className="flex items-center gap-4 mt-2 pt-2 border-t border-border">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Flame className="h-3.5 w-3.5 text-orange-500" />
                <span>{selectedHabit.streak} {t.dayStreakLabel}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Target className="h-3.5 w-3.5" style={{ color: selectedColorHex ?? undefined }} />
                <span>{selectedHabit.completionRate}% {t.last30d}</span>
              </div>
              {selectedHabitRangeCount !== null && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground ml-auto">
                  <span
                    className="font-semibold"
                    style={{ color: selectedColorHex ?? undefined }}
                  >
                    {selectedHabitRangeCount}
                  </span>
                  <span>{language === 'es' ? 'en rango' : 'in range'}</span>
                </div>
              )}
            </div>
          )}
        </CardHeader>

        <CardContent>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 5, left: -5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
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
                  tickFormatter={(v) => `${v}%`}
                  width={44}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }}
                />
                <Bar
                  dataKey="value"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={dateRange === 'thisMonth' ? 12 : 32}
                >
                  {chartData.map((entry, i) => (
                    <Cell key={`cell-${i}`} fill={getBarColor(entry)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t border-border">
            {selectedHabit ? (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm" style={{ background: selectedColorHex ?? undefined }} />
                  <span className="text-xs text-muted-foreground">
                    {language === 'es' ? 'Completado' : 'Completed'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm" style={{ background: barEmpty, border: `1px solid ${gridColor}` }} />
                  <span className="text-xs text-muted-foreground">
                    {language === 'es' ? 'No completado' : 'Not completed'}
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm" style={{ background: barActive }} />
                  <span className="text-xs text-muted-foreground">{language === 'es' ? 'Hoy' : 'Today'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm" style={{ background: barNormal }} />
                  <span className="text-xs text-muted-foreground">{language === 'es' ? 'Con actividad' : 'With activity'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm" style={{ background: barEmpty, border: `1px solid ${gridColor}` }} />
                  <span className="text-xs text-muted-foreground">{language === 'es' ? 'Sin actividad' : 'No activity'}</span>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Per Habit Stats */}
      {habitStats.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">{t.habitPerformance}</h2>
            <button
              onClick={cycleSortBy}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2.5 py-1.5 rounded-lg hover:bg-secondary"
            >
              <ArrowUpDown className="h-3.5 w-3.5" />
              {getSortLabel()}
            </button>
          </div>
          <div className="space-y-2.5">
            {sortedHabitStats.map((habit, index) => {
              const isSelected = selectedHabitId === habit.id
              const hexColor = HABIT_COLOR_HEX[habit.color] ?? barActive
              const rateColors = getRateColors(habit.completionRate)

              return (
                <Card
                  key={habit.id}
                  className={cn(
                    'border-0 shadow-sm cursor-pointer transition-all duration-200',
                    isSelected ? 'ring-2 shadow-md' : 'hover:shadow-md',
                    isSelected && (HABIT_COLOR_RING[habit.color] ?? 'ring-primary')
                  )}
                  onClick={() => toggleHabit(habit.id)}
                >
                  <CardContent className="p-3.5">
                    <div className="flex items-center gap-3">
                      {/* Rank number */}
                      <span className="text-xs font-semibold text-muted-foreground w-4 text-center shrink-0">
                        {index + 1}
                      </span>

                      {/* Icon */}
                      <div
                        className={cn(
                          'w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200',
                          getColorClass(habit.color),
                          isSelected && 'scale-105'
                        )}
                      >
                        <HabitIcon icon={habit.icon} className="h-4.5 w-4.5 text-white" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Name + Rate badge */}
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <h3 className={cn('text-sm font-medium truncate min-w-0 flex-1', isSelected && 'font-semibold')}>
                            {habit.name}
                          </h3>
                          <span
                            className="text-xs font-bold px-2 py-0.5 rounded-full shrink-0 tabular-nums whitespace-nowrap"
                            style={{
                              background: isSelected ? rateColors.bg : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'),
                              color: isSelected ? rateColors.text : undefined,
                            }}
                          >
                            {habit.completionRate}%
                          </span>
                        </div>

                        {/* Progress bar */}
                        <div className="h-2 bg-secondary rounded-full overflow-hidden mb-1.5">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${habit.completionRate}%`,
                              background: isSelected ? rateColors.text : hexColor,
                              opacity: isSelected ? 1 : 0.55,
                            }}
                          />
                        </div>

                        {/* Meta row */}
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Flame className="h-3 w-3 text-orange-500 shrink-0" />
                            {habit.streak} {t.dayStreakLabel}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {habit.totalLogs}/30 {language === 'es' ? 'días' : 'days'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
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
    orange:  'bg-orange-500/10 text-orange-500',
    emerald: 'bg-emerald-500/10 text-emerald-500',
    blue:    'bg-blue-500/10 text-blue-500',
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-4">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3', colorClasses[color])}>
          <Icon className="h-5 w-5" />
        </div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  )
}
