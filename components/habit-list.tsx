'use client'

import { useState, useTransition, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { HabitIcon } from '@/components/habit-icon'
import { useLanguage } from '@/components/language-provider'
import { getColorClass, getColorRingClass, formatDateForDB } from '@/lib/habits'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { Check, Flame, MoreHorizontal, Pencil } from 'lucide-react'
import { isSameDay } from 'date-fns'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import type { HabitWithLogs } from '@/lib/types'

interface HabitListProps {
  habits: HabitWithLogs[]
  selectedDate?: Date
}

export function HabitList({ habits, selectedDate }: HabitListProps) {
  const { t } = useLanguage()
  const [completedIds, setCompletedIds] = useState<Set<string>>(
    () => new Set(habits.filter((h) => h.isCompletedToday).map((h) => h.id))
  )

  // Update completed IDs when habits or selected date changes
  useEffect(() => {
    setCompletedIds(new Set(habits.filter((h) => h.isCompletedToday).map((h) => h.id)))
  }, [habits, selectedDate])

  function onToggle(habitId: string, completed: boolean) {
    setCompletedIds((prev) => {
      const next = new Set(prev)
      if (completed) {
        next.add(habitId)
      } else {
        next.delete(habitId)
      }
      return next
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">{t.todayHabits}</h2>
        <span className="text-sm text-muted-foreground">
          {completedIds.size}/{habits.length} {t.done}
        </span>
      </div>
      
      {habits.map((habit) => (
        <HabitCard key={habit.id} habit={habit} onToggle={onToggle} selectedDate={selectedDate} />
      ))}
    </div>
  )
}

function HabitCard({ habit, onToggle, selectedDate }: { habit: HabitWithLogs; onToggle: (id: string, completed: boolean) => void; selectedDate?: Date }) {
  const [isCompleted, setIsCompleted] = useState(habit.isCompletedToday)
  const [isPending, startTransition] = useTransition()
  const prevCompleted = useRef(habit.isCompletedToday)

  // Sync local state when the parent recalculates completion (e.g. date change)
  useEffect(() => {
    if (prevCompleted.current !== habit.isCompletedToday) {
      prevCompleted.current = habit.isCompletedToday
      setIsCompleted(habit.isCompletedToday)
    }
  }, [habit.isCompletedToday])
  const router = useRouter()
  const supabase = createClient()
  const { t, language } = useLanguage()
  
  const targetDate = selectedDate ? formatDateForDB(selectedDate) : formatDateForDB(new Date())

  async function toggleHabit() {
    const newState = !isCompleted
    setIsCompleted(newState)
    onToggle(habit.id, newState)

    startTransition(async () => {
      if (newState) {
        // Check if log already exists for the target date
        const { data: existingLog } = await supabase
          .from('habit_logs')
          .select('id')
          .eq('habit_id', habit.id)
          .eq('completed_at', targetDate)
          .maybeSingle()

        if (existingLog) {
          // Log already exists, just refresh UI
          toast.success(language === 'es' ? `${habit.name} completado!` : `${habit.name} completed!`)
          router.refresh()
          return
        }

        // Add new log
        const { error } = await supabase.from('habit_logs').insert({
          habit_id: habit.id,
          user_id: habit.user_id,
          completed_at: targetDate,
        })

        if (error) {
          setIsCompleted(false)
          onToggle(habit.id, false)
          toast.error(language === 'es' ? 'Error al registrar' : 'Failed to log habit')
          return
        }

        toast.success(language === 'es' ? `${habit.name} completado!` : `${habit.name} completed!`)
      } else {
        // Remove log for the target date
        const { error } = await supabase
          .from('habit_logs')
          .delete()
          .eq('habit_id', habit.id)
          .eq('completed_at', targetDate)

        if (error) {
          setIsCompleted(true)
          onToggle(habit.id, true)
          toast.error(language === 'es' ? 'Error al eliminar' : 'Failed to remove log')
          return
        }
      }

      router.refresh()
    })
  }

  return (
    <div
      className={cn(
        'relative w-full flex items-center gap-4 p-4 rounded-2xl transition-all',
        'bg-card border border-border/50 shadow-sm',
        isCompleted && 'ring-2',
        isCompleted && getColorRingClass(habit.color),
        isPending && 'opacity-70'
      )}
    >
      <button
        onClick={toggleHabit}
        disabled={isPending}
        className="flex-1 flex items-center gap-4 active:scale-[0.98] transition-transform"
      >
        <div
          className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center transition-colors',
            isCompleted 
              ? cn(getColorClass(habit.color), 'text-white') 
              : 'bg-secondary'
          )}
        >
          {isCompleted ? (
            <Check className="h-6 w-6" />
          ) : (
            <HabitIcon icon={habit.icon} className="h-6 w-6 text-muted-foreground" />
          )}
        </div>

        <div className="flex-1 text-left">
          <h3 className={cn(
            'font-medium',
            isCompleted && 'text-muted-foreground line-through'
          )}>
            {habit.name}
          </h3>
          {habit.streak > 0 && (
            <div className="flex items-center gap-1 mt-1">
              <Flame className="h-3.5 w-3.5 text-orange-500" />
              <span className="text-xs text-muted-foreground">
                {habit.streak} {t.dayStreak}
              </span>
            </div>
          )}
        </div>

        <div
          className={cn(
            'w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors',
            isCompleted
              ? cn(getColorClass(habit.color), 'border-transparent')
              : 'border-border'
          )}
        >
          {isCompleted && <Check className="h-4 w-4 text-white" />}
        </div>
      </button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">{t.editHabit}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/dashboard/edit-habit/${habit.id}`} className="flex items-center gap-2">
              <Pencil className="h-4 w-4" />
              {t.editHabit}
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
