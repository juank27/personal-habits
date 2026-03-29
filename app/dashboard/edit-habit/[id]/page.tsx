'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Field } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { HabitIcon } from '@/components/habit-icon'
import { useLanguage } from '@/components/language-provider'
import { HABIT_ICONS, HABIT_COLORS, FREQUENCY_OPTIONS, DAY_LABELS_EN, DAY_LABELS_ES } from '@/lib/types'
import { getColorClass } from '@/lib/habits'
import { requestNotificationPermission } from '@/hooks/use-notifications'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { ArrowLeft, Check, Trash2, Bell, BellOff } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

function parseFrequency(freq: string): { mode: string; customDays: number[] } {
  if (!freq || freq === 'daily') return { mode: 'daily', customDays: [1, 2, 3, 4, 5] }
  if (freq === 'weekdays') return { mode: 'weekdays', customDays: [1, 2, 3, 4, 5] }
  if (freq === 'weekends') return { mode: 'weekends', customDays: [0, 6] }
  // Custom numeric
  const days = freq.split(',').map(Number).filter((n) => !isNaN(n))
  return { mode: 'custom', customDays: days }
}

export default function EditHabitPage() {
  const params = useParams()
  const habitId = params.id as string

  const [name, setName] = useState('')
  const [selectedIcon, setSelectedIcon] = useState('heart')
  const [selectedColor, setSelectedColor] = useState('purple')
  const [frequency, setFrequency] = useState('daily')
  const [customDays, setCustomDays] = useState<number[]>([1, 2, 3, 4, 5])
  const [reminderEnabled, setReminderEnabled] = useState(false)
  const [reminderTime, setReminderTime] = useState('08:00')
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const router = useRouter()
  const supabase = createClient()
  const { t, language } = useLanguage()

  const dayLabels = language === 'es' ? DAY_LABELS_ES : DAY_LABELS_EN

  useEffect(() => {
    async function fetchHabit() {
      const { data: habit, error } = await supabase
        .from('habits')
        .select('*')
        .eq('id', habitId)
        .single()

      if (error || !habit) {
        toast.error(t.failedToUpdate)
        router.push('/dashboard')
        return
      }

      setName(habit.name)
      setSelectedIcon(habit.icon)
      setSelectedColor(habit.color)

      const { mode, customDays: days } = parseFrequency(habit.frequency ?? 'daily')
      setFrequency(mode)
      setCustomDays(days)

      if (habit.reminder_time) {
        setReminderEnabled(true)
        setReminderTime(habit.reminder_time)
      }

      setIsFetching(false)
    }

    fetchHabit()
  }, [habitId, router, supabase, t.failedToUpdate])

  function toggleCustomDay(day: number) {
    setCustomDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    )
  }

  async function handleReminderToggle() {
    if (!reminderEnabled) {
      const result = await requestNotificationPermission()
      if (result === 'denied') {
        toast.error(t.notificationsBlocked)
        return
      }
      if (result === 'granted') toast.success(t.notificationsGranted)
    }
    setReminderEnabled((v) => !v)
  }

  function getFrequencyValue(): string {
    if (frequency === 'custom') return customDays.join(',') || 'daily'
    return frequency
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!name.trim()) {
      toast.error(t.enterHabitName)
      return
    }

    setIsLoading(true)

    const { error } = await supabase
      .from('habits')
      .update({
        name: name.trim(),
        icon: selectedIcon,
        color: selectedColor,
        frequency: getFrequencyValue(),
        reminder_time: reminderEnabled ? reminderTime : null,
      })
      .eq('id', habitId)

    if (error) {
      toast.error(t.failedToUpdate)
      setIsLoading(false)
      return
    }

    toast.success(t.habitUpdated)
    router.push('/dashboard')
    router.refresh()
  }

  async function handleDelete() {
    setIsDeleting(true)
    await supabase.from('habit_logs').delete().eq('habit_id', habitId)
    const { error } = await supabase.from('habits').delete().eq('id', habitId)
    if (error) {
      toast.error(t.failedToDelete)
      setIsDeleting(false)
      return
    }
    toast.success(t.habitDeleted)
    router.push('/dashboard')
    router.refresh()
  }

  if (isFetching) {
    return (
      <main className="max-w-lg mx-auto px-4 pt-6 flex items-center justify-center min-h-[50vh]">
        <Spinner className="h-8 w-8" />
      </main>
    )
  }

  return (
    <main className="max-w-lg mx-auto px-4 pt-6 pb-28">
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          {t.back}
        </Link>
      </div>

      <Card className="border-0 shadow-xl shadow-primary/5">
        <CardHeader>
          <CardTitle className="text-xl">{t.editHabit}</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <Field>
              <Label htmlFor="name">{t.habitName}</Label>
              <Input
                id="name"
                type="text"
                placeholder={t.habitNamePlaceholder}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
            </Field>

            {/* Icon */}
            <Field>
              <Label>{t.icon}</Label>
              <div className="grid grid-cols-6 gap-2 mt-2">
                {HABIT_ICONS.map((icon) => (
                  <button
                    key={icon.value}
                    type="button"
                    onClick={() => setSelectedIcon(icon.value)}
                    className={cn(
                      'w-full aspect-square rounded-xl flex items-center justify-center transition-all cursor-pointer',
                      selectedIcon === icon.value
                        ? cn(getColorClass(selectedColor), 'text-white ring-2 ring-offset-2 ring-primary/50')
                        : 'bg-secondary hover:bg-secondary/80 text-muted-foreground'
                    )}
                    title={icon.label}
                  >
                    <HabitIcon icon={icon.value} className="h-5 w-5" />
                  </button>
                ))}
              </div>
            </Field>

            {/* Color */}
            <Field>
              <Label>{t.color}</Label>
              <div className="flex gap-2 mt-2">
                {HABIT_COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setSelectedColor(color.value)}
                    className={cn(
                      'w-10 h-10 rounded-full transition-all cursor-pointer',
                      color.class,
                      selectedColor === color.value
                        ? 'ring-2 ring-offset-2 ring-primary/50 scale-110'
                        : 'hover:scale-105'
                    )}
                    title={color.label}
                  >
                    {selectedColor === color.value && (
                      <Check className="h-5 w-5 text-white mx-auto" />
                    )}
                  </button>
                ))}
              </div>
            </Field>

            {/* Frequency */}
            <Field>
              <Label>{t.frequency}</Label>
              <div className="flex gap-1.5 mt-2 flex-wrap">
                {FREQUENCY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFrequency(opt.value)}
                    className={cn(
                      'px-3 py-1.5 rounded-xl text-sm font-medium transition-all cursor-pointer',
                      frequency === opt.value
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/70'
                    )}
                  >
                    {language === 'es' ? opt.labelEs : opt.labelEn}
                  </button>
                ))}
              </div>

              {frequency === 'custom' && (
                <div className="flex gap-1.5 mt-3">
                  {dayLabels.map((label, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => toggleCustomDay(i)}
                      className={cn(
                        'flex-1 aspect-square rounded-xl text-xs font-bold transition-all cursor-pointer',
                        customDays.includes(i)
                          ? cn(getColorClass(selectedColor), 'text-white')
                          : 'bg-secondary text-muted-foreground hover:bg-secondary/70'
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </Field>

            {/* Reminder */}
            <Field>
              <div className="flex items-center justify-between">
                <Label>{t.reminder}</Label>
                <button
                  type="button"
                  onClick={handleReminderToggle}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all cursor-pointer',
                    reminderEnabled
                      ? 'bg-primary/10 text-primary'
                      : 'bg-secondary text-muted-foreground hover:bg-secondary/70'
                  )}
                >
                  {reminderEnabled ? <Bell className="h-3.5 w-3.5" /> : <BellOff className="h-3.5 w-3.5" />}
                  {reminderEnabled ? 'On' : 'Off'}
                </button>
              </div>

              {reminderEnabled && (
                <div className="mt-2">
                  <input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className={cn(
                      'w-full rounded-xl border border-input bg-background px-3 py-2 text-sm',
                      'focus:outline-none focus:ring-2 focus:ring-ring transition-all'
                    )}
                  />
                </div>
              )}
            </Field>

            {/* Preview */}
            <div className="pt-4 border-t border-border">
              <Label className="text-muted-foreground">{t.preview}</Label>
              <div className="mt-3 flex items-center gap-4 p-4 rounded-2xl bg-secondary/50">
                <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', getColorClass(selectedColor))}>
                  <HabitIcon icon={selectedIcon} className="h-6 w-6 text-white" />
                </div>
                <div>
                  <span className="font-medium">{name || 'Your habit name'}</span>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {FREQUENCY_OPTIONS.find((o) => o.value === frequency)?.[language === 'es' ? 'labelEs' : 'labelEn']}
                    {reminderEnabled && ` · ${reminderTime}`}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                type="submit"
                className="w-full h-12 text-base font-medium cursor-pointer"
                disabled={isLoading}
              >
                {isLoading ? (
                  <><Spinner className="mr-2" />{t.saving}</>
                ) : (
                  t.saveChanges
                )}
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 text-base font-medium text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30 cursor-pointer"
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <><Spinner className="mr-2" />{t.deleting}</>
                    ) : (
                      <><Trash2 className="h-5 w-5 mr-2" />{t.deleteHabit}</>
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t.confirmDelete}</AlertDialogTitle>
                    <AlertDialogDescription>{t.confirmDeleteMessage}</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
                    >
                      {t.delete}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
