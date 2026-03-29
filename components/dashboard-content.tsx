'use client'

import { useState } from 'react'
import { isSameDay, parse } from 'date-fns'
import { WeekCalendar } from '@/components/week-calendar'
import { HabitList } from '@/components/habit-list'
import { NotificationBanner } from '@/components/notification-banner'
import { isScheduledForDate } from '@/lib/habits'
import type { HabitWithLogs } from '@/lib/types'

interface DashboardContentProps {
  habits: HabitWithLogs[]
}

export function DashboardContent({ habits }: DashboardContentProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return today
  })

  // Recalculate completion for selected date and filter by frequency
  const habitsForDate = habits
    .filter((habit) => isScheduledForDate(habit, selectedDate))
    .map((habit) => ({
      ...habit,
      isCompletedToday: habit.logs.some((log) =>
        isSameDay(parse(log.completed_at, 'yyyy-MM-dd', new Date()), selectedDate)
      ),
    }))

  return (
    <>
      <NotificationBanner habits={habits} />
      <WeekCalendar
        habits={habitsForDate}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
      />
      <HabitList habits={habitsForDate} selectedDate={selectedDate} />
    </>
  )
}
