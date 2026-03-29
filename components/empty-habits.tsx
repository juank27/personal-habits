'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/components/language-provider'
import { Sparkles, Plus, ArrowRight } from 'lucide-react'

export function EmptyHabits() {
  const { t, language } = useLanguage()

  return (
    <div className="flex flex-col items-center justify-center py-14 px-6 text-center animate-fade-in-up">
      {/* Animated icon container */}
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/20 to-violet-400/20 flex items-center justify-center animate-float shadow-lg shadow-primary/10">
          <Sparkles className="h-9 w-9 text-primary" />
        </div>
        {/* Decorative dots */}
        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary/30 animate-pulse" />
        <div className="absolute -bottom-1 -left-1 w-3 h-3 rounded-full bg-violet-400/40 animate-pulse" style={{ animationDelay: '0.5s' }} />
      </div>

      <h3 className="text-xl font-bold mb-2">{t.noHabitsYet}</h3>
      <p className="text-sm text-muted-foreground max-w-xs leading-relaxed mb-8">
        {language === 'es'
          ? 'Crea tu primer hábito para comenzar a construir mejores rutinas.'
          : 'Create your first habit to start building better routines.'}
      </p>

      <Button
        asChild
        className="rounded-2xl h-12 px-6 shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-105 active:scale-95 transition-all duration-200"
      >
        <Link href="/dashboard/new-habit" className="flex items-center gap-2">
          <Plus className="h-4 w-4" strokeWidth={2.5} />
          {t.createFirstHabit}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
    </div>
  )
}
