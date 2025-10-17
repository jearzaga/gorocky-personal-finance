import { Calendar, Tag } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DeleteTransactionButton } from './delete-transaction-button'
import { EditTransactionDialog } from './edit-transaction-dialog'
import type { Transaction, Category } from '@/types'

interface TransactionWithCategory extends Transaction {
  categories: Category | null
}

interface TransactionListProps {
  transactions: TransactionWithCategory[]
  categories: Category[]
  budgetId: string
}

export function TransactionList({ transactions, categories, budgetId }: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Tag className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No transactions yet</h3>
          <p className="text-sm text-muted-foreground">
            Add your first transaction to start tracking
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {transactions.map((transaction) => (
        <Card key={transaction.id}>
          <CardContent className="pt-6">
            {/* Mobile and Desktop Layout */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              {/* Left section - Transaction details */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="font-semibold truncate">
                    {transaction.description || 'Untitled Transaction'}
                  </h3>
                  <Badge variant={transaction.type === 'income' ? 'default' : 'secondary'}>
                    {transaction.type}
                  </Badge>
                  {transaction.categories && (
                    <Badge variant="outline" className="truncate">
                      {transaction.categories.icon} {transaction.categories.name}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(transaction.transaction_date).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Right section - Amount and actions */}
              <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
                <div className={`text-2xl font-bold whitespace-nowrap ${
                  transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
                </div>
                <div className="flex gap-2 shrink-0">
                  <EditTransactionDialog 
                    transaction={transaction} 
                    categories={categories}
                    budgetId={budgetId}
                  />
                  <DeleteTransactionButton 
                    transactionId={transaction.id}
                    budgetId={budgetId}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
