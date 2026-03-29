'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BarChart3, User } from 'lucide-react'
import { useLanguage } from '@/components/language-provider'
import { cn } from '@/lib/utils'

export function BottomNav() {
  const pathname = usePathname()
  const { t } = useLanguage()

  const navItems = [
    { href: '/dashboard', icon: Home, label: t.today },
    { href: '/dashboard/stats', icon: BarChart3, label: t.stats },
    { href: '/dashboard/profile', icon: User, label: t.profile },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-area-inset-bottom">
      {/* Blur backdrop */}
      <div className="absolute inset-0 bg-card/75 backdrop-blur-xl border-t border-border/40" />

      <div className="relative flex items-center justify-around max-w-lg mx-auto px-2 py-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative flex flex-col items-center gap-0.5 px-5 py-2.5 rounded-2xl transition-all duration-200 cursor-pointer',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {/* Active pill background */}
              {isActive && (
                <span className="absolute inset-0 rounded-2xl bg-primary/10 animate-scale-pop" />
              )}

              <item.icon
                className={cn(
                  'h-5 w-5 relative z-10 transition-all duration-200',
                  isActive ? 'stroke-[2.5] scale-110' : 'stroke-2'
                )}
              />
              <span
                className={cn(
                  'text-[10px] font-semibold relative z-10 transition-all duration-200',
                  isActive ? 'opacity-100' : 'opacity-60'
                )}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
