'use client'

import { useRef, useState, useEffect } from 'react'
import { isToday, isSameDay, eachDayOfInterval, subDays, format } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { isCompletedOnDate } from '@/lib/habits'
import { useLanguage } from '@/components/language-provider'
import type { HabitWithLogs } from '@/lib/types'

interface DateCarouselProps {
  habits: HabitWithLogs[]
  onDateChange?: (date: Date) => void
  selectedDate?: Date
}

const DAY_NAMES_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DAY_NAMES_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const DRAG_THRESHOLD = 5

export function WeekCalendar({ habits, onDateChange, selectedDate: externalSelected }: DateCarouselProps) {
  const { language } = useLanguage()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const dayNames = language === 'es' ? DAY_NAMES_ES : DAY_NAMES_EN
  const allDays = eachDayOfInterval({ start: subDays(today, 89), end: today })

  const [selectedDate, setSelectedDate] = useState<Date>(externalSelected || today)
  const [atEnd, setAtEnd] = useState(true)
  const [visibleMonth, setVisibleMonth] = useState<Date>(today)

  const containerRef = useRef<HTMLDivElement>(null)
  const startX = useRef(0)
  const scrollLeftStart = useRef(0)
  const dragDistance = useRef(0)
  const dragging = useRef(false)

  // Scroll to today on mount
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    el.scrollLeft = el.scrollWidth
  }, [])

  const handleScroll = () => {
    const el = containerRef.current
    if (!el) return

    const maxScroll = el.scrollWidth - el.clientWidth
    setAtEnd(el.scrollLeft >= maxScroll - 2)

    // Update month label based on center of visible window
    const dayWidth = el.clientWidth / 7
    const centerIdx = Math.round((el.scrollLeft + el.clientWidth / 2) / dayWidth)
    const centerDay = allDays[Math.min(Math.max(centerIdx, 0), allDays.length - 1)]
    if (centerDay) setVisibleMonth(centerDay)
  }

  const handlePrev = () => {
    const el = containerRef.current
    if (!el) return
    el.scrollBy({ left: -el.clientWidth, behavior: 'smooth' })
  }

  const handleNext = () => {
    const el = containerRef.current
    if (!el) return
    el.scrollBy({ left: el.clientWidth, behavior: 'smooth' })
  }

  const scrollToToday = () => {
    const el = containerRef.current
    if (!el) return
    el.scrollTo({ left: el.scrollWidth, behavior: 'smooth' })
    const todayDate = new Date()
    todayDate.setHours(0, 0, 0, 0)
    setSelectedDate(todayDate)
    onDateChange?.(todayDate)
  }

  const onMouseDown = (e: React.MouseEvent) => {
    const el = containerRef.current
    if (!el) return
    dragging.current = false
    dragDistance.current = 0
    startX.current = e.pageX - el.offsetLeft
    scrollLeftStart.current = el.scrollLeft
    el.style.cursor = 'grabbing'
  }

  const onMouseMove = (e: React.MouseEvent) => {
    const el = containerRef.current
    if (!el || !startX.current) return
    const x = e.pageX - el.offsetLeft
    const walk = startX.current - x
    dragDistance.current = Math.abs(walk)
    if (dragDistance.current > DRAG_THRESHOLD) {
      dragging.current = true
      el.scrollLeft = scrollLeftStart.current + walk
    }
  }

  const onMouseUp = () => {
    const el = containerRef.current
    if (el) el.style.cursor = 'grab'
    startX.current = 0
  }

  const onMouseLeave = () => {
    const el = containerRef.current
    if (el) el.style.cursor = 'grab'
    startX.current = 0
    dragging.current = false
  }

  const handleDayClick = (day: Date) => {
    if (dragging.current) return
    setSelectedDate(day)
    onDateChange?.(day)
  }

  const getDayCompletion = (date: Date) => {
    if (habits.length === 0) return 0
    const completed = habits.filter((h) => isCompletedOnDate(h.logs, date)).length
    return completed / habits.length
  }

  const monthLabel = format(visibleMonth, language === 'es' ? 'MMMM yyyy' : 'MMMM yyyy')

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-muted-foreground capitalize">
          {monthLabel}
        </span>
        <div className="flex items-center gap-1">
          {!atEnd && (
            <button
              onClick={scrollToToday}
              className="text-xs font-medium text-primary hover:text-primary/80 px-2 py-1 rounded-lg hover:bg-primary/10 transition-colors mr-1"
            >
              {language === 'es' ? 'Hoy' : 'Today'}
            </button>
          )}
          <button
            onClick={handlePrev}
            className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={handleNext}
            disabled={atEnd}
            className={cn(
              'p-1.5 rounded-lg transition-colors',
              atEnd ? 'opacity-30 cursor-not-allowed' : 'hover:bg-secondary'
            )}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="flex overflow-x-auto cursor-grab select-none"
        style={{ scrollbarWidth: 'none' }}
        onScroll={handleScroll}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
      >
        {allDays.map((day) => {
          const isCurrentDay = isToday(day)
          const isSelected = isSameDay(day, selectedDate)
          const completion = getDayCompletion(day)
          const isPast = day < today && !isCurrentDay
          const dayOfWeek = day.getDay()

          return (
            <button
              key={day.toISOString()}
              onClick={() => handleDayClick(day)}
              draggable={false}
              style={{ minWidth: 'calc(100% / 7)' }}
              className={cn(
                'flex flex-col items-center py-3 px-1 rounded-2xl transition-colors',
                'hover:bg-secondary',
                isCurrentDay && 'bg-primary/10',
                isSelected && !isCurrentDay && 'bg-secondary'
              )}
            >
              <span
                className={cn(
                  'text-xs font-medium mb-2',
                  isCurrentDay ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {dayNames[dayOfWeek]}
              </span>
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm relative transition-colors',
                  isCurrentDay
                    ? 'bg-primary text-primary-foreground'
                    : isSelected
                    ? 'bg-primary/30 text-foreground'
                    : isPast && completion === 1
                    ? 'bg-success/20 text-success'
                    : 'text-foreground'
                )}
              >
                {day.getDate()}
                {!isCurrentDay && completion > 0 && completion < 1 && (
                  <div
                    className="absolute inset-0 rounded-full opacity-30"
                    style={{
                      background: `conic-gradient(var(--primary) ${completion * 360}deg, transparent ${completion * 360}deg)`,
                    }}
                  />
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
