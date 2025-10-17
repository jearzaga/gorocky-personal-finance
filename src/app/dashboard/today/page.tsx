import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { TransactionList } from '@/components/transactions/transaction-list'
import { Calendar, TrendingDown, TrendingUp, DollarSign } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default async function TodayPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const today = new Date().toISOString().split('T')[0]

  // Get today's transactions across all budgets
  const { data: transactions } = await supabase
    .from('transactions')
    .select(`
      *,
      categories (
        id,
        name,
        icon,
        color
      ),
      budgets!inner (
        id,
        name,
        user_id
      )
    `)
    .eq('budgets.user_id', user?.id)
    .eq('transaction_date', today)
    .order('created_at', { ascending: false })

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  // Calculate today's totals
  const todayExpenses = transactions
    ?.filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0) || 0
  
  const todayIncome = transactions
    ?.filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0) || 0

  const netTotal = todayIncome - todayExpenses

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Today&apos;s Activity</h1>
        <p className="text-muted-foreground">
          Track all your transactions for {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {/* Daily Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Total Transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {transactions?.length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              Income
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              +${todayIncome.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-600" />
              Expenses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              -${todayExpenses.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Net Total
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              netTotal >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {netTotal >= 0 ? '+' : ''}{netTotal.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Today&apos;s Transactions</h2>
          {transactions && transactions.length > 0 && (
            <Badge variant="secondary">
              {transactions.length} {transactions.length === 1 ? 'transaction' : 'transactions'}
            </Badge>
          )}
        </div>
        
        {transactions && transactions.length > 0 ? (
          <TransactionList 
            transactions={transactions} 
            categories={categories || []}
            budgetId={transactions[0]?.budget_id || ''}
          />
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No transactions today</h3>
              <p className="text-sm text-muted-foreground">
                Start by adding transactions to your budgets
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
