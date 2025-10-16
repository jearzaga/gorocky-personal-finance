-- Create transactions table (1:N relationship - one budget has many transactions)
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  budget_id uuid not null references public.budgets(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  amount decimal(10,2) not null check (amount != 0),
  description text,
  transaction_date date not null default current_date,
  type text not null check (type in ('income', 'expense')) default 'expense',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.transactions enable row level security;

-- Policies: Users can only CRUD transactions from their own budgets
create policy "Users can view own transactions"
  on public.transactions for select
  using (
    exists (
      select 1 from public.budgets
      where budgets.id = transactions.budget_id
      and budgets.user_id = auth.uid()
    )
  );

create policy "Users can create own transactions"
  on public.transactions for insert
  with check (
    exists (
      select 1 from public.budgets
      where budgets.id = transactions.budget_id
      and budgets.user_id = auth.uid()
    )
  );

create policy "Users can update own transactions"
  on public.transactions for update
  using (
    exists (
      select 1 from public.budgets
      where budgets.id = transactions.budget_id
      and budgets.user_id = auth.uid()
    )
  );

create policy "Users can delete own transactions"
  on public.transactions for delete
  using (
    exists (
      select 1 from public.budgets
      where budgets.id = transactions.budget_id
      and budgets.user_id = auth.uid()
    )
  );

-- Create indexes for faster queries
create index if not exists transactions_budget_id_idx on public.transactions(budget_id);
create index if not exists transactions_category_id_idx on public.transactions(category_id);
create index if not exists transactions_date_idx on public.transactions(transaction_date desc);
create index if not exists transactions_created_at_idx on public.transactions(created_at desc);

-- Trigger to automatically update updated_at
create trigger set_transactions_updated_at
  before update on public.transactions
  for each row
  execute procedure public.handle_updated_at();
