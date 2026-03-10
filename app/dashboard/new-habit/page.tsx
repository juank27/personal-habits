'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
import { HABIT_ICONS, HABIT_COLORS } from '@/lib/types'
import { getColorClass } from '@/lib/habits'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { ArrowLeft, Check } from 'lucide-react'

export default function NewHabitPage() {
  const [name, setName] = useState('')
  const [selectedIcon, setSelectedIcon] = useState('heart')
  const [selectedColor, setSelectedColor] = useState('purple')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const { t } = useLanguage()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!name.trim()) {
      toast.error(t.enterHabitName)
      return
    }

    setIsLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      toast.error(t.mustBeLoggedIn)
      setIsLoading(false)
      return
    }

    const { error } = await supabase.from('habits').insert({
      user_id: user.id,
      name: name.trim(),
      icon: selectedIcon,
      color: selectedColor,
    })

    if (error) {
      toast.error(t.failedToCreate)
      setIsLoading(false)
      return
    }

    toast.success(t.habitCreated)
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <main className="max-w-lg mx-auto px-4 pt-6">
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {t.back}
        </Link>
      </div>

      <Card className="border-0 shadow-xl shadow-primary/5">
        <CardHeader>
          <CardTitle className="text-xl">{t.createNewHabit}</CardTitle>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
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

            <Field>
              <Label>{t.icon}</Label>
              <div className="grid grid-cols-6 gap-2 mt-2">
                {HABIT_ICONS.map((icon) => (
                  <button
                    key={icon.value}
                    type="button"
                    onClick={() => setSelectedIcon(icon.value)}
                    className={cn(
                      'w-full aspect-square rounded-xl flex items-center justify-center transition-all',
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

            <Field>
              <Label>{t.color}</Label>
              <div className="flex gap-2 mt-2">
                {HABIT_COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setSelectedColor(color.value)}
                    className={cn(
                      'w-10 h-10 rounded-full transition-all',
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

            {/* Preview */}
            <div className="pt-4 border-t border-border">
              <Label className="text-muted-foreground">{t.preview}</Label>
              <div className="mt-3 flex items-center gap-4 p-4 rounded-2xl bg-secondary/50">
                <div className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center',
                  getColorClass(selectedColor)
                )}>
                  <HabitIcon icon={selectedIcon} className="h-6 w-6 text-white" />
                </div>
                <span className="font-medium">
                  {name || 'Your habit name'}
                </span>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base font-medium"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Spinner className="mr-2" />
                  {t.creating}
                </>
              ) : (
                t.createHabit
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
