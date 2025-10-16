export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string | null
          currency: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name?: string | null
          currency?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          display_name?: string | null
          currency?: string
          created_at?: string
          updated_at?: string
        }
      }
      budgets: {
        Row: {
          id: string
          user_id: string
          name: string
          amount: number
          period: 'monthly' | 'weekly' | 'yearly'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          amount: number
          period: 'monthly' | 'weekly' | 'yearly'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          amount?: number
          period?: 'monthly' | 'weekly' | 'yearly'
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          budget_id: string
          category_id: string | null
          amount: number
          description: string | null
          transaction_date: string
          type: 'income' | 'expense'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          budget_id: string
          category_id?: string | null
          amount: number
          description?: string | null
          transaction_date?: string
          type?: 'income' | 'expense'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          budget_id?: string
          category_id?: string | null
          amount?: number
          description?: string | null
          transaction_date?: string
          type?: 'income' | 'expense'
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          icon: string | null
          color: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          icon?: string | null
          color?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          icon?: string | null
          color?: string | null
          created_at?: string
        }
      }
      user_categories: {
        Row: {
          user_id: string
          category_id: string
          is_favorite: boolean
          created_at: string
        }
        Insert: {
          user_id: string
          category_id: string
          is_favorite?: boolean
          created_at?: string
        }
        Update: {
          user_id?: string
          category_id?: string
          is_favorite?: boolean
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
