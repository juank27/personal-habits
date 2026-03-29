import { format, subDays, isSameDay, parse, differenceInDays } from 'date-fns'
import type { Habit, HabitLog, HabitWithLogs } from './types'

export function calculateStreak(logs: HabitLog[]): number {
  if (logs.length === 0) return 0

  const sortedLogs = [...logs].sort(
    (a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
  )

  let streak = 0
  let currentDate = new Date()
  currentDate.setHours(0, 0, 0, 0)

  const latestLog = parse(sortedLogs[0].completed_at, 'yyyy-MM-dd', new Date())
  if (!isSameDay(latestLog, currentDate)) {
    const yesterday = subDays(currentDate, 1)
    if (!isSameDay(latestLog, yesterday)) return 0
    currentDate = yesterday
  }

  for (const log of sortedLogs) {
    const logDate = parse(log.completed_at, 'yyyy-MM-dd', new Date())
    if (isSameDay(logDate, currentDate)) {
      streak++
      currentDate = subDays(currentDate, 1)
    } else if (logDate < currentDate) {
      break
    }
  }

  return streak
}

export function calculateBestStreak(logs: HabitLog[]): number {
  if (logs.length === 0) return 0

  // Deduplicate by date and sort ascending
  const uniqueDates = [...new Set(logs.map((l) => l.completed_at))].sort()
  if (uniqueDates.length === 0) return 0

  let best = 1
  let current = 1

  for (let i = 1; i < uniqueDates.length; i++) {
    const prev = parse(uniqueDates[i - 1], 'yyyy-MM-dd', new Date())
    const curr = parse(uniqueDates[i], 'yyyy-MM-dd', new Date())
    const diff = differenceInDays(curr, prev)

    if (diff === 1) {
      current++
      if (current > best) best = current
    } else if (diff > 1) {
      current = 1
    }
  }

  return best
}

export function isCompletedOnDate(logs: HabitLog[], date: Date): boolean {
  return logs.some((log) => isSameDay(parse(log.completed_at, 'yyyy-MM-dd', new Date()), date))
}

/**
 * Returns true if the habit should appear on a given date based on its frequency.
 */
export function isScheduledForDate(habit: Habit, date: Date): boolean {
  const dayOfWeek = date.getDay() // 0=Sun, 1=Mon, ..., 6=Sat
  const freq = habit.frequency ?? 'daily'

  if (freq === 'daily') return true
  if (freq === 'weekdays') return dayOfWeek >= 1 && dayOfWeek <= 5
  if (freq === 'weekends') return dayOfWeek === 0 || dayOfWeek === 6

  // Custom: comma-separated day numbers e.g. "1,3,5"
  const days = freq.split(',').map(Number).filter((n) => !isNaN(n))
  return days.includes(dayOfWeek)
}

export function processHabitsWithLogs(
  habits: Habit[],
  logs: HabitLog[]
): HabitWithLogs[] {
  const today = new Date()

  return habits.map((habit) => {
    const habitLogs = logs.filter((log) => log.habit_id === habit.id)
    return {
      ...habit,
      logs: habitLogs,
      streak: calculateStreak(habitLogs),
      bestStreak: calculateBestStreak(habitLogs),
      isCompletedToday: isCompletedOnDate(habitLogs, today),
    }
  })
}

export function getColorClass(color: string): string {
  const colorMap: Record<string, string> = {
    purple: 'bg-primary',
    pink: 'bg-pink-500',
    blue: 'bg-blue-500',
    green: 'bg-emerald-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500',
  }
  return colorMap[color] || colorMap.purple
}

export function getColorRingClass(color: string): string {
  const colorMap: Record<string, string> = {
    purple: 'ring-primary/30',
    pink: 'ring-pink-500/30',
    blue: 'ring-blue-500/30',
    green: 'ring-emerald-500/30',
    orange: 'ring-orange-500/30',
    red: 'ring-red-500/30',
  }
  return colorMap[color] || colorMap.purple
}

export function formatDateForDB(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}
