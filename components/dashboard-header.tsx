'use client'

import { format } from 'date-fns'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface DashboardHeaderProps {
  displayName: string
}

export function DashboardHeader({ displayName }: DashboardHeaderProps) {
  const today = new Date()
  const greeting = getGreeting()

  return (
    <header className="flex items-start justify-between mb-6">
      <div>
        <p className="text-muted-foreground text-sm">
          {format(today, 'EEEE, MMMM d')}
        </p>
        <h1 className="text-2xl font-bold mt-1">
          {greeting}, {displayName}!
        </h1>
      </div>
      <Button size="icon" className="rounded-xl h-10 w-10" asChild>
        <Link href="/dashboard/new-habit">
          <Plus className="h-5 w-5" />
          <span className="sr-only">Add new habit</span>
        </Link>
      </Button>
    </header>
  )
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}
