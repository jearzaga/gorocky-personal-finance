import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { TransactionForm } from '@/components/transactions/transaction-form'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function NewTransactionPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Verify budget exists and belongs to user
  const { data: budget } = await supabase
    .from('budgets')
    .select('*')
    .eq('id', id)
    .eq('user_id', user?.id)
    .single()

  if (!budget) {
    notFound()
  }

  // Get all user's budgets for the form
  const { data: budgets } = await supabase
    .from('budgets')
    .select('*')
    .eq('user_id', user?.id)
    .order('name')

  // Get categories
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/dashboard/budgets/${budget.id}`}>
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add Transaction</h1>
          <p className="text-muted-foreground">
            Create a new transaction for {budget.name}
          </p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Transaction Details</CardTitle>
          <CardDescription>
            Enter the details for your new transaction
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TransactionForm 
            budgets={budgets || []}
            categories={categories || []}
            defaultBudgetId={budget.id}
          />
        </CardContent>
      </Card>
    </div>
  )
}
