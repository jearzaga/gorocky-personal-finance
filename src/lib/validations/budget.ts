import { z } from 'zod'

export const createBudgetSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  period: z.enum(['monthly', 'weekly', 'yearly'], {
    message: 'Period must be monthly, weekly, or yearly'
  }),
})

export const updateBudgetSchema = createBudgetSchema.partial()

export type CreateBudgetInput = z.infer<typeof createBudgetSchema>
export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>
