'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { loginSchema, signupSchema } from '@/lib/validations/auth'

type FormState = {
  error?: string
  fieldErrors?: {
    email?: string[]
    password?: string[]
    confirmPassword?: string[]
    displayName?: string[]
  }
}

export async function login(prevState: FormState | null, formData: FormData) {
  const supabase = await createClient()

  const validatedFields = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!validatedFields.success) {
    return {
      error: 'Please check your email and password',
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { email, password } = validatedFields.data

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return {
      error: error.message === 'Invalid login credentials' 
        ? 'Invalid email or password. Please try again.' 
        : error.message,
    }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(prevState: FormState | null, formData: FormData) {
  const supabase = await createClient()

  const validatedFields = signupSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
    displayName: formData.get('displayName'),
  })

  if (!validatedFields.success) {
    return {
      error: 'Please check all fields and try again',
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { email, password, displayName } = validatedFields.data

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName,
      },
    },
  })

  if (error) {
    if (error.message.includes('already registered')) {
      return {
        error: 'This email is already registered. Please login instead.',
      }
    }
    return {
      error: error.message,
    }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function logout() {
  const supabase = await createClient()
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    return {
      error: 'Failed to logout. Please try again.',
    }
  }
  
  revalidatePath('/', 'layout')
  redirect('/login')
}
