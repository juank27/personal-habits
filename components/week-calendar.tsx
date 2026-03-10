'use client'

import { isToday } from 'date-fns'
import { cn } from '@/lib/utils'
import { isCompletedOnDate } from '@/lib/habits'
import { useLanguage } from '@/components/language-provider'
import type { HabitWithLogs } from '@/lib/types'

interface WeekCalendarProps {
  days: Date[]
  habits: HabitWithLogs[]
}

const dayNamesEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const dayNamesEs = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

export function WeekCalendar({ days, habits }: WeekCalendarProps) {
  const { language } = useLanguage()
  const today = new Date()
  const dayNames = language === 'es' ? dayNamesEs : dayNamesEn
  
  // Calculate completion rate for each day
  const getDayCompletion = (date: Date) => {
    if (habits.length === 0) return 0
    const completed = habits.filter((habit) =>
      isCompletedOnDate(habit.logs, date)
    ).length
    return completed / habits.length
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between gap-1">
        {days.map((day) => {
          const isCurrentDay = isToday(day)
          const completion = getDayCompletion(day)
          const isPast = day < today && !isCurrentDay
          const dayOfWeek = day.getDay()
          
          return (
            <div
              key={day.toISOString()}
              className={cn(
                'flex-1 flex flex-col items-center py-3 px-1 rounded-2xl transition-colors',
                isCurrentDay && 'bg-primary/10'
              )}
            >
              <span className={cn(
                'text-xs font-medium mb-2',
                isCurrentDay ? 'text-primary' : 'text-muted-foreground'
              )}>
                {dayNames[dayOfWeek]}
              </span>
              <div className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm relative',
                isCurrentDay 
                  ? 'bg-primary text-primary-foreground' 
                  : isPast && completion === 1
                    ? 'bg-success/20 text-success'
                    : 'text-foreground'
              )}>
                {day.getDate()}
                {!isCurrentDay && completion > 0 && completion < 1 && (
                  <div 
                    className="absolute inset-0 rounded-full border-2 border-primary/30"
                    style={{
                      background: `conic-gradient(var(--primary) ${completion * 360}deg, transparent ${completion * 360}deg)`
                    }}
                  />
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
