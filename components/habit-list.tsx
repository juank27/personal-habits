'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { HabitIcon } from '@/components/habit-icon'
import { getColorClass, getColorRingClass, formatDateForDB } from '@/lib/habits'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { Check, Flame } from 'lucide-react'
import type { HabitWithLogs } from '@/lib/types'

interface HabitListProps {
  habits: HabitWithLogs[]
}

export function HabitList({ habits }: HabitListProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Today&apos;s Habits</h2>
        <span className="text-sm text-muted-foreground">
          {habits.filter((h) => h.isCompletedToday).length}/{habits.length} done
        </span>
      </div>
      
      {habits.map((habit) => (
        <HabitCard key={habit.id} habit={habit} />
      ))}
    </div>
  )
}

function HabitCard({ habit }: { habit: HabitWithLogs }) {
  const [isCompleted, setIsCompleted] = useState(habit.isCompletedToday)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const supabase = createClient()

  async function toggleHabit() {
    const newState = !isCompleted
    setIsCompleted(newState)

    startTransition(async () => {
      if (newState) {
        // Add log
        const { error } = await supabase.from('habit_logs').insert({
          habit_id: habit.id,
          user_id: habit.user_id,
          completed_at: formatDateForDB(new Date()),
        })

        if (error) {
          setIsCompleted(false)
          toast.error('Failed to log habit')
          return
        }

        toast.success(`${habit.name} completed!`)
      } else {
        // Remove today's log
        const today = formatDateForDB(new Date())
        const { error } = await supabase
          .from('habit_logs')
          .delete()
          .eq('habit_id', habit.id)
          .eq('completed_at', today)

        if (error) {
          setIsCompleted(true)
          toast.error('Failed to remove log')
          return
        }
      }

      router.refresh()
    })
  }

  return (
    <button
      onClick={toggleHabit}
      disabled={isPending}
      className={cn(
        'w-full flex items-center gap-4 p-4 rounded-2xl transition-all active:scale-[0.98]',
        'bg-card border border-border/50 shadow-sm',
        isCompleted && 'ring-2',
        isCompleted && getColorRingClass(habit.color),
        isPending && 'opacity-70'
      )}
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
              {habit.streak} day streak
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
  )
}
