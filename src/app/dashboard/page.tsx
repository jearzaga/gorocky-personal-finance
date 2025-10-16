import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id)
    .single()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome back, {profile?.display_name || user?.email}!
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        <div className="border rounded-lg p-6 bg-white dark:bg-slate-900">
          <h3 className="font-semibold mb-2">Total Budgets</h3>
          <p className="text-3xl font-bold">0</p>
        </div>
        <div className="border rounded-lg p-6 bg-white dark:bg-slate-900">
          <h3 className="font-semibold mb-2">Total Transactions</h3>
          <p className="text-3xl font-bold">0</p>
        </div>
        <div className="border rounded-lg p-6 bg-white dark:bg-slate-900">
          <h3 className="font-semibold mb-2">This Month</h3>
          <p className="text-3xl font-bold">$0.00</p>
        </div>
      </div>
    </div>
  )
}
