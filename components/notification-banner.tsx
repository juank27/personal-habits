'use client'

import { useState, useEffect } from 'react'
import { Bell, BellOff, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/components/language-provider'
import { requestNotificationPermission, getNotificationPermission } from '@/hooks/use-notifications'
import { useHabitNotifications } from '@/hooks/use-notifications'
import type { HabitWithLogs } from '@/lib/types'
import { cn } from '@/lib/utils'

interface NotificationBannerProps {
  habits: HabitWithLogs[]
}

export function NotificationBanner({ habits }: NotificationBannerProps) {
  const { t } = useLanguage()
  const [permission, setPermission] = useState<string>('default')
  const [dismissed, setDismissed] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Start the notification check loop
  useHabitNotifications(habits, t.reminderFor)

  useEffect(() => {
    setMounted(true)
    setPermission(getNotificationPermission())
    const key = 'habitflow-notif-dismissed'
    if (localStorage.getItem(key) === 'true') setDismissed(true)
  }, [])

  if (!mounted) return null

  const hasReminders = habits.some((h) => h.reminder_time)
  if (!hasReminders) return null
  if (permission === 'granted') return null
  if (permission === 'denied') return null
  if (permission === 'unsupported') return null
  if (dismissed) return null

  async function handleEnable() {
    const result = await requestNotificationPermission()
    setPermission(result)
  }

  function handleDismiss() {
    setDismissed(true)
    localStorage.setItem('habitflow-notif-dismissed', 'true')
  }

  return (
    <div className={cn(
      'flex items-center gap-3 p-3 rounded-2xl mb-4',
      'bg-primary/8 border border-primary/20 animate-fade-in-up'
    )}>
      <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
        <Bell className="h-4 w-4 text-primary" />
      </div>
      <p className="text-xs text-foreground/80 flex-1 leading-snug">
        {t.enableReminder}
      </p>
      <Button
        size="sm"
        variant="ghost"
        className="h-7 text-xs rounded-xl px-3 text-primary hover:bg-primary/10 shrink-0"
        onClick={handleEnable}
      >
        {t.enableReminder.split(' ')[0]}
      </Button>
      <button
        onClick={handleDismiss}
        className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

// Simple component just to run the notification hook (for when banner is not shown)
export function NotificationScheduler({ habits }: { habits: HabitWithLogs[] }) {
  const { t } = useLanguage()
  useHabitNotifications(habits, t.reminderFor)
  return null
}
