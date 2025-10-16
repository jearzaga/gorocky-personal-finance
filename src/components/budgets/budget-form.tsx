'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { useEffect } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createBudget, updateBudget } from '@/app/actions/budgets'
import type { Budget } from '@/types'

function SubmitButton({ isEdit }: { isEdit?: boolean }) {
  const { pending } = useFormStatus()
  
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update Budget' : 'Create Budget')}
    </Button>
  )
}

interface BudgetFormProps {
  budget?: Budget
  onSuccess?: () => void
}

export function BudgetForm({ budget, onSuccess }: BudgetFormProps) {
  const action = budget 
    ? updateBudget.bind(null, budget.id)
    : createBudget
  
  const [state, formAction] = useActionState(action, null)

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error)
    }
    if (state?.success) {
      toast.success(budget ? 'Budget updated successfully!' : 'Budget created successfully!')
      onSuccess?.()
    }
  }, [state, budget, onSuccess])

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Budget Name</Label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="e.g. Monthly Groceries"
          defaultValue={budget?.name}
          required
        />
        {state?.fieldErrors?.name && (
          <p className="text-sm text-destructive">{state.fieldErrors.name[0]}</p>
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
          defaultValue={budget?.amount}
          required
        />
        {state?.fieldErrors?.amount && (
          <p className="text-sm text-destructive">{state.fieldErrors.amount[0]}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="period">Period</Label>
        <Select name="period" defaultValue={budget?.period || 'monthly'}>
          <SelectTrigger>
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="yearly">Yearly</SelectItem>
          </SelectContent>
        </Select>
        {state?.fieldErrors?.period && (
          <p className="text-sm text-destructive">{state.fieldErrors.period[0]}</p>
        )}
      </div>

      <SubmitButton isEdit={!!budget} />
    </form>
  )
}
