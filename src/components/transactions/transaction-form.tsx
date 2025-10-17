'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { useEffect } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createTransaction, updateTransaction } from '@/app/actions/transactions'
import type { Transaction, Budget, Category } from '@/types'

function SubmitButton({ isEdit }: { isEdit?: boolean }) {
  const { pending } = useFormStatus()
  
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update Transaction' : 'Create Transaction')}
    </Button>
  )
}

interface TransactionFormProps {
  transaction?: Transaction
  budgets: Budget[]
  categories: Category[]
  defaultBudgetId?: string
  onSuccess?: () => void
}

export function TransactionForm({ 
  transaction, 
  budgets, 
  categories, 
  defaultBudgetId,
  onSuccess 
}: TransactionFormProps) {
  const action = transaction 
    ? updateTransaction.bind(null, transaction.id)
    : createTransaction
  
  const [state, formAction] = useActionState(action, null)

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error)
    }
    if (state?.success) {
      toast.success(transaction ? 'Transaction updated!' : 'Transaction created!')
      onSuccess?.()
    }
  }, [state, transaction, onSuccess])

  const today = new Date().toISOString().split('T')[0]

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="budget_id">Budget</Label>
        <Select 
          name="budget_id" 
          defaultValue={transaction?.budget_id || defaultBudgetId}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select budget" />
          </SelectTrigger>
          <SelectContent>
            {budgets.map((budget) => (
              <SelectItem key={budget.id} value={budget.id}>
                {budget.name} (${budget.amount})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {state?.fieldErrors?.budget_id && (
          <p className="text-sm text-destructive">{state.fieldErrors.budget_id[0]}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Type</Label>
        <Select name="type" defaultValue={transaction?.type || 'expense'}>
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="expense">Expense</SelectItem>
            <SelectItem value="income">Income</SelectItem>
          </SelectContent>
        </Select>
        {state?.fieldErrors?.type && (
          <p className="text-sm text-destructive">{state.fieldErrors.type[0]}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Amount</Label>
        <Input
          id="amount"
          name="amount"
          type="number"
          step="0.01"
          placeholder="0.00"
          defaultValue={transaction?.amount}
          required
        />
        {state?.fieldErrors?.amount && (
          <p className="text-sm text-destructive">{state.fieldErrors.amount[0]}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="category_id">Category (Optional)</Label>
        <Select name="category_id" defaultValue={transaction?.category_id || 'none'}>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.icon} {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {state?.fieldErrors?.category_id && (
          <p className="text-sm text-destructive">{state.fieldErrors.category_id[0]}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="transaction_date">Date</Label>
        <Input
          id="transaction_date"
          name="transaction_date"
          type="date"
          defaultValue={transaction?.transaction_date || today}
          required
        />
        {state?.fieldErrors?.transaction_date && (
          <p className="text-sm text-destructive">{state.fieldErrors.transaction_date[0]}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Add a note..."
          defaultValue={transaction?.description || ''}
          rows={3}
        />
        {state?.fieldErrors?.description && (
          <p className="text-sm text-destructive">{state.fieldErrors.description[0]}</p>
        )}
      </div>

      <SubmitButton isEdit={!!transaction} />
    </form>
  )
}
