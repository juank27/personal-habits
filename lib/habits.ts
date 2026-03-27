import { format, subDays, isSameDay, parse } from 'date-fns'
import type { Habit, HabitLog, HabitWithLogs } from './types'

export function calculateStreak(logs: HabitLog[]): number {
  if (logs.length === 0) return 0

  const sortedLogs = [...logs].sort(
    (a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
  )

  let streak = 0
  let currentDate = new Date()
  currentDate.setHours(0, 0, 0, 0)

  // Check if completed today
  const latestLog = parse(sortedLogs[0].completed_at, 'yyyy-MM-dd', new Date())
  if (!isSameDay(latestLog, currentDate)) {
    // Check if completed yesterday (streak still valid)
    const yesterday = subDays(currentDate, 1)
    if (!isSameDay(latestLog, yesterday)) {
      return 0
    }
    currentDate = yesterday
  }

  // Count consecutive days
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

export function isCompletedOnDate(logs: HabitLog[], date: Date): boolean {
  return logs.some((log) => isSameDay(parse(log.completed_at, 'yyyy-MM-dd', new Date()), date))
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
