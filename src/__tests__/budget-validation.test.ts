import { createBudgetSchema, updateBudgetSchema } from '@/lib/validations/budget'

describe('Budget Validation', () => {
  describe('createBudgetSchema', () => {
    it('validates a valid budget', () => {
      const validBudget = {
        name: 'Groceries',
        amount: 500,
        period: 'monthly' as const
      }

      const result = createBudgetSchema.safeParse(validBudget)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(validBudget)
      }
    })

    it('rejects budget with empty name', () => {
      const invalidBudget = {
        name: '',
        amount: 500,
        period: 'monthly' as const
      }

      const result = createBudgetSchema.safeParse(invalidBudget)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Name is required')
      }
    })

    it('rejects budget with name longer than 100 characters', () => {
      const invalidBudget = {
        name: 'a'.repeat(101),
        amount: 500,
        period: 'monthly' as const
      }

      const result = createBudgetSchema.safeParse(invalidBudget)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Name must be less than 100 characters')
      }
    })

    it('rejects budget with zero amount', () => {
      const invalidBudget = {
        name: 'Groceries',
        amount: 0,
        period: 'monthly' as const
      }

      const result = createBudgetSchema.safeParse(invalidBudget)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Amount must be greater than 0')
      }
    })

    it('rejects budget with negative amount', () => {
      const invalidBudget = {
        name: 'Groceries',
        amount: -100,
        period: 'monthly' as const
      }

      const result = createBudgetSchema.safeParse(invalidBudget)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Amount must be greater than 0')
      }
    })

    it('rejects budget with invalid period', () => {
      const invalidBudget = {
        name: 'Groceries',
        amount: 500,
        period: 'daily' // Invalid period
      }

      const result = createBudgetSchema.safeParse(invalidBudget)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Period must be monthly, weekly, or yearly')
      }
    })

    it('coerces string amount to number', () => {
      const budgetWithStringAmount = {
        name: 'Groceries',
        amount: '500', // String instead of number
        period: 'monthly' as const
      }

      const result = createBudgetSchema.safeParse(budgetWithStringAmount)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.amount).toBe(500)
        expect(typeof result.data.amount).toBe('number')
      }
    })

    it('accepts all valid period values', () => {
      const periods = ['monthly', 'weekly', 'yearly'] as const

      periods.forEach(period => {
        const budget = {
          name: 'Test Budget',
          amount: 500,
          period
        }

        const result = createBudgetSchema.safeParse(budget)
        expect(result.success).toBe(true)
      })
    })
  })

  describe('updateBudgetSchema', () => {
    it('validates partial update with only name', () => {
      const partialUpdate = {
        name: 'Updated Groceries'
      }

      const result = updateBudgetSchema.safeParse(partialUpdate)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(partialUpdate)
      }
    })

    it('validates partial update with only amount', () => {
      const partialUpdate = {
        amount: 600
      }

      const result = updateBudgetSchema.safeParse(partialUpdate)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(partialUpdate)
      }
    })

    it('validates partial update with only period', () => {
      const partialUpdate = {
        period: 'weekly' as const
      }

      const result = updateBudgetSchema.safeParse(partialUpdate)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(partialUpdate)
      }
    })

    it('validates empty partial update', () => {
      const emptyUpdate = {}

      const result = updateBudgetSchema.safeParse(emptyUpdate)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual({})
      }
    })

    it('rejects invalid values even in partial update', () => {
      const invalidUpdate = {
        amount: -100
      }

      const result = updateBudgetSchema.safeParse(invalidUpdate)
      expect(result.success).toBe(false)
    })
  })
})
