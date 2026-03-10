import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Empty, EmptyIcon, EmptyTitle, EmptyDescription, EmptyActions } from '@/components/ui/empty'
import { Sparkles, Plus } from 'lucide-react'

export function EmptyHabits() {
  return (
    <Empty className="py-12">
      <EmptyIcon>
        <Sparkles className="h-10 w-10" />
      </EmptyIcon>
      <EmptyTitle>No habits yet</EmptyTitle>
      <EmptyDescription>
        Create your first habit to start building better routines.
      </EmptyDescription>
      <EmptyActions>
        <Button asChild>
          <Link href="/dashboard/new-habit">
            <Plus className="mr-2 h-4 w-4" />
            Create your first habit
          </Link>
        </Button>
      </EmptyActions>
    </Empty>
  )
}
