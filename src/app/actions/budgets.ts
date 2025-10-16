'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createBudgetSchema, updateBudgetSchema } from '@/lib/validations/budget'

type FormState = {
  error?: string
  fieldErrors?: Record<string, string[]>
  success?: boolean
}

/**
 * Creates a new budget for the authenticated user.
 */
export async function createBudget(
  prevState: FormState | null,
  formData: FormData,
): Promise<FormState> {
  const supabase = await createClient()

  // Check authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'You must be logged in to create a budget.' }
  }

  // Validate input
  const validation = createBudgetSchema.safeParse(Object.fromEntries(formData))
  if (!validation.success) {
    return {
      error: 'Invalid input. Please check the fields and try again.',
      fieldErrors: validation.error.flatten().fieldErrors,
    }
  }

  // Insert budget
  const { error: dbError } = await supabase
    .from('budgets')
    .insert({
      user_id: user.id,
      name: validation.data.name,
      amount: validation.data.amount,
      period: validation.data.period,
    })
    .select('id')
    .single()

  if (dbError) {
    console.error('[createBudget] Database error:', dbError)
    return { error: 'Failed to create budget. Please try again.' }
  }

  revalidatePath('/dashboard/budgets')
  redirect('/dashboard/budgets')
}

/**
 * Updates an existing budget for the authenticated user.
 */
export async function updateBudget(
  id: string,
  prevState: FormState | null,
  formData: FormData,
): Promise<FormState> {
  const supabase = await createClient()

  // Check authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'You must be logged in to update a budget.' }
  }

  // Validate input
  const validation = updateBudgetSchema.safeParse(Object.fromEntries(formData))
  if (!validation.success) {
    return {
      error: 'Invalid input. Please check the fields and try again.',
      fieldErrors: validation.error.flatten().fieldErrors,
    }
  }

  // Update budget
  const { error: dbError } = await supabase
    .from('budgets')
    .update(validation.data)
    .eq('id', id)
    .eq('user_id', user.id)
    .select('id')
    .single()

  if (dbError) {
    console.error('[updateBudget] Database error:', dbError)
    return { error: 'Failed to update budget. Please try again.' }
  }

  revalidatePath('/dashboard/budgets')
  revalidatePath(`/dashboard/budgets/${id}`)

  return { success: true }
}

/**
 * Deletes a budget and its associated transactions.
 */
export async function deleteBudget(id: string): Promise<FormState> {
  const supabase = await createClient()

  // Check authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'You must be logged in to delete a budget.' }
  }

  // Delete budget
  const { error: dbError } = await supabase
    .from('budgets')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)
    .select('id')
    .single()

  if (dbError) {
    console.error('[deleteBudget] Database error:', dbError)
    return { error: 'Failed to delete budget. Please try again.' }
  }

  revalidatePath('/dashboard/budgets')
  redirect('/dashboard/budgets')
}