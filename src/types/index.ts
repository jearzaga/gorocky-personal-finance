import { Database } from './database.types'

// Utility types for cleaner imports
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Specific table types
export type Profile = Tables<'profiles'>
export type Budget = Tables<'budgets'>
export type Transaction = Tables<'transactions'>
export type Category = Tables<'categories'>
export type UserCategory = Tables<'user_categories'>

// Insert types
export type ProfileInsert = Inserts<'profiles'>
export type BudgetInsert = Inserts<'budgets'>
export type TransactionInsert = Inserts<'transactions'>
export type CategoryInsert = Inserts<'categories'>
export type UserCategoryInsert = Inserts<'user_categories'>

// Update types
export type ProfileUpdate = Updates<'profiles'>
export type BudgetUpdate = Updates<'budgets'>
export type TransactionUpdate = Updates<'transactions'>
export type CategoryUpdate = Updates<'categories'>
export type UserCategoryUpdate = Updates<'user_categories'>

// Extended types with relations
export type BudgetWithTransactions = Budget & {
  transactions: Transaction[]
}

export type TransactionWithCategory = Transaction & {
  category: Category | null
}

export type BudgetWithDetails = Budget & {
  transactions: TransactionWithCategory[]
  _count: {
    transactions: number
  }
  _sum: {
    amount: number
  }
}
