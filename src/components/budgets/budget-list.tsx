import Link from 'next/link'
import { Calendar, DollarSign } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Budget } from '@/types'

interface BudgetListProps {
  budgets: Budget[]
}

export function BudgetList({ budgets }: BudgetListProps) {
  if (budgets.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No budgets yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Create your first budget to start tracking your spending
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {budgets.map((budget) => (
        <Link key={budget.id} href={`/dashboard/budgets/${budget.id}`}>
          <Card className="hover:border-primary transition-colors cursor-pointer">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-xl">{budget.name}</CardTitle>
                <Badge variant="secondary" className="capitalize">
                  {budget.period}
                </Badge>
              </div>
              <CardDescription className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Created {new Date(budget.created_at).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                ${budget.amount.toFixed(2)}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {budget.period} budget
              </p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
