'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Empty, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from '@/components/ui/empty'
import { useLanguage } from '@/components/language-provider'
import { Sparkles, Plus } from 'lucide-react'

export function EmptyHabits() {
  const { t, language } = useLanguage()
  
  return (
    <Empty className="py-12 border-0">
      <EmptyMedia variant="icon">
        <Sparkles className="h-6 w-6 text-primary" />
      </EmptyMedia>
      <EmptyTitle>{t.noHabitsYet}</EmptyTitle>
      <EmptyDescription>
        {language === 'es' 
          ? 'Crea tu primer hábito para comenzar a construir mejores rutinas.'
          : 'Create your first habit to start building better routines.'}
      </EmptyDescription>
      <EmptyContent>
        <Button asChild>
          <Link href="/dashboard/new-habit">
            <Plus className="mr-2 h-4 w-4" />
            {t.createFirstHabit}
          </Link>
        </Button>
      </EmptyContent>
    </Empty>
  )
}
