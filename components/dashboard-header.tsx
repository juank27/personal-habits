'use client'

import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/components/language-provider'
import Link from 'next/link'

interface DashboardHeaderProps {
  displayName: string
}

export function DashboardHeader({ displayName }: DashboardHeaderProps) {
  const { t, language } = useLanguage()
  const today = new Date()
  
  // Format date based on language
  const formattedDate = language === 'es'
    ? today.toLocaleDateString('es-ES', { weekday: 'long', month: 'long', day: 'numeric' })
    : today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  const greeting = getGreeting(t)

  return (
    <header className="flex items-start justify-between mb-6">
      <div>
        <p className="text-muted-foreground text-sm capitalize">
          {formattedDate}
        </p>
        <h1 className="text-2xl font-bold mt-1">
          {greeting}, {displayName}!
        </h1>
      </div>
      <Button size="icon" className="rounded-xl h-10 w-10" asChild>
        <Link href="/dashboard/new-habit">
          <Plus className="h-5 w-5" />
          <span className="sr-only">{language === 'es' ? 'Agregar hábito' : 'Add new habit'}</span>
        </Link>
      </Button>
    </header>
  )
}

function getGreeting(t: { goodMorning: string; goodAfternoon: string; goodEvening: string }): string {
  const hour = new Date().getHours()
  if (hour < 12) return t.goodMorning
  if (hour < 17) return t.goodAfternoon
  return t.goodEvening
}
