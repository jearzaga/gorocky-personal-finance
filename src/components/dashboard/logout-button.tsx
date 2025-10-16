'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { logout } from '@/app/actions/auth'

export function LogoutButton() {
  const [isPending, startTransition] = useTransition()

  const handleLogout = () => {
    startTransition(async () => {
      const result = await logout()
      if (result?.error) {
        toast.error(result.error)
      }
    })
  }

  return (
    <Button variant="outline" onClick={handleLogout} disabled={isPending}>
      {isPending ? 'Logging out...' : 'Logout'}
    </Button>
  )
}
