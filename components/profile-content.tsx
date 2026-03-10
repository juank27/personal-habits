'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ProfileActions } from '@/components/profile-actions'
import { ThemeToggle } from '@/components/theme-toggle'
import { LanguageSelector } from '@/components/language-selector'
import { HabitIcon } from '@/components/habit-icon'
import { useLanguage } from '@/components/language-provider'
import { getColorClass } from '@/lib/habits'
import { cn } from '@/lib/utils'
import { Calendar, Target, Settings, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { Habit } from '@/lib/types'

interface ProfileContentProps {
  user: {
    id: string
    email: string | undefined
    created_at: string
  }
  profile: {
    display_name: string | null
  } | null
  habits: Habit[]
}

export function ProfileContent({ user, profile, habits }: ProfileContentProps) {
  const { t, language } = useLanguage()
  const router = useRouter()
  const supabase = createClient()

  const displayName = profile?.display_name || user.email?.split('@')[0] || 'User'
  const initials = displayName.slice(0, 2).toUpperCase()
  
  // Format member since date based on language
  const memberSinceDate = new Date(user.created_at)
  const memberSince = language === 'es' 
    ? memberSinceDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
    : memberSinceDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const daysActive = Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24))

  async function handleDeleteHabit(habitId: string, habitName: string) {
    const { error } = await supabase.from('habits').delete().eq('id', habitId)
    
    if (error) {
      toast.error(language === 'es' ? 'Error al eliminar' : 'Failed to delete')
      return
    }

    toast.success(language === 'es' ? `${habitName} eliminado` : `${habitName} deleted`)
    router.refresh()
  }

  return (
    <main className="max-w-lg mx-auto px-4 pt-6 pb-24">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">{t.profile}</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {t.manageAccount}
        </p>
      </header>

      {/* Profile Card */}
      <Card className="mb-6 border-0 shadow-sm">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold">{displayName}</h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {t.memberSince} {memberSince}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{habits.length}</p>
              <p className="text-xs text-muted-foreground">{t.habits}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{daysActive}</p>
              <p className="text-xs text-muted-foreground">{t.daysActive}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Settings */}
      <Card className="mb-6 border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Settings className="h-4 w-4" />
            {t.settings}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <div className="flex items-center justify-between py-3 border-b border-border/50">
            <span className="text-sm font-medium">{t.appearance}</span>
            <ThemeToggle />
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="text-sm font-medium">{t.language}</span>
            <LanguageSelector />
          </div>
        </CardContent>
      </Card>

      {/* My Habits List */}
      {habits.length > 0 && (
        <Card className="mb-6 border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t.myHabits}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {habits.map((habit) => (
              <div
                key={habit.id}
                className="flex items-center gap-3 py-2"
              >
                <div className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center',
                  getColorClass(habit.color)
                )}>
                  <HabitIcon icon={habit.icon} className="h-4 w-4 text-white" />
                </div>
                <span className="flex-1 text-sm">{habit.name}</span>
                <button
                  onClick={() => handleDeleteHabit(habit.id, habit.name)}
                  className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                  title={language === 'es' ? `Eliminar ${habit.name}` : `Delete ${habit.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Sign Out */}
      <ProfileActions />
    </main>
  )
}
