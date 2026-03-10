'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { LogOut } from 'lucide-react'

export function ProfileActions() {
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      toast.error('Failed to sign out')
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
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </CardContent>
    </Card>
  )
}
