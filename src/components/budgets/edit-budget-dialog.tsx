'use client'

import { useState } from 'react'
import { Pencil } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { BudgetForm } from './budget-form'
import type { Budget } from '@/types'

interface EditBudgetDialogProps {
  budget: Budget
}

export function EditBudgetDialog({ budget }: EditBudgetDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Budget</DialogTitle>
          <DialogDescription>
            Update your budget details
          </DialogDescription>
        </DialogHeader>
        <BudgetForm budget={budget} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}
