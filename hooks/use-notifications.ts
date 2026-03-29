'use client'

import { useEffect, useRef, useCallback } from 'react'
import type { HabitWithLogs } from '@/lib/types'

const STORAGE_KEY = 'habitflow-notified-dates'

function getTodayKey() {
  return new Date().toISOString().slice(0, 10)
}

function getNotifiedMap(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

function markNotified(habitId: string) {
  const map = getNotifiedMap()
  map[habitId] = getTodayKey()
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
}

function wasNotifiedToday(habitId: string): boolean {
  const map = getNotifiedMap()
  return map[habitId] === getTodayKey()
}

function showHabitNotification(habit: HabitWithLogs, bodyText: string) {
  if (Notification.permission !== 'granted') return
  const notif = new Notification(habit.name, {
    body: bodyText,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    tag: `habit-${habit.id}`,
    renotify: false,
  })
  notif.onclick = () => {
    window.focus()
    notif.close()
  }
  markNotified(habit.id)
}

export function useHabitNotifications(habits: HabitWithLogs[], reminderBodyText: string) {
  const habitsRef = useRef(habits)
  habitsRef.current = habits

  const check = useCallback(() => {
    if (typeof window === 'undefined') return
    if (Notification.permission !== 'granted') return

    const now = new Date()
    const hh = String(now.getHours()).padStart(2, '0')
    const mm = String(now.getMinutes()).padStart(2, '0')
    const currentTime = `${hh}:${mm}`

    for (const habit of habitsRef.current) {
      if (!habit.reminder_time) continue
      if (habit.isCompletedToday) continue
      if (wasNotifiedToday(habit.id)) continue

      // Match within the same minute
      if (habit.reminder_time === currentTime) {
        showHabitNotification(habit, reminderBodyText)
      }
    }
  }, [reminderBodyText])

  // Also check on mount for missed reminders (app opened after reminder time)
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (Notification.permission !== 'granted') return

    const now = new Date()
    const hh = String(now.getHours()).padStart(2, '0')
    const mm = String(now.getMinutes()).padStart(2, '0')
    const currentTime = `${hh}:${mm}`

    for (const habit of habits) {
      if (!habit.reminder_time) continue
      if (habit.isCompletedToday) continue
      if (wasNotifiedToday(habit.id)) continue

      // Show if reminder was in the past 30 minutes (missed while app was closed)
      const [rh, rm] = habit.reminder_time.split(':').map(Number)
      const [ch, cm] = currentTime.split(':').map(Number)
      const reminderMinutes = rh * 60 + rm
      const currentMinutes = ch * 60 + cm
      const diff = currentMinutes - reminderMinutes

      if (diff >= 0 && diff <= 30) {
        showHabitNotification(habit, reminderBodyText)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const interval = setInterval(check, 60_000) // check every minute
    return () => clearInterval(interval)
  }, [check])
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined') return 'default'
  if (!('Notification' in window)) return 'denied'
  if (Notification.permission === 'granted') return 'granted'
  if (Notification.permission === 'denied') return 'denied'
  return Notification.requestPermission()
}

export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (typeof window === 'undefined') return 'default' as NotificationPermission
  if (!('Notification' in window)) return 'unsupported'
  return Notification.permission
}
