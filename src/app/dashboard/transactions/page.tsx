import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { TransactionList } from '@/components/transactions/transaction-list'
import { Receipt, TrendingDown, TrendingUp, DollarSign } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default async function TransactionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get all transactions across all budgets
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
    .order('transaction_date', { ascending: false })
    .order('created_at', { ascending: false })

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  const { data: budgets } = await supabase
    .from('budgets')
    .select('id, name')
    .eq('user_id', user?.id)
    .order('name')

  // Calculate totals
  const totalExpenses = transactions
    ?.filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0) || 0
  
  const totalIncome = transactions
    ?.filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0) || 0

  const netTotal = totalIncome - totalExpenses

  // Group transactions by date
  const transactionsByDate = transactions?.reduce((groups, transaction) => {
    const date = transaction.transaction_date
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(transaction)
    return groups
  }, {} as Record<string, typeof transactions>) || {}

  const sortedDates = Object.keys(transactionsByDate).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  )

  return (
    <div className="space-y-6">
      {/* Header - Responsive */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">All Transactions</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            View and manage all your transactions across budgets
          </p>
        </div>
        {budgets && budgets.length > 0 && (
          <Button asChild className="w-full sm:w-auto">
            <Link href={`/dashboard/budgets/${budgets[0].id}`}>
              <Plus className="h-4 w-4 mr-2" />
              Add Transaction
            </Link>
          </Button>
        )}
      </div>

      {/* Summary Cards - Responsive */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Receipt className="h-4 w-4" />
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
              Total Income
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              +${totalIncome.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-600" />
              Total Expenses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              -${totalExpenses.toFixed(2)}
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
              {netTotal >= 0 ? '+' : ''}${netTotal.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions List grouped by date */}
      <div className="space-y-6">
        {sortedDates.length > 0 ? (
          sortedDates.map(date => (
            <div key={date} className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  {new Date(date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h2>
                <Badge variant="secondary">
                  {transactionsByDate[date].length} {transactionsByDate[date].length === 1 ? 'transaction' : 'transactions'}
                </Badge>
              </div>
              <TransactionList 
                transactions={transactionsByDate[date]} 
                categories={categories || []}
                budgetId={transactionsByDate[date][0]?.budget_id || ''}
              />
            </div>
          ))
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No transactions yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Start by creating a budget and adding transactions
              </p>
              <Button asChild>
                <Link href="/dashboard/budgets">
                  Go to Budgets
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
