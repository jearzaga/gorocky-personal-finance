'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

type FormState = {
  error?: string
  success?: boolean
}

/**
 * Adds a category to user's collection (M:N relationship)
 */
export async function addUserCategory(categoryId: string): Promise<FormState> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'You must be logged in to manage categories.' }
  }

  const { error: dbError } = await supabase
    .from('user_categories')
    .insert({
      user_id: user.id,
      category_id: categoryId,
      is_favorite: false,
    })

  if (dbError) {
    console.error('[addUserCategory] Database error:', dbError)
    return { error: 'Failed to add category. Please try again.' }
  }

  revalidatePath('/dashboard/categories')
  return { success: true }
}

/**
 * Removes a category from user's collection (M:N relationship)
 */
export async function removeUserCategory(categoryId: string): Promise<FormState> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'You must be logged in to manage categories.' }
  }

  const { error: dbError } = await supabase
    .from('user_categories')
    .delete()
    .eq('user_id', user.id)
    .eq('category_id', categoryId)

  if (dbError) {
    console.error('[removeUserCategory] Database error:', dbError)
    return { error: 'Failed to remove category. Please try again.' }
  }

  revalidatePath('/dashboard/categories')
  return { success: true }
}

/**
 * Toggles a category as favorite
 */
export async function toggleFavoriteCategory(
  categoryId: string,
  currentFavoriteStatus: boolean
): Promise<FormState> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'You must be logged in to manage favorites.' }
  }

  const { error: dbError } = await supabase
    .from('user_categories')
    .update({ is_favorite: !currentFavoriteStatus })
    .eq('user_id', user.id)
    .eq('category_id', categoryId)

  if (dbError) {
    console.error('[toggleFavoriteCategory] Database error:', dbError)
    return { error: 'Failed to update favorite status. Please try again.' }
  }

  revalidatePath('/dashboard/categories')
  return { success: true }
}
