'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createTransactionSchema, updateTransactionSchema } from '@/lib/validations/transaction'
import type { Database } from '@/types/database.types'

type FormState = {
  error?: string
  fieldErrors?: {
    budget_id?: string[]
    category_id?: string[]
    amount?: string[]
    description?: string[]
    transaction_date?: string[]
    type?: string[]
  }
  success?: boolean
}

export async function createTransaction(prevState: FormState | null, formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return {
      error: 'You must be logged in to create a transaction',
    }
  }

  const validatedFields = createTransactionSchema.safeParse({
    budget_id: formData.get('budget_id'),
    category_id: formData.get('category_id') === 'none' ? null : formData.get('category_id'),
    amount: formData.get('amount'),
    description: formData.get('description') || null,
    transaction_date: formData.get('transaction_date'),
    type: formData.get('type'),
  })

  if (!validatedFields.success) {
    return {
      error: 'Please check all fields and try again',
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    }
  }

  // Verify budget belongs to user
  const { data: budget } = await supabase
    .from('budgets')
    .select('id')
    .eq('id', validatedFields.data.budget_id)
    .eq('user_id', user.id)
    .single()

  if (!budget) {
    return {
      error: 'Budget not found or access denied',
    }
  }

  const transactionData: Database['public']['Tables']['transactions']['Insert'] = {
    ...validatedFields.data,
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('transactions') as any).insert(transactionData)

  if (error) {
    console.error('Transaction creation error:', error)
    return {
      error: 'Failed to create transaction. Please try again.',
    }
  }

  revalidatePath(`/dashboard/budgets/${validatedFields.data.budget_id}`)
  revalidatePath('/dashboard/transactions')
  redirect(`/dashboard/budgets/${validatedFields.data.budget_id}`)
}

export async function updateTransaction(
  id: string,
  prevState: FormState | null,
  formData: FormData
) {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return {
      error: 'You must be logged in to update a transaction',
    }
  }

  const validatedFields = updateTransactionSchema.safeParse({
    budget_id: formData.get('budget_id'),
    category_id: formData.get('category_id') === 'none' ? null : formData.get('category_id'),
    amount: formData.get('amount'),
    description: formData.get('description') || null,
    transaction_date: formData.get('transaction_date'),
    type: formData.get('type'),
  })

  if (!validatedFields.success) {
    return {
      error: 'Please check all fields and try again',
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const updates: Database['public']['Tables']['transactions']['Update'] = Object.fromEntries(
    Object.entries(validatedFields.data).filter(([, v]) => v !== undefined)
  )

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error, data } = await (supabase.from('transactions') as any)
    .update(updates)
    .eq('id', id)
    .select('budget_id')
    .single()

  if (error) {
    console.error('Transaction update error:', error)
    return {
      error: 'Failed to update transaction. Please try again.',
    }
  }

  revalidatePath(`/dashboard/budgets/${data.budget_id}`)
  revalidatePath('/dashboard/transactions')
  return { success: true }
}

export async function deleteTransaction(id: string, budgetId: string) {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return {
      error: 'You must be logged in to delete a transaction',
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('transactions') as any)
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Transaction deletion error:', error)
    return {
      error: 'Failed to delete transaction. Please try again.',
    }
  }

  revalidatePath(`/dashboard/budgets/${budgetId}`)
  revalidatePath('/dashboard/transactions')
  redirect(`/dashboard/budgets/${budgetId}`)
}
