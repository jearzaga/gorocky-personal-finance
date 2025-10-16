import { z } from 'zod'

export const createTransactionSchema = z.object({
  budget_id: z.string().uuid('Invalid budget'),
  category_id: z.string().uuid('Invalid category').optional().nullable(),
  amount: z.coerce.number().refine((val) => val !== 0, 'Amount cannot be zero'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional().nullable(),
  transaction_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  type: z.enum(['income', 'expense'], {
    message: 'Type must be income or expense'
  }),
})

export const updateTransactionSchema = createTransactionSchema.partial()

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>
