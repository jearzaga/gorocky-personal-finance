import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { TransactionList } from '@/components/transactions/transaction-list'
import { DeleteBudgetButton } from '@/components/budgets/delete-budget-button'
import { EditBudgetDialog } from '@/components/budgets/edit-budget-dialog'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function BudgetDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: budget } = await supabase
    .from('budgets')
    .select('*')
    .eq('id', id)
    .eq('user_id', user?.id)
    .single()

  if (!budget) {
    notFound()
  }

  const { data: transactions } = await supabase
    .from('transactions')
    .select(`
      *,
      categories (
        id,
        name,
        icon,
        color
      )
    `)
    .eq('budget_id', id)
    .order('transaction_date', { ascending: false })

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  // Calculate totals
  const totalExpenses = transactions
    ?.filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0) || 0
  
  const totalIncome = transactions
    ?.filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0) || 0

  const remaining = budget.amount - totalExpenses + totalIncome
  const percentUsed = ((totalExpenses - totalIncome) / budget.amount) * 100

  return (
    <div className="space-y-6">
      {/* Header - Responsive */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/budgets">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">{budget.name}</h1>
            <p className="text-sm sm:text-base text-muted-foreground capitalize">
              {budget.period} budget
            </p>
          </div>
        </div>
        <div className="flex gap-2 justify-end sm:justify-start">
          <EditBudgetDialog budget={budget} />
          <DeleteBudgetButton budgetId={budget.id} />
        </div>
      </div>

      {/* Budget Summary Cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Budget Amount</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${budget.amount.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Spent</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${totalExpenses.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Income</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${totalIncome.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Remaining</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${remaining.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {percentUsed.toFixed(1)}% used
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Budget Progress</span>
              <span className="font-medium">{percentUsed.toFixed(1)}%</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  percentUsed > 100 ? 'bg-red-500' : 
                  percentUsed > 80 ? 'bg-yellow-500' : 
                  'bg-green-500'
                }`}
                style={{ width: `${Math.min(percentUsed, 100)}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Section - Responsive */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl sm:text-2xl font-bold">Transactions</h2>
        <Button asChild className="w-full sm:w-auto">
          <Link href={`/dashboard/budgets/${budget.id}/transactions/new`}>
            <Plus className="mr-2 h-4 w-4" />
            Add Transaction
          </Link>
        </Button>
      </div>

      <TransactionList 
        transactions={transactions || []} 
        categories={categories || []}
        budgetId={budget.id}
      />
    </div>
  )
}
