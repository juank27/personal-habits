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
import { Check, Flame, MoreHorizontal, Pencil, Trophy, MessageSquare, Star } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import type { HabitWithLogs, HabitLog } from '@/lib/types'

interface HabitListProps {
  habits: HabitWithLogs[]
  selectedDate?: Date
}

export function HabitList({ habits, selectedDate }: HabitListProps) {
  const { t } = useLanguage()
  const [completedIds, setCompletedIds] = useState<Set<string>>(
    () => new Set(habits.filter((h) => h.isCompletedToday).map((h) => h.id))
  )

  useEffect(() => {
    setCompletedIds(new Set(habits.filter((h) => h.isCompletedToday).map((h) => h.id)))
  }, [habits, selectedDate])

  function onToggle(habitId: string, completed: boolean) {
    setCompletedIds((prev) => {
      const next = new Set(prev)
      if (completed) next.add(habitId)
      else next.delete(habitId)
      return next
    })
  }

  const completionPercent = habits.length > 0
    ? Math.round((completedIds.size / habits.length) * 100)
    : 0

  const allDone = habits.length > 0 && completedIds.size === habits.length

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold">{t.todayHabits}</h2>
        <span className={cn(
          'text-sm font-medium transition-colors',
          allDone ? 'text-emerald-500' : 'text-muted-foreground'
        )}>
          {allDone && <Trophy className="inline h-3.5 w-3.5 mr-1 mb-0.5" />}
          {completedIds.size}/{habits.length} {t.done}
        </span>
      </div>

      {/* Progress bar */}
      {habits.length > 0 && (
        <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden mb-4">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-700 ease-out',
              allDone
                ? 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                : 'bg-gradient-to-r from-primary to-violet-400'
            )}
            style={{ width: `${completionPercent}%` }}
          />
        </div>
      )}

      {habits.map((habit, index) => (
        <HabitCard
          key={habit.id}
          habit={habit}
          onToggle={onToggle}
          selectedDate={selectedDate}
          index={index}
        />
      ))}
    </div>
  )
}

