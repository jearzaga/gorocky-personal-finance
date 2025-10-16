import Link from 'next/link'
import { Plus, TrendingUp, TrendingDown, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database.types'

type Transaction = Database['public']['Tables']['transactions']['Row']
type Budget = Database['public']['Tables']['budgets']['Row']

interface TransactionWithBudget extends Transaction {
  budgets: { user_id: string }
}

interface DashboardStats {
  budgetCount: number
  transactionCount: number
  totalBudgeted: number
  totalExpenses: number
  totalIncome: number
  monthlyExpenses: number
}

function calculateStats(
  budgets: Budget[] | null,
  transactions: TransactionWithBudget[] | null
): DashboardStats {
  const budgetCount = budgets?.length || 0
  const transactionCount = transactions?.length || 0
  const totalBudgeted = budgets?.reduce((sum, budget) => sum + budget.amount, 0) || 0
  
  const totalExpenses = transactions
    ?.filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0) || 0

  const totalIncome = transactions
    ?.filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0) || 0

  const thisMonth = new Date().toISOString().slice(0, 7)
  const monthlyTransactions = transactions?.filter(t => 
    t.transaction_date.startsWith(thisMonth)
  ) || []
  
  const monthlyExpenses = monthlyTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0)

  return {
    budgetCount,
    transactionCount,
    totalBudgeted,
    totalExpenses,
    totalIncome,
    monthlyExpenses,
  }
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const budgetsResult = await supabase
    .from('budgets')
    .select('id, user_id, name, amount, period, created_at, updated_at')
    .eq('user_id', user.id)

  const budgets = budgetsResult.data as Budget[] | null

  const transactionsResult = await supabase
    .from('transactions')
    .select('id, budget_id, category_id, amount, description, transaction_date, type, created_at, updated_at, budgets!inner(user_id)')
    .eq('budgets.user_id', user.id)

  const transactions = transactionsResult.data as unknown as TransactionWithBudget[] | null

  const stats = calculateStats(budgets, transactions)
  const recentTransactions = transactions?.slice(0, 5) || []
  const currentMonth = new Date().toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  })

  return (
    <div className="space-y-6">
      <DashboardHeader />
      <StatsCards stats={stats} currentMonth={currentMonth} />
      <ActionsAndActivity transactions={recentTransactions} />
    </div>
  )
}

function DashboardHeader() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your finances</p>
      </div>
      <Button asChild>
        <Link href="/dashboard/budgets/new">
          <Plus className="mr-2 h-4 w-4" />
          New Budget
        </Link>
      </Button>
    </div>
  )
}

function StatsCards({ stats, currentMonth }: { stats: DashboardStats; currentMonth: string }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Budgets"
        value={stats.budgetCount}
        subtitle={`$${stats.totalBudgeted.toFixed(2)} allocated`}
        icon={Wallet}
      />
      <StatCard
        title="Total Transactions"
        value={stats.transactionCount}
        subtitle="All time"
        icon={TrendingUp}
      />
      <StatCard
        title="Total Spent"
        value={`$${stats.totalExpenses.toFixed(2)}`}
        subtitle="All time expenses"
        icon={TrendingDown}
        valueClassName="text-red-600"
      />
      <StatCard
        title="This Month"
        value={`$${stats.monthlyExpenses.toFixed(2)}`}
        subtitle={currentMonth}
        icon={TrendingDown}
        valueClassName="text-orange-600"
      />
    </div>
  )
}

interface StatCardProps {
  title: string
  value: string | number
  subtitle: string
  icon: React.ComponentType<{ className?: string }>
  valueClassName?: string
}

function StatCard({ title, value, subtitle, icon: Icon, valueClassName }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${valueClassName || ''}`}>
          {value}
        </div>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </CardContent>
    </Card>
  )
}

function ActionsAndActivity({ transactions }: { transactions: Transaction[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <QuickActionsCard />
      <RecentActivityCard transactions={transactions} />
    </div>
  )
}

function QuickActionsCard() {
  const actions = [
    {
      href: '/dashboard/budgets/new',
      icon: Plus,
      label: 'Create New Budget',
    },
    {
      href: '/dashboard/budgets',
      icon: Wallet,
      label: 'View All Budgets',
    },
    {
      href: '/dashboard/today',
      icon: TrendingUp,
      label: "Today's Transactions",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Manage your finances</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {actions.map((action) => (
          <Button
            key={action.href}
            asChild
            variant="outline"
            className="w-full justify-start"
          >
            <Link href={action.href}>
              <action.icon className="mr-2 h-4 w-4" />
              {action.label}
            </Link>
          </Button>
        ))}
      </CardContent>
    </Card>
  )
}

function RecentActivityCard({ transactions }: { transactions: Transaction[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Your latest transactions</CardDescription>
      </CardHeader>
      <CardContent>
        {transactions.length > 0 ? (
          <div className="space-y-2">
            {transactions.map((transaction) => (
              <TransactionItem key={transaction.id} transaction={transaction} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No transactions yet</p>
        )}
      </CardContent>
    </Card>
  )
}

function TransactionItem({ transaction }: { transaction: Transaction }) {
  const isIncome = transaction.type === 'income'
  const amount = Math.abs(transaction.amount)
  const date = new Date(transaction.transaction_date).toLocaleDateString()

  return (
    <div className="flex items-center justify-between text-sm">
      <div>
        <p className="font-medium">{transaction.description || 'Untitled'}</p>
        <p className="text-xs text-muted-foreground">{date}</p>
      </div>
      <span className={`font-semibold ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
        {isIncome ? '+' : '-'}${amount.toFixed(2)}
      </span>
    </div>
  )
}
