import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ProfileActions } from '@/components/profile-actions'
import { ThemeToggle } from '@/components/theme-toggle'
import { HabitIcon } from '@/components/habit-icon'
import { getColorClass } from '@/lib/habits'
import { cn } from '@/lib/utils'
import { User, Calendar, Target, Settings, ChevronRight, Trash2 } from 'lucide-react'
import type { Habit } from '@/lib/types'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch habits count
  const { data: habits } = await supabase
    .from('habits')
    .select('*')
    .eq('user_id', user.id)

  const habitsData = (habits as Habit[]) || []
  const displayName = profile?.display_name || user.email?.split('@')[0] || 'User'
  const initials = displayName.slice(0, 2).toUpperCase()
  const memberSince = format(new Date(user.created_at), 'MMMM yyyy')

  return (
    <main className="max-w-lg mx-auto px-4 pt-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your account settings
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
                Member since {memberSince}
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
              <p className="text-2xl font-bold">{habitsData.length}</p>
              <p className="text-xs text-muted-foreground">Habits</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24))}</p>
              <p className="text-xs text-muted-foreground">Days Active</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Settings */}
      <Card className="mb-6 border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">Appearance</span>
            </div>
            <ThemeToggle />
          </div>
        </CardContent>
      </Card>

      {/* My Habits List */}
      {habitsData.length > 0 && (
        <Card className="mb-6 border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">My Habits</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {habitsData.map((habit) => (
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
                <DeleteHabitButton habitId={habit.id} habitName={habit.name} />
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

function DeleteHabitButton({ habitId, habitName }: { habitId: string; habitName: string }) {
  return (
    <form action={async () => {
      'use server'
      const supabase = await createClient()
      await supabase.from('habits').delete().eq('id', habitId)
    }}>
      <button
        type="submit"
        className="p-2 text-muted-foreground hover:text-destructive transition-colors"
        title={`Delete ${habitName}`}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </form>
  )
}
