'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/components/language-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import { LogOut } from 'lucide-react'

export function ProfileActions() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const { t, language } = useLanguage()

  async function handleSignOut() {
    setIsLoading(true)
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      toast.error(language === 'es' ? 'Error al cerrar sesión' : 'Failed to sign out')
      setIsLoading(false)
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-4">
        <Button
          variant="destructive"
          className="w-full"
          onClick={handleSignOut}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Spinner className="mr-2" />
              {t.signingOut}
            </>
          ) : (
            <>
              <LogOut className="mr-2 h-4 w-4" />
              {t.signOut}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
