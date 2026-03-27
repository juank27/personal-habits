'use client'

import { useState } from 'react'
import { isSameDay, parse } from 'date-fns'
import { WeekCalendar } from '@/components/week-calendar'
import { HabitList } from '@/components/habit-list'
import type { HabitWithLogs } from '@/lib/types'

interface DashboardContentProps {
  habits: HabitWithLogs[]
  weekDays: Date[]
}

export function DashboardContent({ habits, weekDays }: DashboardContentProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return today
  })

  const habitsWithLogs = habits.map((habit) => ({
    ...habit,
    isCompletedToday: habit.logs.some((log) =>
      isSameDay(parse(log.completed_at, 'yyyy-MM-dd', new Date()), selectedDate)
    ),
  }))

  return (
    <>
      <WeekCalendar 
        days={weekDays} 
        habits={habitsWithLogs}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
      />
      <HabitList habits={habitsWithLogs} selectedDate={selectedDate} />
    </>
  )
}
