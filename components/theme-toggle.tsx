'use client'

import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Moon, Sun } from 'lucide-react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="flex items-center gap-1 bg-secondary rounded-lg p-1">
      <Button
        variant={theme === 'light' ? 'default' : 'ghost'}
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => setTheme('light')}
      >
        <Sun className="h-4 w-4" />
        <span className="sr-only">Light mode</span>
      </Button>
      <Button
        variant={theme === 'dark' ? 'default' : 'ghost'}
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => setTheme('dark')}
      >
        <Moon className="h-4 w-4" />
        <span className="sr-only">Dark mode</span>
      </Button>
    </div>
  )
}
