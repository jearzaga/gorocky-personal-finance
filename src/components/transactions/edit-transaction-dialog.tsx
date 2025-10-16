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
import { TransactionForm } from './transaction-form'
import type { Transaction, Category, Budget } from '@/types'

interface EditTransactionDialogProps {
  transaction: Transaction
  categories: Category[]
  budgetId: string
}

export function EditTransactionDialog({ transaction, categories, budgetId }: EditTransactionDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Transaction</DialogTitle>
          <DialogDescription>
            Update transaction details
          </DialogDescription>
        </DialogHeader>
        <TransactionForm 
          transaction={transaction}
          budgets={[{
            id: budgetId,
            user_id: '',
            name: '',
            amount: 0,
            period: 'monthly',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          } as Budget]}
          categories={categories}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