function HabitCard({
  habit,
  onToggle,
  selectedDate,
  index,
}: {
  habit: HabitWithLogs
  onToggle: (id: string, completed: boolean) => void
  selectedDate?: Date
  index: number
}) {
  const [isCompleted, setIsCompleted] = useState(habit.isCompletedToday)
  const [justCompleted, setJustCompleted] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [noteOpen, setNoteOpen] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [currentLogId, setCurrentLogId] = useState<string | null>(null)
  const prevCompleted = useRef(habit.isCompletedToday)
  const noteRef = useRef<HTMLTextAreaElement>(null)
  const noteTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const router = useRouter()
  const supabase = createClient()
  const { t, language } = useLanguage()

  const targetDate = selectedDate ? formatDateForDB(selectedDate) : formatDateForDB(new Date())

  // Sync state when parent updates (date change)
  useEffect(() => {
    if (prevCompleted.current !== habit.isCompletedToday) {
      prevCompleted.current = habit.isCompletedToday
      setIsCompleted(habit.isCompletedToday)
      setNoteOpen(false)
      setNoteText('')
      setCurrentLogId(null)
    }
  }, [habit.isCompletedToday])

  // Load existing note for the selected date
  useEffect(() => {
    const log = habit.logs.find((l) => l.completed_at === targetDate)
    if (log) {
      setCurrentLogId(log.id)
      setNoteText(log.note ?? '')
    } else {
      setCurrentLogId(null)
      setNoteText('')
    }
  }, [habit.logs, targetDate])

  async function toggleHabit() {
    const newState = !isCompleted
    setIsCompleted(newState)
    onToggle(habit.id, newState)

    if (newState) {
      setJustCompleted(true)
      setTimeout(() => setJustCompleted(false), 600)
      // Auto-open note input after a short delay
      setTimeout(() => setNoteOpen(true), 400)
    } else {
      setNoteOpen(false)
    }

    startTransition(async () => {
      if (newState) {
        const { data: existingLog } = await supabase
          .from('habit_logs')
          .select('id, note')
          .eq('habit_id', habit.id)
          .eq('completed_at', targetDate)
          .maybeSingle()

        if (existingLog) {
          setCurrentLogId(existingLog.id)
          setNoteText(existingLog.note ?? '')
          toast.success(language === 'es' ? `${habit.name} completado!` : `${habit.name} completed!`)
          router.refresh()
          return
        }

        const { data: inserted, error } = await supabase
          .from('habit_logs')
          .insert({ habit_id: habit.id, user_id: habit.user_id, completed_at: targetDate })
          .select('id')
          .single()

        if (error) {
          setIsCompleted(false)
          onToggle(habit.id, false)
          setNoteOpen(false)
          toast.error(language === 'es' ? 'Error al registrar' : 'Failed to log habit')
          return
        }

        setCurrentLogId(inserted?.id ?? null)
        toast.success(language === 'es' ? `${habit.name} completado!` : `${habit.name} completed!`)
      } else {
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

        setCurrentLogId(null)
        setNoteText('')
      }

      router.refresh()
    })
  }

  function handleNoteChange(val: string) {
    setNoteText(val)
    if (noteTimeout.current) clearTimeout(noteTimeout.current)
    noteTimeout.current = setTimeout(() => saveNote(val), 1000)
  }

  async function saveNote(note: string) {
    if (!currentLogId) return
    await supabase
      .from('habit_logs')
      .update({ note: note || null })
      .eq('id', currentLogId)
  }

  const isBestStreak = habit.bestStreak > 0 && habit.streak === habit.bestStreak && habit.streak >= 3

  return (
    <div
      className="animate-fade-in-up"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div
        className={cn(
          'w-full rounded-2xl transition-all duration-300 border shadow-sm',
          isCompleted
            ? cn('border-transparent shadow-md ring-1', getColorRingClass(habit.color))
            : 'bg-card border-border/60 hover:border-border hover:shadow-md',
          isPending && 'opacity-60 pointer-events-none'
        )}
        style={
          isCompleted
            ? { background: `linear-gradient(135deg, color-mix(in oklch, var(--card) 85%, var(--primary)) 0%, var(--card) 100%)` }
            : undefined
        }
      >
        {/* Main row */}
        <div className="flex items-center gap-3 p-4">
          <button
            onClick={toggleHabit}
            disabled={isPending}
            className="flex-1 flex items-center gap-3 active:scale-[0.98] transition-transform cursor-pointer"
          >
            {/* Icon */}
            <div
              className={cn(
                'w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 shrink-0',
                isCompleted
                  ? cn(getColorClass(habit.color), 'text-white shadow-md')
                  : 'bg-secondary text-muted-foreground'
              )}
            >
              {isCompleted ? (
                <Check className={cn('h-6 w-6 transition-all duration-300', justCompleted && 'animate-scale-pop')} />
              ) : (
                <HabitIcon icon={habit.icon} className="h-6 w-6" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-left min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className={cn(
                  'font-semibold text-sm leading-snug truncate transition-all duration-300',
                  isCompleted && 'text-muted-foreground line-through decoration-1'
                )}>
                  {habit.name}
                </h3>
                {isBestStreak && (
                  <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 shrink-0" />
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                {habit.streak > 0 && (
                  <div className="flex items-center gap-0.5">
                    <Flame className={cn(
                      'h-3.5 w-3.5 text-orange-500 shrink-0',
                      habit.streak >= 7 && 'animate-pulse-flame'
                    )} />
                    <span className="text-xs text-muted-foreground">
                      {habit.streak} {t.dayStreak}
                    </span>
                  </div>
                )}
                {habit.bestStreak > 1 && (
                  <span className="text-xs text-muted-foreground/60">
                    · {t.bestStreak}: {habit.bestStreak}
                  </span>
                )}
              </div>
            </div>

            {/* Check circle */}
            <div className={cn(
              'w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-300 shrink-0',
              isCompleted
                ? cn(getColorClass(habit.color), 'border-transparent scale-110')
                : 'border-border/70 hover:border-primary/50'
            )}>
              {isCompleted && (
                <Check className={cn('h-3.5 w-3.5 text-white', justCompleted && 'animate-scale-pop')} />
              )}
            </div>
          </button>

          {/* Note toggle (only when completed) */}
          {isCompleted && (
            <button
              onClick={() => {
                setNoteOpen((v) => !v)
                if (!noteOpen) setTimeout(() => noteRef.current?.focus(), 50)
              }}
              className={cn(
                'h-8 w-8 rounded-xl flex items-center justify-center transition-all cursor-pointer',
                noteOpen || noteText
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              )}
              title={t.addNote}
            >
              <MessageSquare className="h-4 w-4" />
            </button>
          )}

          {/* More menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground cursor-pointer">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">{t.editHabit}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/edit-habit/${habit.id}`} className="flex items-center gap-2 cursor-pointer">
                  <Pencil className="h-4 w-4" />
                  {t.editHabit}
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Note input (collapsible) */}
        {isCompleted && noteOpen && (
          <div className="px-4 pb-4 animate-fade-in-up" style={{ animationDelay: '0ms' }}>
            <textarea
              ref={noteRef}
              value={noteText}
              onChange={(e) => handleNoteChange(e.target.value)}
              placeholder={t.notePlaceholder}
              rows={2}
              className={cn(
                'w-full resize-none rounded-xl border border-border/50 bg-background/60 px-3 py-2 text-sm',
                'placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/30',
                'transition-all duration-200'
              )}
            />
            <p className="text-[10px] text-muted-foreground/50 mt-1 text-right">
              {t.noteSaved}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
