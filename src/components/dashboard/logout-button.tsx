'use client'

import { useTransition } from 'react'
import { LogOut } from 'lucide-react'
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
    <Button 
      variant="ghost" 
      className="w-full justify-start" 
      onClick={handleLogout} 
      disabled={isPending}
    >
      <LogOut className="mr-2 h-4 w-4" />
      {isPending ? 'Logging out...' : 'Logout'}
    </Button>
  )
}
